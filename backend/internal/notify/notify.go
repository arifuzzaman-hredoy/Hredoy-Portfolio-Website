// Package notify delivers transactional email for the contact form.
//
// Delivery is optional. When SMTP_HOST, SMTP_FROM and CONTACT_NOTIFY_TO are
// all set the mailer is enabled and a copy of every contact message is emailed
// to the site owner; otherwise messages are only stored in the database and
// read in the admin inbox.
package notify

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// Config is the SMTP configuration. Port defaults to 587 when empty.
type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
	To       string
}

// ContactMessage is one submission of the public contact form.
type ContactMessage struct {
	Name    string
	Email   string
	Subject string
	Message string
}

// Mailer sends email over SMTP. The zero value is disabled.
type Mailer struct {
	cfg  Config
	addr string
}

// New returns a Mailer for cfg. Call Enabled before use.
func New(cfg Config) *Mailer {
	port := strings.TrimSpace(cfg.Port)
	if port == "" {
		port = "587"
	}
	cfg.Host = strings.TrimSpace(cfg.Host)
	return &Mailer{cfg: cfg, addr: net.JoinHostPort(cfg.Host, port)}
}

// Enabled reports whether enough configuration is present to send mail.
func (m *Mailer) Enabled() bool {
	return m != nil &&
		m.cfg.Host != "" &&
		strings.TrimSpace(m.cfg.From) != "" &&
		strings.TrimSpace(m.cfg.To) != ""
}

// Contact emails one contact-form submission. It returns nil when the mailer
// is disabled, so callers can always invoke it.
func (m *Mailer) Contact(ctx context.Context, msg ContactMessage) error {
	if !m.Enabled() {
		return nil
	}

	name := singleLine(msg.Name)
	email := singleLine(msg.Email)
	subject := singleLine(msg.Subject)
	if subject == "" {
		subject = "New message"
	}

	var body strings.Builder
	body.WriteString("New contact form message\r\n\r\n")
	body.WriteString("Name: " + name + "\r\n")
	body.WriteString("Email: " + email + "\r\n")
	body.WriteString("Subject: " + subject + "\r\n\r\n")
	body.WriteString(strings.ReplaceAll(msg.Message, "\r\n", "\n"))
	body.WriteString("\r\n")

	headers := []string{
		"From: " + singleLine(m.cfg.From),
		"To: " + singleLine(m.cfg.To),
		"Subject: [Portfolio] " + subject,
		"Date: " + time.Now().Format(time.RFC1123Z),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=utf-8",
	}
	if email != "" {
		if name != "" {
			headers = append(headers, "Reply-To: "+name+" <"+email+">")
		} else {
			headers = append(headers, "Reply-To: "+email)
		}
	}

	raw := strings.Join(headers, "\r\n") + "\r\n\r\n" + body.String()
	return m.send(ctx, raw)
}

func (m *Mailer) send(ctx context.Context, raw string) error {
	dialer := net.Dialer{Timeout: 10 * time.Second}
	conn, err := dialer.DialContext(ctx, "tcp", m.addr)
	if err != nil {
		return fmt.Errorf("dial smtp: %w", err)
	}
	defer conn.Close()
	if deadline, ok := ctx.Deadline(); ok {
		_ = conn.SetDeadline(deadline)
	}

	client, err := smtp.NewClient(conn, m.cfg.Host)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer client.Close()

	if ok, _ := client.Extension("STARTTLS"); ok {
		if err := client.StartTLS(&tls.Config{ServerName: m.cfg.Host, MinVersion: tls.VersionTLS12}); err != nil {
			return fmt.Errorf("starttls: %w", err)
		}
	}

	if strings.TrimSpace(m.cfg.Username) != "" {
		auth := smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}

	from := singleLine(m.cfg.From)
	if err := client.Mail(from); err != nil {
		return fmt.Errorf("smtp mail from: %w", err)
	}
	for _, rcpt := range splitRecipients(m.cfg.To) {
		if err := client.Rcpt(rcpt); err != nil {
			return fmt.Errorf("smtp rcpt: %w", err)
		}
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := w.Write([]byte(raw)); err != nil {
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("smtp close data: %w", err)
	}
	return client.Quit()
}

// singleLine collapses newlines so a form field cannot inject extra headers.
func singleLine(s string) string {
	s = strings.ReplaceAll(s, "\r", " ")
	s = strings.ReplaceAll(s, "\n", " ")
	return strings.TrimSpace(s)
}

func splitRecipients(list string) []string {
	parts := strings.Split(list, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if v := singleLine(part); v != "" {
			out = append(out, v)
		}
	}
	return out
}

package notify

import (
	"context"
	"net"
	"net/textproto"
	"strings"
	"testing"
	"time"
)

// serveFakeSMTP speaks just enough SMTP for one message and pushes the DATA
// payload into got.
func serveFakeSMTP(t *testing.T, ln net.Listener, got chan<- string) {
	t.Helper()
	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go handleFakeConn(conn, got)
		}
	}()
}

func handleFakeConn(conn net.Conn, got chan<- string) {
	defer conn.Close()
	tp := textproto.NewConn(conn)
	if err := tp.PrintfLine("220 fake ESMTP"); err != nil {
		return
	}

	var data strings.Builder
	inData := false
	for {
		line, err := tp.ReadLine()
		if err != nil {
			return
		}
		if inData {
			if line == "." {
				inData = false
				got <- data.String()
				_ = tp.PrintfLine("250 OK")
				continue
			}
			data.WriteString(line + "\n")
			continue
		}

		cmd := strings.ToUpper(line)
		switch {
		case strings.HasPrefix(cmd, "EHLO"):
			_ = tp.PrintfLine("250-fake")
			_ = tp.PrintfLine("250 OK")
		case strings.HasPrefix(cmd, "HELO"):
			_ = tp.PrintfLine("250 OK")
		case strings.HasPrefix(cmd, "MAIL"), strings.HasPrefix(cmd, "RCPT"):
			_ = tp.PrintfLine("250 OK")
		case strings.HasPrefix(cmd, "DATA"):
			_ = tp.PrintfLine("354 go ahead")
			inData = true
		case strings.HasPrefix(cmd, "QUIT"):
			_ = tp.PrintfLine("221 bye")
			return
		default:
			_ = tp.PrintfLine("250 OK")
		}
	}
}

func TestContactSendsMessage(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()

	got := make(chan string, 1)
	serveFakeSMTP(t, ln, got)

	host, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		t.Fatalf("split host port: %v", err)
	}

	mailer := New(Config{
		Host: host,
		Port: port,
		From: "bot@oxytumzone.com",
		To:   "arifuzzamanhredoy@gmail.com",
	})
	if !mailer.Enabled() {
		t.Fatal("mailer should be enabled")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = mailer.Contact(ctx, ContactMessage{
		Name:    "Jane Doe",
		Email:   "jane@example.com",
		Subject: "Hello there",
		Message: "I would like to talk about a project.",
	})
	if err != nil {
		t.Fatalf("contact: %v", err)
	}

	select {
	case raw := <-got:
		for _, want := range []string{
			"From: bot@oxytumzone.com",
			"To: arifuzzamanhredoy@gmail.com",
			"Subject: [Portfolio] Hello there",
			"Reply-To: Jane Doe <jane@example.com>",
			"Name: Jane Doe",
			"Email: jane@example.com",
			"I would like to talk about a project.",
		} {
			if !strings.Contains(raw, want) {
				t.Errorf("message missing %q\n---\n%s", want, raw)
			}
		}
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for the message")
	}
}

func TestContactStripsHeaderInjection(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()

	got := make(chan string, 1)
	serveFakeSMTP(t, ln, got)

	host, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		t.Fatalf("split host port: %v", err)
	}

	mailer := New(Config{Host: host, Port: port, From: "bot@oxytumzone.com", To: "owner@oxytumzone.com"})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = mailer.Contact(ctx, ContactMessage{
		Name:    "Jane\r\nBcc: evil@example.com",
		Email:   "jane@example.com\r\nBcc: evil@example.com",
		Subject: "Hi\r\nBcc: evil@example.com",
		Message: "body",
	})
	if err != nil {
		t.Fatalf("contact: %v", err)
	}

	select {
	case raw := <-got:
		for _, line := range strings.Split(raw, "\n") {
			if strings.HasPrefix(strings.ToLower(strings.TrimSpace(line)), "bcc:") {
				t.Errorf("injected header survived as its own line:\n%s", raw)
			}
		}
		if !strings.Contains(raw, "Reply-To: Jane  Bcc: evil@example.com <jane@example.com  Bcc: evil@example.com>") {
			t.Errorf("name/email were not collapsed to one line:\n%s", raw)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for the message")
	}
}

func TestDisabledMailerIsNoop(t *testing.T) {
	mailer := New(Config{})
	if mailer.Enabled() {
		t.Fatal("empty config should be disabled")
	}
	if err := mailer.Contact(context.Background(), ContactMessage{Name: "Jane"}); err != nil {
		t.Fatalf("disabled mailer returned an error: %v", err)
	}

	var nilMailer *Mailer
	if nilMailer.Enabled() {
		t.Fatal("nil mailer should be disabled")
	}
	if err := nilMailer.Contact(context.Background(), ContactMessage{}); err != nil {
		t.Fatalf("nil mailer returned an error: %v", err)
	}
}

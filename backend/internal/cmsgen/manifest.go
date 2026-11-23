// Package cmsgen holds the code-owned manifest of editable content keys.
//
// The manifest is the single source of truth for:
//   - which keys the admin Content page shows, and in what order/grouping,
//   - the editor type for each key (text, html, number, url, email, list),
//   - the default value used by "reset to default" and by the public renderer
//     when the CMS has no override.
//
// Adding a new editable region to the public site is a one-line addition here
// plus one rule in frontend/src/lib/cms-render.ts.
package cmsgen

// Type is the editor type for a content block.
type Type string

const (
	TypeText     Type = "text"
	TypeHTML     Type = "html"
	TypeRichText Type = "richtext"
	TypeNumber   Type = "number"
	TypeURL      Type = "url"
	TypeEmail    Type = "email"
	TypeList     Type = "list"
)

// Valid reports whether t is a type the admin UI knows how to render.
func (t Type) Valid() bool {
	switch t {
	case TypeText, TypeHTML, TypeRichText, TypeNumber, TypeURL, TypeEmail, TypeList:
		return true
	}
	return false
}

// Entry is one editable content key.
type Entry struct {
	Key     string
	Label   string
	Group   string
	Type    Type
	Default string
	Hint    string
}

// SortOrder is the 1-based position of the entry in the manifest.
type OrderedEntry struct {
	Entry
	SortOrder int32
}

// Manifest lists every editable key in the order the admin UI renders them.
// The order also defines the group order (Hero, About, Stats, ...).
var Manifest = []Entry{
	// --- SEO -------------------------------------------------------------
	{Key: "seo.title", Label: "Browser title", Group: "SEO", Type: TypeText,
		Default: "Hredoy's Portfolio — Junior DevOps Engineer"},
	{Key: "seo.description", Label: "Meta description", Group: "SEO", Type: TypeText,
		Default: "Arifuzzaman Hredoy — Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code."},
	{Key: "seo.keywords", Label: "Meta keywords", Group: "SEO", Type: TypeText,
		Default: "DevOps, Linux, Cloud, CI/CD, Docker, Kubernetes, AWS, Terraform, Portfolio",
		Hint:    "Comma separated."},

	// --- Navbar ----------------------------------------------------------
	{Key: "nav.home", Label: "Home link", Group: "Navbar", Type: TypeText, Default: "Home"},
	{Key: "nav.skills", Label: "Skills link", Group: "Navbar", Type: TypeText, Default: "Skills"},
	{Key: "nav.projects", Label: "Projects link", Group: "Navbar", Type: TypeText, Default: "Projects"},
	{Key: "nav.contact", Label: "Contact link", Group: "Navbar", Type: TypeText, Default: "Contact"},
	{Key: "nav.group.core", Label: "Skills menu group 1", Group: "Navbar", Type: TypeText, Default: "Core DevOps"},
	{Key: "nav.group.cloud", Label: "Skills menu group 2", Group: "Navbar", Type: TypeText, Default: "Cloud & Ops"},
	{Key: "nav.links", Label: "Links menu", Group: "Navbar", Type: TypeText, Default: "Links"},

	// --- Hero ------------------------------------------------------------
	{Key: "hero.headline.1", Label: "Headline line 1", Group: "Hero", Type: TypeText, Default: "Junior"},
	{Key: "hero.headline.2", Label: "Headline line 2", Group: "Hero", Type: TypeText, Default: "DevOps"},
	{Key: "hero.headline.3", Label: "Headline line 3", Group: "Hero", Type: TypeText, Default: "Engineer"},
	{Key: "hero.brackets", Label: "Brackets row", Group: "Hero", Type: TypeList,
		Default: "BUILD\nAUTOMATE\nSCALE\nDEPLOY",
		Hint:    "One item per line."},
	{Key: "hero.desc", Label: "Description", Group: "Hero", Type: TypeText,
		Default: "I'm Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills."},
	{Key: "hero.cta", Label: "Button label", Group: "Hero", Type: TypeText, Default: "Get In Touch"},
	{Key: "hero.proof", Label: "Proof line", Group: "Hero", Type: TypeText,
		Default: "Building reliable infrastructure with modern DevOps practices",
		Hint:    "Use a new line to force a line break."},
	{Key: "hero.tags", Label: "Skill tags", Group: "Hero", Type: TypeList,
		Default: "Linux\nCI/CD\nGit\nNginx\nGitHub Actions",
		Hint:    "One item per line."},

	// --- About -----------------------------------------------------------
	{Key: "about.eyebrow", Label: "Eyebrow", Group: "About", Type: TypeText, Default: "About Me"},
	{Key: "about.headline", Label: "Headline", Group: "About", Type: TypeText,
		Default: "Passionate About Building Reliable Infrastructure"},
	{Key: "about.paragraph", Label: "Paragraph", Group: "About", Type: TypeHTML,
		Default: "I'm Arifuzzaman Hredoy, currently pursuing a Diploma in Engineering in Computer Science & Technology at Rangpur Polytechnic Institute. I'm building practical skills in Linux, Docker, AWS, Terraform, and CI/CD through hands-on projects.",
		Hint:    "Basic HTML is allowed, for example <strong>bold</strong>."},
	{Key: "about.feature.1.title", Label: "Feature 1 title", Group: "About", Type: TypeText, Default: "Linux Administration"},
	{Key: "about.feature.1.desc", Label: "Feature 1 text", Group: "About", Type: TypeText,
		Default: "Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting."},
	{Key: "about.feature.2.title", Label: "Feature 2 title", Group: "About", Type: TypeText, Default: "Cloud & AWS"},
	{Key: "about.feature.2.desc", Label: "Feature 2 text", Group: "About", Type: TypeText,
		Default: "Deploying and managing cloud infrastructure on AWS, working with EC2, VPC, and IAM."},
	{Key: "about.feature.3.title", Label: "Feature 3 title", Group: "About", Type: TypeText, Default: "CI/CD & Automation"},
	{Key: "about.feature.3.desc", Label: "Feature 3 text", Group: "About", Type: TypeText,
		Default: "Building automated pipelines with GitHub Actions, Docker, and GHCR for continuous integration and delivery."},

	// --- Stats -----------------------------------------------------------
	{Key: "stats.tools.value", Label: "Tools value", Group: "Stats", Type: TypeNumber, Default: "20",
		Hint: "Shown by the animated counter."},
	{Key: "stats.tools.label", Label: "Tools label", Group: "Stats", Type: TypeText,
		Default: "DevOps tools and technologies I practice"},
	{Key: "stats.projects.value", Label: "Projects value", Group: "Stats", Type: TypeNumber, Default: "13",
		Hint: "Shown by the animated counter."},
	{Key: "stats.projects.label", Label: "Projects label", Group: "Stats", Type: TypeText,
		Default: "Hands-on DevOps projects on GitHub"},
	{Key: "stats.live.value", Label: "Live value", Group: "Stats", Type: TypeNumber, Default: "1",
		Hint: "Shown by the animated counter."},
	{Key: "stats.live.label", Label: "Live label", Group: "Stats", Type: TypeText,
		Default: "Live deployment on AWS EC2"},

	// --- Mission ---------------------------------------------------------
	{Key: "mission.eyebrow", Label: "Eyebrow", Group: "Mission", Type: TypeText, Default: "My Mission"},
	{Key: "mission.text", Label: "Headline", Group: "Mission", Type: TypeText,
		Default: "Continuously learning and building practical DevOps skills to become a professional DevOps Engineer."},
	{Key: "mission.cta", Label: "Button label", Group: "Mission", Type: TypeText, Default: "Get In Touch"},
	{Key: "mission.loc.title", Label: "Location block title", Group: "Mission", Type: TypeText, Default: "Location"},
	{Key: "mission.loc.location", Label: "Location", Group: "Mission", Type: TypeText, Default: "Rangpur, Bangladesh"},
	{Key: "mission.loc.email_label", Label: "Email label", Group: "Mission", Type: TypeText, Default: "Email:"},
	{Key: "mission.loc.github_label", Label: "GitHub label", Group: "Mission", Type: TypeText, Default: "GitHub:"},
	{Key: "mission.edu.degree", Label: "Education degree", Group: "Mission", Type: TypeText,
		Default: "Diploma in Engineering — Computer Science & Technology"},
	{Key: "mission.edu.institute", Label: "Education institute", Group: "Mission", Type: TypeText,
		Default: "Rangpur Polytechnic Institute"},
	{Key: "mission.edu.semester", Label: "Education semester", Group: "Mission", Type: TypeText,
		Default: "3rd Semester"},
	{Key: "mission.edu.gpa", Label: "Education GPA", Group: "Mission", Type: TypeText,
		Default: "3.93 (1st) · 3.69 (2nd)"},

	// --- Skills ----------------------------------------------------------
	{Key: "skills.eyebrow", Label: "Eyebrow", Group: "Skills", Type: TypeText, Default: "My Skills"},
	{Key: "skills.title", Label: "Title", Group: "Skills", Type: TypeText, Default: "Technical Skills & Tools."},
	{Key: "skills.desc", Label: "Description", Group: "Skills", Type: TypeText,
		Default: "Continuously learning and expanding my DevOps skillset across the modern cloud-native stack."},
	{Key: "skills.cta", Label: "Button label", Group: "Skills", Type: TypeText, Default: "Get In Touch"},

	// --- Process ---------------------------------------------------------
	{Key: "process.eyebrow", Label: "Eyebrow", Group: "Process", Type: TypeText, Default: "My Journey"},
	{Key: "process.title", Label: "Title", Group: "Process", Type: TypeText, Default: "The Process"},
	{Key: "process.desc", Label: "Description", Group: "Process", Type: TypeText,
		Default: "How I'm growing into a DevOps Engineer, from fundamentals to hands-on projects."},

	// --- Call to action --------------------------------------------------
	{Key: "cta.eyebrow", Label: "Eyebrow", Group: "Call to action", Type: TypeText,
		Default: "Looking for my first DevOps role"},
	{Key: "cta.desc", Label: "Description", Group: "Call to action", Type: TypeText,
		Default: "I'm looking for a junior DevOps or cloud role where I can keep learning and contribute."},
	{Key: "cta.cta", Label: "Button label", Group: "Call to action", Type: TypeText, Default: "Get In Touch"},

	// --- Projects --------------------------------------------------------
	{Key: "projects.eyebrow", Label: "Eyebrow", Group: "Projects", Type: TypeText, Default: "Projects"},
	{Key: "projects.title", Label: "Title", Group: "Projects", Type: TypeText, Default: "Featured Projects",
		Hint: "Use a new line to force a line break."},
	{Key: "projects.desc", Label: "Description", Group: "Projects", Type: TypeText,
		Default: "A selection of hands-on DevOps projects covering Linux, Docker, CI/CD, AWS, Terraform, Kubernetes, and DevSecOps."},
	{Key: "projects.cta", Label: "Button label", Group: "Projects", Type: TypeText, Default: "All Projects"},
	{Key: "projects.other.eyebrow", Label: "Other Projects eyebrow", Group: "Projects", Type: TypeText, Default: "ENGINEERING LABS"},
	{Key: "projects.other.title", Label: "Other Projects title", Group: "Projects", Type: TypeText, Default: "Other Projects"},
	{Key: "projects.other.desc", Label: "Other Projects description", Group: "Projects", Type: TypeText,
		Default: "Additional hands-on engineering, automation labs, and infrastructure builds."},

	// --- Resume & CV -----------------------------------------------------
	{Key: "resume.eyebrow", Label: "Section eyebrow", Group: "Resume & CV", Type: TypeText,
		Default: "CURRICULUM VITAE & RESUME"},
	{Key: "resume.title", Label: "Section title", Group: "Resume & CV", Type: TypeText,
		Default: "Verified Credentials & Documents"},
	{Key: "resume.lead", Label: "Section description", Group: "Resume & CV", Type: TypeText,
		Default: "Download or preview my formal Curriculum Vitae and role-tailored DevOps Resume in standard document formats."},
	{Key: "resume.cv.title", Label: "CV card title", Group: "Resume & CV", Type: TypeText,
		Default: "Curriculum Vitae (CV)"},
	{Key: "resume.cv.badge", Label: "CV badge", Group: "Resume & CV", Type: TypeText,
		Default: "Full Academic & Technical Profile"},
	{Key: "resume.cv.desc", Label: "CV description", Group: "Resume & CV", Type: TypeText,
		Default: "Complete record of educational qualifications, polytechnic diploma, Linux & cloud training, extracurricular debates, and engineering achievements."},
	{Key: "resume.cv.format", Label: "CV format label", Group: "Resume & CV", Type: TypeText,
		Default: "PDF"},
	{Key: "resume.cv.updated", Label: "CV updated date", Group: "Resume & CV", Type: TypeText,
		Default: "Updated Nov 2026"},
	{Key: "resume.cv.file_url", Label: "CV file URL / path", Group: "Resume & CV", Type: TypeURL,
		Default: "/assets/docs/Arifuzzaman-Hredoy-DevOps-CV.pdf",
		Hint:    "Local path (/assets/docs/...) or external cloud link (Google Drive, Cloudinary, AWS S3, etc.)"},
	{Key: "resume.cv.file_size", Label: "CV file size", Group: "Resume & CV", Type: TypeText,
		Default: "1.2 MB"},
	{Key: "resume.resume.title", Label: "Resume card title", Group: "Resume & CV", Type: TypeText,
		Default: "DevOps Engineer Resume"},
	{Key: "resume.resume.badge", Label: "Resume badge", Group: "Resume & CV", Type: TypeText,
		Default: "ATS-Optimized · 1-Page"},
	{Key: "resume.resume.desc", Label: "Resume description", Group: "Resume & CV", Type: TypeText,
		Default: "Compact, recruiter-focused single-page resume highlighting production Docker, CI/CD pipelines, AWS EC2, Linux administration, and IaC skills."},
	{Key: "resume.resume.format", Label: "Resume format label", Group: "Resume & CV", Type: TypeText,
		Default: "PDF"},
	{Key: "resume.resume.updated", Label: "Resume updated date", Group: "Resume & CV", Type: TypeText,
		Default: "Updated Nov 2026"},
	{Key: "resume.resume.file_url", Label: "Resume file URL / path", Group: "Resume & CV", Type: TypeURL,
		Default: "/assets/docs/Arifuzzaman-Hredoy-DevOps-Resume.pdf",
		Hint:    "Local path (/assets/docs/...) or external cloud link (Google Drive, Cloudinary, AWS S3, etc.)"},
	{Key: "resume.resume.file_size", Label: "Resume file size", Group: "Resume & CV", Type: TypeText,
		Default: "240 KB"},

	// --- Contact ---------------------------------------------------------
	{Key: "contact.eyebrow", Label: "Eyebrow", Group: "Contact", Type: TypeText, Default: "Contact Me"},
	{Key: "contact.title", Label: "Title", Group: "Contact", Type: TypeText, Default: "Get in touch"},
	{Key: "contact.note", Label: "Note", Group: "Contact", Type: TypeText,
		Default: "Your message goes only to me and is never shared."},
	{Key: "contact.button", Label: "Button label", Group: "Contact", Type: TypeText, Default: "Send Message"},
	{Key: "contact.form.name", Label: "Name field placeholder", Group: "Contact", Type: TypeText,
		Default: "Your name"},
	{Key: "contact.form.email", Label: "Email field placeholder", Group: "Contact", Type: TypeText,
		Default: "Your email"},
	{Key: "contact.form.subject", Label: "Subject field placeholder", Group: "Contact", Type: TypeText,
		Default: "Your subject"},
	{Key: "contact.form.message", Label: "Message field placeholder", Group: "Contact", Type: TypeText,
		Default: "Your message"},

	// --- Footer ----------------------------------------------------------
	{Key: "footer.tagline", Label: "Tagline", Group: "Footer", Type: TypeText,
		Default: "Junior DevOps Engineer · Cloud · Linux Admin"},
	{Key: "footer.open", Label: "Availability label", Group: "Footer", Type: TypeText, Default: "Open to"},
	{Key: "footer.open_detail", Label: "Availability detail", Group: "Footer", Type: TypeText,
		Default: "Remote · Junior & Intern roles · Immediate"},
	{Key: "footer.subscribe", Label: "Newsletter title", Group: "Footer", Type: TypeText,
		Default: "Get updates on my new projects"},
	{Key: "footer.big_word", Label: "Large word", Group: "Footer", Type: TypeText,
		Default: "DEVOPS ENGINEER"},
	{Key: "footer.copyright", Label: "Copyright name", Group: "Footer", Type: TypeText,
		Default: "Arifuzzaman Hredoy"},
}

// Ordered returns the manifest with its 1-based sort order attached.
func Ordered() []OrderedEntry {
	out := make([]OrderedEntry, 0, len(Manifest))
	for i, entry := range Manifest {
		out = append(out, OrderedEntry{Entry: entry, SortOrder: int32(i + 1)})
	}
	return out
}

// ByKey indexes the manifest by key.
func ByKey() map[string]Entry {
	out := make(map[string]Entry, len(Manifest))
	for _, entry := range Manifest {
		out[entry.Key] = entry
	}
	return out
}

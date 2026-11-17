package config

import (
	"os"
	"testing"
)

func TestApplyDotEnvParsesValues(t *testing.T) {
	const key = "PORTFOLIO_TEST_DOTENV_KEY"
	old, had := os.LookupEnv(key)
	if err := os.Unsetenv(key); err != nil {
		t.Fatalf("unset: %v", err)
	}
	t.Cleanup(func() {
		if had {
			_ = os.Setenv(key, old)
		} else {
			_ = os.Unsetenv(key)
		}
	})

	applyDotEnv("# a comment\n" + key + "=\"quoted value\"\nPORTFOLIO_TEST_DOTENV_PLAIN=plain\n")

	if got := os.Getenv(key); got != "quoted value" {
		t.Fatalf("quoted key = %q, want %q", got, "quoted value")
	}
	if got := os.Getenv("PORTFOLIO_TEST_DOTENV_PLAIN"); got != "plain" {
		t.Fatalf("plain key = %q, want %q", got, "plain")
	}
}

func TestApplyDotEnvDoesNotOverrideExisting(t *testing.T) {
	const key = "PORTFOLIO_TEST_DOTENV_EXISTING"
	t.Setenv(key, "original")

	applyDotEnv(key + "=from-file\n")

	if got := os.Getenv(key); got != "original" {
		t.Fatalf("key = %q, want %q", got, "original")
	}
}

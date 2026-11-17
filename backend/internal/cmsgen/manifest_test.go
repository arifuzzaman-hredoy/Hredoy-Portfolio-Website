package cmsgen

import "testing"

func TestManifestKeysAreUniqueAndWellFormed(t *testing.T) {
	seen := make(map[string]bool, len(Manifest))
	groups := make([]string, 0, 16)
	groupSeen := make(map[string]bool, 16)

	for i, entry := range Manifest {
		if entry.Key == "" {
			t.Fatalf("entry %d has an empty key", i)
		}
		if seen[entry.Key] {
			t.Fatalf("duplicate manifest key %q", entry.Key)
		}
		seen[entry.Key] = true

		if entry.Label == "" {
			t.Fatalf("%s has no label", entry.Key)
		}
		if entry.Group == "" {
			t.Fatalf("%s has no group", entry.Group)
		}
		if !entry.Type.Valid() {
			t.Fatalf("%s declares unknown type %q", entry.Key, entry.Type)
		}
		if entry.Default == "" {
			t.Fatalf("%s has an empty default", entry.Key)
		}
		if !groupSeen[entry.Group] {
			groupSeen[entry.Group] = true
			groups = append(groups, entry.Group)
		}
	}

	// The manifest order defines the admin section order; a group must not
	// reappear later in the list or the editor would render it twice.
	for i := 1; i < len(groups); i++ {
		for j := 0; j < i; j++ {
			if groups[i] == groups[j] {
				t.Fatalf("group %q appears more than once", groups[i])
			}
		}
	}
}

func TestOrderedMatchesManifestLength(t *testing.T) {
	ordered := Ordered()
	if len(ordered) != len(Manifest) {
		t.Fatalf("Ordered() = %d entries, want %d", len(ordered), len(Manifest))
	}
	for i, entry := range ordered {
		if entry.SortOrder != int32(i+1) {
			t.Fatalf("entry %d (%s) has sort order %d, want %d", i, entry.Key, entry.SortOrder, i+1)
		}
	}
}

func TestByKeyCoversEveryEntry(t *testing.T) {
	byKey := ByKey()
	if len(byKey) != len(Manifest) {
		t.Fatalf("ByKey() = %d entries, want %d", len(byKey), len(Manifest))
	}
	for _, entry := range Manifest {
		got, ok := byKey[entry.Key]
		if !ok || got != entry {
			t.Fatalf("ByKey()[%q] = %+v, ok=%v", entry.Key, got, ok)
		}
	}
}

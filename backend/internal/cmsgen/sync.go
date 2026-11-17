package cmsgen

import (
	"context"
	"fmt"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
)

// Store is the subset of the query layer the manifest sync needs.
type Store interface {
	SyncContentBlockMeta(ctx context.Context, arg db.SyncContentBlockMetaParams) error
}

// Sync writes the manifest into content_blocks. Rows that already exist keep
// their owner-edited value; only the metadata (label, group, type, sort order,
// default) is realigned with the code. Rows that do not exist yet are created
// with the manifest default as their value.
func Sync(ctx context.Context, store Store) error {
	for _, entry := range Ordered() {
		if !entry.Type.Valid() {
			return fmt.Errorf("cmsgen: key %q declares unknown type %q", entry.Key, entry.Type)
		}
		err := store.SyncContentBlockMeta(ctx, db.SyncContentBlockMetaParams{
			Key:          entry.Key,
			Label:        entry.Label,
			GroupName:    entry.Group,
			Value:        entry.Default,
			Type:         string(entry.Type),
			SortOrder:    entry.SortOrder,
			DefaultValue: entry.Default,
		})
		if err != nil {
			return fmt.Errorf("cmsgen: sync %q: %w", entry.Key, err)
		}
	}
	return nil
}

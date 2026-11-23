package main

import "sync"

const defaultMaxEntries = 1000

func buildSeedContent(basePath string) string {
	return `<h2>Welcome to Vanilia</h2>
<p>This is a drop-in <strong>form-associated Web Component</strong> (<code>&lt;vanilia-editor&gt;</code>) powered by a vendored Squire core, modern Web &amp; CSS APIs, and a <strong>Go + Datastar SSE</strong> demo backend — with zero JS build step.</p>
<p><img src="` + basePath + `/assets/sample-mountain.svg" alt="Sample mountain landscape" data-align="center" style="width: 75%; height: auto; display: block; margin-left: auto; margin-right: auto;"></p>
<blockquote>Click the image above to drag-resize (desktop &amp; mobile), pick width presets, align, or edit alt text — then hit <strong>Save</strong> to stream it through Datastar SSE.</blockquote>
<ul><li>Select text for the floating <code>Popover</code> + <code>CSS Anchor Positioning</code> menu</li><li>Press <code>Ctrl+F</code> for non-destructive Find &amp; Replace via <code>CSS.highlights</code></li><li>Drop or paste any PNG / JPEG / WebP image — uploads to <code>POST /api/upload</code></li></ul>`
}

type contentStore struct {
	mu          sync.RWMutex
	maxEntries  int
	seedContent string
	items       map[string]string
}

func newContentStore(maxEntries int, seedContent string) *contentStore {
	return &contentStore{
		maxEntries:  maxEntries,
		seedContent: seedContent,
		items:       make(map[string]string),
	}
}

func (s *contentStore) loadContent(sessionID string) string {
	s.mu.RLock()
	content, ok := s.items[sessionID]
	s.mu.RUnlock()
	if ok {
		return content
	}
	return s.seedContent
}

func (s *contentStore) saveContent(sessionID string, html string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[sessionID]; !exists && s.maxEntries > 0 && len(s.items) >= s.maxEntries {
		for k := range s.items {
			delete(s.items, k)
			break
		}
	}
	s.items[sessionID] = html
}

func (s *contentStore) resetContent(sessionID string) string {
	s.mu.Lock()
	delete(s.items, sessionID)
	s.mu.Unlock()
	return s.seedContent
}

# MCP Scene/Playlist Hardening Checklist

- [x] 1. Preserve scene IDs from `/api/scenes` and add typed single-scene retrieval.
- [x] 2. Replace playlist update delete/recreate with safe upsert semantics.
- [x] 3. Replace scene refresh delete/recreate with in-place scene update.
- [x] 4. Validate scene/playlist references before writes (scene IDs, virtual IDs, preset/effect references).
- [x] 5. Fix playlist status to use LedFX runtime state action (`PUT /api/playlists` with `action=state`).
- [x] 6. Improve error transparency with structured error envelopes (method, endpoint, status, details).
- [x] 7. Improve type safety for scene/playlist data models and remove avoidable `any` usage.
- [x] 8. Add safe edit primitives (`get_scene`, `update_scene`, `upsert_playlist`, `patch_playlist_items`).
- [x] 9. Add/extend tests for all scene/playlist mutation paths and error payload behavior.

## Verification Log

- [x] Point 1: `npm test -- tests/unit/ledfx-client-scenes.test.ts`
- [x] Point 2: `npm test -- tests/unit/ledfx-client-playlists.test.ts`
- [x] Point 3: `npm test -- tests/unit/tools-refresh-blender-scenes.test.ts`
- [x] Point 4: `npm test -- tests/unit/tools-reference-validation.test.ts`
- [x] Point 5: `npm test -- tests/unit/ledfx-client-playlists.test.ts`
- [x] Point 6: `npm test -- tests/unit/tools-error-format.test.ts`
- [x] Point 7: `npm run build`
- [x] Point 8: `npm test -- tests/unit/tools-safe-edit-primitives.test.ts`
- [x] Point 9: `npm test -- tests/unit/tools-scene-playlist-mutations.test.ts`

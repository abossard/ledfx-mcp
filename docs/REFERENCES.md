# LedFX API References (Current)

**Last Updated:** 2026-02-06  
**LedFX Baseline:** 2.1.4

This file is intentionally short. `docs/API_SPECIFICATION.md` is the maintained API behavior document; this file lists the canonical sources used to verify it.

## Official Documentation

- Main API docs: <https://docs.ledfx.app/en/latest/apis/api.html>
- Scenes docs: <https://docs.ledfx.app/en/latest/apis/scenes.html>
- Playlists docs: <https://docs.ledfx.app/en/latest/apis/playlists.html>
- Full docs index: <https://docs.ledfx.app/en/latest/>

## Release and Source of Truth

- Latest release (`v2.1.4`): <https://github.com/LedFx/LedFx/releases/tag/v2.1.4>
- Upstream repo: <https://github.com/LedFx/LedFx>
- Verified source commit for this update: <https://github.com/LedFx/LedFx/tree/0ef5218b3d6df6db22b85513228a55591f9580a2>

## API Handler Files Used for Verification

- Virtual presets: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/virtual_presets.py>
- Effect presets: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/presets.py>
- Virtual effects: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/virtual_effects.py>
- Scenes collection: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/scenes.py>
- Scene by ID: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/scenes_id.py>
- Scene runtime behavior: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/scenes.py>
- Playlists collection actions: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/playlists.py>
- Playlist manager semantics: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/playlists.py>
- Colors API: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/colors.py>
- Color delete by ID: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/api/colors_delete.py>
- Blender effect: <https://github.com/LedFx/LedFx/blob/0ef5218b3d6df6db22b85513228a55591f9580a2/ledfx/effects/blender.py>

## Notes

- LedFX API docs are useful but not exhaustive for edge behavior; source handlers are authoritative when docs and runtime differ.
- When updating API docs again, pin a commit hash and refresh both this file and `docs/API_SPECIFICATION.md` together.

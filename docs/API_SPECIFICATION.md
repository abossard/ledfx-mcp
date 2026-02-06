# LedFX API Specification (Current)

**Document Version:** 2.0  
**Verified On:** 2026-02-06  
**Target LedFX Version:** 2.1.4+  
**Base URL:** `http://<host>:<port>/api`

## Sources of Truth

This spec was validated against:

- Official docs (latest): <https://docs.ledfx.app/en/latest/apis/api.html>
- Scenes docs (latest): <https://docs.ledfx.app/en/latest/apis/scenes.html>
- Playlists docs (latest): <https://docs.ledfx.app/en/latest/apis/playlists.html>
- Latest release: <https://github.com/LedFx/LedFx/releases/tag/v2.1.4>
- Upstream source (HEAD at verification time): <https://github.com/LedFx/LedFx/tree/0ef5218b3d6df6db22b85513228a55591f9580a2>

## Why This Replaces the Previous Doc

The old file mixed historical behavior and outdated assumptions. This version is intentionally concise and focuses on the model details that matter when building MCP tooling:

- Presets are effect-scoped in storage, but virtual-scoped for most operations.
- Colors/palettes are a color-or-gradient store, not a first-class palette entity.
- Blender is a normal effect whose config references other virtual IDs.
- Scenes and playlists orchestrate virtual/effect state indirectly, with action semantics.

## Core Data Model (Must-Know)

1. `Device` is physical output integration (WLED/OpenRGB/etc).
2. `Virtual` is the control surface where effects run.
3. `Effect` is attached to a virtual (`/virtuals/{id}/effects`).
4. `Preset` library is keyed by effect type (`ledfx_presets` and `user_presets`), but the easiest create/apply flow is virtual-based.
5. `Scene` stores per-virtual actions/config snapshots.
6. `Playlist` stores ordered `scene_id` items only.
7. `Colors/Gradients` are global stores (`/api/colors`); "palette" is convention, not native resource type.
8. `Blender` is an effect that composes output from three source virtuals (`mask`, `foreground`, `background`).

## Endpoint Matrix (Operational)

### Server and schema

- `GET /api/info`
- `GET /api/schema` (optionally with request body to request specific schema groups)

`GET /api/info` commonly includes extra metadata fields beyond `url`, `name`, and `version` (for example `github_sha`, `is_release`, `developer_mode`).

### Devices and virtuals

- `GET /api/devices`
- `GET /api/devices/{device_id}`
- `GET /api/virtuals`
- `PUT /api/virtuals` (global pause toggle)
- `POST /api/virtuals` (create or update virtual config)
- `GET /api/virtuals/{virtual_id}`
- `PUT /api/virtuals/{virtual_id}` (set `active`)
- `POST /api/virtuals/{virtual_id}` (update `segments`)
- `DELETE /api/virtuals/{virtual_id}`

### Effects

- `GET /api/effects` (active effects by virtual)
- `PUT /api/effects` with action:
  - `clear_all_effects`
  - `apply_global`
  - `apply_global_effect`
- `GET /api/effects/{effect_id}` (effect schema string)
- `GET /api/virtuals/{virtual_id}/effects`
- `POST /api/virtuals/{virtual_id}/effects`
- `PUT /api/virtuals/{virtual_id}/effects`
- `DELETE /api/virtuals/{virtual_id}/effects`

### Presets

- `GET /api/effects/{effect_id}/presets`
- `PUT /api/effects/{effect_id}/presets` (rename)
- `DELETE /api/effects/{effect_id}/presets` (delete)
- `GET /api/virtuals/{virtual_id}/presets`
- `PUT /api/virtuals/{virtual_id}/presets` (apply)
- `POST /api/virtuals/{virtual_id}/presets` (save active effect as user preset)
- `DELETE /api/virtuals/{virtual_id}/presets` (currently non-functional as a true preset delete; see quirks)

### Scenes

- `GET /api/scenes`
- `PUT /api/scenes` actions:
  - `activate`
  - `activate_in` (requires `ms`)
  - `deactivate`
  - `rename` (requires `name`)
- `POST /api/scenes` (create or update; update if `id` provided)
- `DELETE /api/scenes` (body includes `id`)
- `GET /api/scenes/{scene_id}`
- `DELETE /api/scenes/{scene_id}`

### Playlists

- `GET /api/playlists`
- `POST /api/playlists` (create or replace)
- `PUT /api/playlists` actions:
  - `start` (requires `id`, optional runtime `mode` and `timing` override)
  - `stop`
  - `pause`
  - `resume`
  - `next`
  - `prev`
  - `state`
- `DELETE /api/playlists` (body includes `id`)
- `GET /api/playlists/{id}`
- `DELETE /api/playlists/{id}`

### Colors and gradients

- `GET /api/colors`
- `POST /api/colors` (upsert map of IDs to values)
- `DELETE /api/colors` (body: list of IDs)
- `DELETE /api/colors/{color_id}`

## Intricate Behavior Details

### 1) Presets are tied to effect type, but workflow is virtual-centric

### What is stored

- Presets are stored by effect type in two categories:
  - `ledfx_presets`
  - `user_presets`

### What GET on virtual presets actually means

`GET /api/virtuals/{virtual_id}/presets`:

- Requires virtual to exist.
- Requires virtual to have an active effect.
- Returns presets only for that active effect type.
- Adds an `active` boolean per preset by comparing preset config to active effect config.

### Apply preset

`PUT /api/virtuals/{virtual_id}/presets` requires:

```json
{
  "category": "ledfx_presets" | "user_presets",
  "effect_id": "<effect_type>",
  "preset_id": "<preset_id>"
}
```

Notes:

- `category=ledfx_presets` with `preset_id=reset` applies generated defaults for `effect_id`.
- This call creates/sets an effect instance on the virtual.

### Save preset

`POST /api/virtuals/{virtual_id}/presets`:

- Saves the virtual's current active effect config into `user_presets[effect_id]`.
- Requires body `{ "name": "..." }`.
- Generated preset key is ID-normalized from name.

### Delete preset caveat

`DELETE /api/virtuals/{virtual_id}/presets` is marked TODO upstream and currently clears effect state rather than doing reliable preset deletion. For true preset deletion, use:

- `DELETE /api/effects/{effect_id}/presets` with `{ "category", "preset_id" }`

### 2) Colors and "palettes" are not a dedicated palette model

`/api/colors` is a key-value store with two domains:

- `colors.{builtin,user}`
- `gradients.{builtin,user}`

`POST /api/colors` takes an object like:

```json
{
  "my_color": "#ff00ff",
  "my_gradient": "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)"
}
```

Behavior:

- If value validates as a color, key goes to user colors.
- Otherwise it is treated as gradient string and stored in user gradients.

Implication for MCP:

- A "palette" should be documented as naming convention over user gradients.
- Reusing one palette across many presets means copying the same gradient value into each effect config/preset; there is no separate palette reference object.

### 3) Scenes support action-based orchestration per virtual

Scene virtual entries can use explicit action semantics:

- `ignore`: leave virtual unchanged.
- `stop`: clear effect.
- `forceblack`: apply `singleColor` with black.
- `activate`: apply effect.

For `activate`:

- `type` is required.
- Either `config` or `preset` is used.
- If `preset` is set, scene activation resolves preset by effect type at runtime.

Important scene POST rules:

- With `id`: updates existing scene.
- Without `id`: creates a new scene; dedupes ID from name.
- If `virtuals` omitted on create: captures a snapshot of current virtual effects.

### 4) Playlists are scene playlists, not effect/preset playlists

Playlist items schema is:

```json
{
  "scene_id": "<scene_id>",
  "duration_ms": 15000
}
```

Key semantics:

- Items list only references scenes.
- Empty `items` is valid and means "dynamic all scenes" at start time.
- `mode` is `sequence` or `shuffle`.
- Runtime control is via `PUT /api/playlists` action API, including `state`.

### 5) Blender effect model (why it feels unusual)

Blender is configured like any other effect on a target virtual, but its config references other virtual IDs:

```json
{
  "type": "blender",
  "config": {
    "mask": "virtual-mask",
    "foreground": "virtual-fore",
    "background": "virtual-back",
    "mask_stretch": "2d full",
    "foreground_stretch": "2d full",
    "background_stretch": "2d full",
    "invert_mask": false,
    "mask_cutoff": 1.0
  }
}
```

Runtime behavior:

- Blender reads frames/matrices from those source virtuals every render cycle.
- If sources are missing/not ready, render can no-op for that frame.
- Stretching is applied when source dimensions differ.

Operational implication:

- Treat blender as cross-virtual dependency graph.
- Scene/playlist definitions must preserve source virtual lifecycle and effects, not only the blender target virtual.

## Request/Response Shape Caveats

LedFX API is not fully uniform. Clients should handle mixed response envelopes:

- Many endpoints: `{ "status": "success", ... }`
- `GET /api/virtuals/{id}` returns `{ "status": "success", "<id>": { ... } }`
- Some PUT/DELETE endpoints return message-style payloads rather than full objects.
- `GET /api/schema` body-filtering is defined in source, but some running instances effectively return full schema even when a body is sent.

## Practical MCP Guidance

1. Effects: always treat virtual ID as required control key.
2. Presets: validate virtual has active effect before preset operations.
3. Palette UX: represent palettes as named user gradients.
4. Playlists: build through scene IDs; do not model playlist items as effect presets.
5. Blender workflows: provision source virtuals first, then blender target, then scene/playlist orchestration.

## Minimal Validation Checklist for MCP Integrations

- Verify `/api/info.version` and log it.
- Pull `/api/schema` at startup to discover effect schemas dynamically.
- When applying preset:
  - check virtual exists
  - check active effect or explicit `effect_id`
  - prefer `/api/effects/{effect_id}/presets` for catalog inspection
- When creating playlist:
  - validate all `scene_id` values exist
  - allow empty `items` only if dynamic-all-scenes behavior is desired
- For blender:
  - validate source virtual IDs exist before applying effect

## Version Notes

This document is intentionally scoped to the currently released `2.1.4` behavior (plus source at commit `0ef5218`). If you target older builds, re-check:

- `virtual_presets` delete behavior
- scene action/preset inference fields
- playlists action set and state payload

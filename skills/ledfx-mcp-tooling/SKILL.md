---
name: ledfx-mcp-tooling
description: Build or debug LedFX automations through MCP tools with schema-safe effect configs, fallback chains, and palette/gradient validation. Use when writing scripts or commands that call ledfx_* tools, especially set_effect, set_blender, scene, or playlist operations.
---

# LedFX MCP Tooling

## Workflow
1. Query effect schemas before setting effects.
2. Build config using only supported properties from the selected schema.
3. Validate colors and gradients before calling tool writes.
4. Apply effect fallbacks when preferred effects are unavailable.
5. Write scenes after effect application checks pass.
6. Build playlists from scene IDs and patch per-scene durations only when needed.

## Effect Categories (from LedFX source)

| Category | Audio-Reactive | Key Effects | Blender Use |
|----------|---------------|-------------|-------------|
| `BPM` | ✅ | `bar`, `multiBar`, `strobe` | mask, foreground |
| `Classic` | ✅ | `energy`, `scroll`, `scroll_plus`, `wavelength`, `equalizer`, `bands`, `spectrum`, `filter`, `magnitude`, `scan`, `pitchSpectrum`, `rain`, `hierarchy` | mask, foreground |
| `Atmospheric` | ✅ | `fire`, `lava_lamp`, `melt`, `water`, `crawler`, `energy2`, `melt_and_sparkle`, `marching`, `glitch` | foreground, background |
| `Matrix` | ✅ (via Twod) | `plasma2d`, `plasmawled`, `concentric`, `equalizer2d`, `flame2d`, `waterfall2d`, `soap2d`, `bleep`, `radial` | foreground |
| `Non-Reactive` | ❌ | `gradient`, `fade`, `singleColor`, `rainbow`, `random_flash` | **background only** |
| `Diagnostic` | mixed | `vumeter`, `metro`, `pixels` | avoid in blenders |

## Blender Mask Rules
- **Mask MUST be audio-reactive.** `Non-Reactive` effects (gradient, fade, singleColor, rainbow, random_flash) as masks produce static, lifeless blenders.
- Best 1D masks: `energy`, `scroll`, `scroll_plus`, `wavelength`, `equalizer`, `bar`, `spectrum`, `filter`, `hierarchy`, `vumeter`
- Best beat-locked masks: `bar`, `strobe`, `real_strobe`
- Avoid dual strobe: don't put strobe in both foreground AND mask
- Use `ledfx_list_effect_types` with `filter_role: "mask"` to get valid mask candidates.

## Guardrails
- Prefer `ledfx_set_blender` over direct blender config writes.
- Keep gradients in `linear-gradient(... <pct>%, ...)` format.
- Reject invalid palette references early.
- Keep tool errors explicit and actionable.

## Regression Checks
1. Dry-run mode produces deterministic scene/playlist plans.
2. Failed effect candidates fall back in declared order.
3. Invalid gradients/colors are rejected before write operations.


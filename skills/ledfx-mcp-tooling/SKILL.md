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

## Guardrails
- Prefer `ledfx_set_blender` over direct blender config writes.
- Keep gradients in `linear-gradient(... <pct>%, ...)` format.
- Reject invalid palette references early.
- Keep tool errors explicit and actionable.

## Regression Checks
1. Dry-run mode produces deterministic scene/playlist plans.
2. Failed effect candidates fall back in declared order.
3. Invalid gradients/colors are rejected before write operations.


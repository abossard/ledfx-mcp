---
name: dj-phase-composer
description: Compose phase-based DJ lighting scenes from creative rules into executable direct and blender scene specs. Use when translating a DJ guide into LedFX scene blueprints, role ordering, or phase playlist flows.
---

# DJ Phase Composer

## Workflow
1. Define phase identity: palette, energy, and motion intent.
2. Define scene roles per phase: entry, build, statement, bullet, hard, accent, exit.
3. Build both direct and blender scenes for each phase.
4. Assign explicit order values so playlists remain intentional.
5. Tag scenes by phase, role, and behavior for filtering and audits.

## Composition Rules
- Keep phase playlists mixed; avoid single-effect runs.
- Include at least one entry and one exit scene per phase.
- Include at least one rapid-flow scene and at least one hard-impact scene per high-energy phases.
- Keep strobe scenes short and distributed.

## Output Shape
- Scene specs include: `phase`, `label`, `role`, `order`, `effect/mode`, `tags`, optional `durationMs`.
- Blender specs include per-layer effect definitions with optional fallback and overrides.


---
name: playlist-variety-auditor
description: Audit DJ lighting playlists for effect-family diversity, strobe density, phase coverage, and role balance. Use when validating that playlists are not repetitive and comply with guide constraints before showtime.
---

# Playlist Variety Auditor

## Workflow
1. Collect playlist scene metadata: phase, role, effect family, kind, duration, tags.
2. Check diversity thresholds per phase playlist.
3. Check pacing thresholds for strobe and rapid-flow scenes.
4. Check structural coverage: entry/build/peak/exit presence.
5. Emit findings and concrete fixes.

## Default Checks
1. At least 3 effect families per phase playlist.
2. At least 2 blender scenes and at least 1 rapid-flow scene per phase playlist.
3. No more than 2 strobe-accent scenes per phase playlist.
4. Entry and exit roles exist in each phase.
5. No duplicate scene IDs or scene names in one playlist.

## Fix Patterns
- Replace repeated family scenes with underrepresented roles.
- Shorten strobe durations instead of deleting first.
- Reorder scenes by role arc: entry -> build -> bullet/hard -> accent -> exit.


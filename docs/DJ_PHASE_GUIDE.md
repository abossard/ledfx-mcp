# DJ Set Lighting Phase Guide

Creative ruleset for a 4-phase DJ show design. This guide is intentionally platform-agnostic: it defines artistic direction, structure, and constraints rather than tool operations.

---

## Core Intent

- Lighting should feel musical, not random.
- Each phase must have a clear visual identity.
- Energy changes should read within 5-10 seconds, even to someone not facing the booth.
- Color and motion should support transitions, not fight them.

---

## Non-Negotiable Rules

1. **Palette discipline**
   - Keep at least 80% of scene runtime inside the active phase palette.
   - Use at most one accent color outside the phase palette.
2. **Contrast rhythm**
   - Every scene needs both a "rest state" and a "hit state" (brightness, density, or mask difference).
   - Avoid full-intensity continuity longer than 45 seconds.
3. **Audio-reactivity minimum**
   - Every scene must include at least one audio-reactive component.
4. **Strobe restraint**
   - Strobes are accents, not baseline texture.
   - Avoid sustained high-frequency strobe blocks longer than 8 seconds.
5. **Scene naming clarity**
   - Scene names must be unique and phase-scoped (`P1-...`, `P2-...`, etc.).
   - Do not repeat the same scene name in one playlist.
6. **Transition ownership**
   - Entry and exit scenes per phase should be softer than the phase peak scenes.

---

## Blender Composition Rules (Critical)

Blender scenes should use three roles:
- **Background layer:** space, atmosphere, tonal bed.
- **Foreground layer:** the primary musical motion.
- **Mask layer:** rhythmic gating, punctuation, reveal/hide control.

### Audio-Reactivity Requirement

Each blender scene must have **1-2 audio-reactive layers**.

Allowed:
- 1 reactive: foreground reactive, background slow/static, mask static/off.
- 2 reactive: mask reactive plus one of foreground/background reactive.

Not allowed:
- 0 reactive layers (looks dead).
- 3 reactive layers (usually chaotic and unreadable).

### Additional Blender Constraints

- Keep background brightness conservative (typically `0.10-0.35`) so foreground details remain readable.
- Use mask as structure, not constant noise.
- Do not run two strobe-family behaviors at once (for example, strobe-like foreground plus strobe mask).
- In high-energy phases, prefer reactive mask + one melodic/reactive foreground.

---

## Phase Overview

| Phase | Name | Energy | Mood | Color Direction |
|---|---|---|---|---|
| P1 | Jungle/Disco Starter | Low-Medium | Warm, welcoming, rhythmic | Green + yellow with subtle blue accents |
| P2 | Buildup | Medium-High | Tension, lift, anticipation | Blue/cyan with purple support |
| P3 | Peak | Maximum | Intense, aggressive, high contrast | Purple/magenta/red with black contrast |
| P4 | Release | Medium | Relief, glide, reset | Blue/lavender/aqua, softer transitions |

---

## Phase Color Anchors

### P1 Jungle/Disco Starter
- Background anchor: `#001a00`
- Palette anchors: `#228b22`, `#00aa00`, `#ffff00`, `#0096c8`
- Target brightness: `0.60-0.75`

### P2 Buildup
- Background anchor: `#000a22`
- Palette anchors: `#0044aa`, `#00ffff`, `#9900ff`
- Target brightness: `0.75-0.90`

### P3 Peak
- Background anchor: `#000000`
- Palette anchors: `#9900ff`, `#ff00aa`, `#ff0000`
- Target brightness: `0.90-1.00` with intentional blackout pockets

### P4 Release
- Background anchor: `#000022`
- Palette anchors: `#3366cc`, `#cc99ff`, `#00ccff`
- Target brightness: `0.65-0.82`

---

## Phase-Specific Creative Rules

### P1 Starter
- Motion: smooth and legible, moderate tempo, obvious groove.
- Prioritize rhythmic readability over intensity.
- Never use full black as the base look in this phase.
- Good families: `wavelength`, `energy`, `scroll`, `gradient`, atmospheric motion.
- Avoid aggressive strobe behavior except short punctuation.

### P2 Buildup
- Motion: tighter, sharper, more directional.
- Introduce stronger beat articulation and contrast.
- Good families: `blade_power_plus`, `bands`, `scan`, `pitchSpectrum`, `energy`.
- Strobes should signal tension, not dominate runtime.

### P3 Peak
- Motion: fast, high contrast, impact-forward.
- Use short black gaps to make hits feel bigger.
- Good families: `power`, `blade_power_plus`, `real_strobe`, aggressive reactive masks.
- Keep strobe sections short and intentional; alternate with non-strobe impact scenes.

### P4 Release
- Motion: de-escalate without going flat.
- Reintroduce flow and melody emphasis.
- Good families: `energy2`, `plasma2d`, `wavelength`, gentle `scroll`.
- If using strobes, keep them sparse and short.

---

## Playlist Architecture Rules

- Maintain two variants per phase:
  - **Normal:** rhythm/pitch-forward, low strobe usage.
  - **Crazy:** impact-forward, higher contrast and controlled strobe accents.
- Typical phase playlist length:
  - Normal: 5 scenes.
  - Crazy: 5-6 scenes.
- Typical dwell time per scene: 24-40 seconds.
- Always include:
  - 1 entry scene (lower complexity).
  - 1 peak scene (highest contrast).
  - 1 exit scene (prepares next phase).

### Suggested Scene Flow Pattern

- `Entry -> Build -> Statement -> Peak Accent -> Release/Bridge`

This pattern should hold for both normal and crazy variants, with crazy using stronger peak accents.

---

## Effect Role Matrix

| Role | Typical Effect Families | Notes |
|---|---|---|
| Tonal bed (background) | `singleColor`, `gradient`, slow atmospheric | Keep low brightness and low clutter |
| Musical body (foreground) | `wavelength`, `energy`, `blade_power_plus`, `power` | Main reader of rhythm/melody |
| Accent gate (mask) | beat-reactive bars, selective strobe, rhythmic textural masks | Short bursts, clear rhythmic function |

---

## Live Operation Cues

- Move from P1 to P2 when crowd is locked and movement is consistent.
- Move into P3 only when musical arrangement and room energy can sustain it.
- Do not hold P3 crazy continuously; rotate in and out for impact.
- Use P4 as an intentional breath before the next buildup cycle.

---

## Quality Checklist Before Showtime

- Phase palettes are visually distinct at a glance.
- Scene names are unique and phase-prefixed.
- Every scene has at least one audio-reactive component.
- Every blender scene has exactly 1-2 reactive layers.
- No playlist contains repeated scene IDs or repeated scene names.
- Strobe-heavy scenes are distributed, not clustered end-to-end.
- Entry and exit scenes exist for each phase variant.

---

*Creative specification for DJ lighting phases.*

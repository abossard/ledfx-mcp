---
name: blender-archetype-library
description: Apply reusable blender scene archetypes (wobble, flow, hard, bullet) with controlled layer behavior. Use when designing or refactoring LedFX blender scenes and masks for readable yet high-impact DJ visuals.
---

# Blender Archetype Library

## Workflow
1. Choose an archetype by desired feel: wobble, flow, hard, or bullet.
2. Select background/foreground/mask effects per archetype from the lists below.
3. Ensure 1-2 reactive layers; avoid 0 or 3 reactive layers.
4. Tune brightness and speed by role (background low, foreground primary, mask structural).
5. Apply scene-specific overrides only on schema-supported keys.

## Blender Layer Rules
```
Background  →  ambient texture (low brightness ≤ 0.7, low reactivity ≤ 0.3)
Foreground  →  primary visual (main color/motion)
Mask        →  MUST be audio-reactive (controls pixel reveal)
```

**⛔ Never use as mask**: `gradient`, `fade`, `singleColor`, `rainbow`, `random_flash`  
(These are `Non-Reactive` in LedFX — they produce static, lifeless blenders)

## Effect Selection by Role

### ✅ Valid Mask Effects (audio-reactive)
**Beat-locked (tightest):** `bar`, `strobe`, `real_strobe`, `multiBar`  
**Frequency spectrum:** `energy`, `equalizer`, `wavelength`, `bands`, `spectrum`, `pitchSpectrum`, `filter`, `magnitude`  
**Color zones:** `scroll`, `scroll_plus`, `hierarchy`, `rain`  
**Subtle:** `vumeter`, `glitch`

### ✅ Good Foreground Effects
**Flowing:** `fire`, `lava_lamp`, `melt`, `water`, `crawler`, `energy2`, `melt_and_sparkle`, `marching`  
**Directional:** `scan`, `scan_and_flare`, `scan_multi`, `scroll`, `blade_power_plus`  
**2D matrix:** `plasma2d`, `plasmawled`, `concentric`, `flame2d`, `equalizer2d`, `soap2d`  
**Beat-driven:** `bar`, `strobe`, `keybeat2d`, `power`

### ✅ Good Background Effects
**Non-reactive (pure ambient):** `gradient`, `fade`, `singleColor`, `rainbow`  
**Soft reactive:** `lava_lamp` (low reactivity), `fire` (low intensity), `noise2d`, `blocks`, `digitalrain2d`

## Archetypes

### Wobble Bed
- **Feel**: calm, musical, warm
- **Background**: `gradient` or `fade`
- **Foreground**: `lava_lamp` or `melt`
- **Mask**: `wavelength` or `scroll`

### Flow Mist
- **Feel**: soft, flowing, melodic
- **Background**: `fade` or `gradient`
- **Foreground**: `water` or `crawler`
- **Mask**: `hierarchy` or `energy`

### Hard Cut Reactor
- **Feel**: contrast, aggressive, rhythmic
- **Background**: `singleColor` or `blocks`
- **Foreground**: `melt_and_sparkle` or `energy2`
- **Mask**: `bar` or `strobe`

### Bullet Tunnel
- **Feel**: directional, high-velocity, laser
- **Background**: `gradient` or `singleColor`
- **Foreground**: `scan` or `scroll`
- **Mask**: `equalizer` or `scroll_plus`

## Guardrails
- Avoid dual strobe behavior in foreground + mask simultaneously.
- Keep mask for structure, not constant noise.
- Keep background readable and not dominant.
- For 2D virtuals only: can use Matrix effects (`plasma2d`, `plasmawled`, `waterfall2d`, `concentric`) in any role.


---
name: blender-archetype-library
description: Apply reusable blender scene archetypes (wobble, flow, hard, bullet) with controlled layer behavior. Use when designing or refactoring LedFX blender scenes and masks for readable yet high-impact DJ visuals.
---

# Blender Archetype Library

## Workflow
1. Choose an archetype by desired feel: wobble, flow, hard, or bullet.
2. Select background/foreground/mask effects per archetype.
3. Ensure 1-2 reactive layers; avoid 0 or 3 reactive layers.
4. Tune brightness and speed by role (background low, foreground primary, mask structural).
5. Apply scene-specific overrides only on schema-supported keys.

## Archetypes
- Wobble Bed: calm background, musical foreground, open mask.
- Flow Mist: soft gradient bed, flowing foreground, gentle mask.
- Hard Cut Reactor: contrast bed, aggressive foreground, rhythmic gating mask.
- Bullet Tunnel: directional foreground motion (`scroll`/`scan`) with reactive gating.

## Guardrails
- Avoid dual strobe behavior in foreground + mask simultaneously.
- Keep mask for structure, not constant noise.
- Keep background readable and not dominant.


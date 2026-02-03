# DJ Set Lighting Phase Guide

A 4-phase lighting design for DJ sets, with normal (rhythm-focused) and crazy (strobe-heavy) variants for each phase.

---

## Phase Overview

| Phase | Name | Mood | Energy | Colors |
|-------|------|------|--------|--------|
| **P1** | Jungle/Disco Starter | Warm, inviting, rhythmic | Low-Medium | Green, Yellow, hints of Blue |
| **P2** | Buildup | Rising tension, contrast | Medium-High | Blue dominant, less green |
| **P3** | Peak | Maximum intensity, chaos | Maximum | Purple, Red, fast changes |
| **P4** | Release | Cool down, resolution | Medium | Blue, softer transitions |

---

## Phase 1: Jungle/Disco Starter

**Briefing:** The opening phase sets a welcoming groove. Think jungle rhythms, disco vibes - not overwhelming, but engaging. The crowd is warming up.

### Characteristics
- **Energy Level:** 60-70% brightness
- **Background Color:** Dark green (`#001a00` or `#002200`)
- **Movement:** Slow, rhythmic, flowing
- **Audio Focus:** Emphasize bass rhythm, not overpowering
- **Color Palette:** 
  - Primary: Forest greens, lime greens
  - Secondary: Warm yellows, amber
  - Accent: Occasional cool blue

### Normal Mode Effects
- **wavelength** - Visualize the full frequency spectrum with green-yellow gradient
- **energy2** - Flowing atmospheric energy, slow reactivity
- **scroll** - 3-color scroll (green/yellow/blue) reacting to frequency bands
- **water** - Rippling water effect for ambient background

### Crazy Mode Effects
- Add **strobe** mask with slow fade
- Increase brightness to 85%
- Faster gradient rolls

### Scene Tags
- `phase1`, `jungle`, `starter`, `warmup`

---

## Phase 2: Buildup

**Briefing:** Energy is rising. The crowd is locked in. Colors shift cooler, contrasts sharpen. This is the anticipation phase before the drop.

### Characteristics
- **Energy Level:** 75-85% brightness
- **Background Color:** Very dark purple (`#0a000a` or `#110011`)
- **Movement:** More dynamic, stronger contrasts
- **Audio Focus:** Emphasize beat detection, build anticipation
- **Color Palette:**
  - Primary: Electric blue, cyan
  - Secondary: Deep purple, violet
  - Accent: Occasional green remnants

### Normal Mode Effects
- **blade_power_plus** - Reactive bar with blue-purple gradient
- **bands** - Frequency band visualization, 6 bands
- **pitchSpectrum** - Note-reactive spectrum
- **scan** - Scanning eye effect with beat multiplier

### Crazy Mode Effects
- Add **real_strobe** with percussion response
- Sharp color transitions
- Higher contrast backgrounds

### Scene Tags
- `phase2`, `buildup`, `anticipation`

---

## Phase 3: Peak

**Briefing:** MAXIMUM ENERGY. This is the drop, the climax. Fast changes, bright flashes, dark contrasts. The crowd goes wild.

### Characteristics
- **Energy Level:** 100% brightness (with dark moments)
- **Background Color:** Pure black (`#000000`)
- **Movement:** Fast, chaotic, intense
- **Audio Focus:** Maximum beat/bass reactivity
- **Color Palette:**
  - Primary: Bright purple, magenta
  - Secondary: Deep red, crimson
  - Accent: White (strobes), black (contrast)

### Normal Mode Effects
- **power** - Bass-reactive power bars with sparks
- **equalizer2d** - Full matrix equalizer
- **rain** - Fast raindrop particles on beat
- **concentric** - Radial pulse from center

### Crazy Mode Effects
- **real_strobe** - Full percussion strobes
- **strobe** (BPM) - 1/4 or 1/8 beat strobes
- Extreme contrast (bright to black)
- Maximum decay rates

### Scene Tags
- `phase3`, `peak`, `drop`, `climax`

---

## Phase 4: Release

**Briefing:** The comedown. Step down from peak intensity but maintain the energy. Less chaos, more flow. The crowd catches their breath before the next build.

### Characteristics
- **Energy Level:** 70-80% brightness
- **Background Color:** Dark blue (`#000022` or `#000033`)
- **Movement:** Smoother transitions
- **Audio Focus:** Balance between rhythm and melody
- **Color Palette:**
  - Primary: Sky blue, aqua
  - Secondary: Soft purple, lavender
  - Accent: Subtle warm tones

### Normal Mode Effects
- **energy2** - Atmospheric flow with blue-purple gradient
- **plasma2d** - Smooth plasma animations
- **crawler** - Crawling patterns with relaxed speed
- **wavelength** - Spectrum visualization

### Crazy Mode Effects
- Reduced strobes (occasional accent only)
- Faster plasma movement
- Brief strobe bursts, not sustained

### Scene Tags
- `phase4`, `release`, `cooldown`

---

## Playlists (8 Total)

Each phase has **two playlists**: Normal (rhythm/pitch focused) and Crazy (with strobes). Each playlist contains multiple scenes with varied effects but consistent phase colors.

### Phase 1: Jungle Playlists

**Color Palette:** `linear-gradient(90deg, #228b22 0%, #00aa00 30%, #ffff00 70%, #0096c8 100%)` (Green → Yellow → Blue accents)

#### P1 Phase Normal (id: `p1-normal`)
Warm, rhythmic variety with green/yellow colors. No strobes. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P1-Wavelength | `wavelength` | Spectrum visualization with jungle colors |
| P1-Energy | `energy` | Frequency-reactive with additive mixing |
| P1-BladePower | `blade_power_plus` | Bass-reactive bars |
| P1-Gradient | `gradient` | Rolling color gradient |
| P1-Scroll | `scroll` | Smooth color chase |

#### P1 Phase Crazy (id: `p1-crazy`)
Same colors with strobe bursts. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P1-Wavelength | `wavelength` | Spectrum base |
| P1-Strobe | `strobe` | Yellow strobe flashes |
| P1-BladePower | `blade_power_plus` | Reactive bars |
| P1-Energy | `energy` | Frequency response |
| P1-Strobe | `strobe` | Strobe accent |
| P1-Scroll | `scroll` | Color chase |

---

### Phase 2: Buildup Playlists

**Color Palette:** `linear-gradient(90deg, #0044aa 0%, #00ffff 50%, #9900ff 100%)` (Blue → Cyan → Purple)

#### P2 Phase Normal (id: `p2-normal`)
Rising tension with blue/cyan colors. No strobes. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P2-Wavelength | `wavelength` | Spectrum with cool tones |
| P2-Energy | `energy` | Frequency-reactive energy |
| P2-BladePower | `blade_power_plus` | Bass visualization |
| P2-Gradient | `gradient` | Flowing gradient |
| P2-Scroll | `scroll` | Color chase |

#### P2 Phase Crazy (id: `p2-crazy`)
Same colors with increasing strobe intensity. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P2-Wavelength | `wavelength` | Spectrum base |
| P2-Strobe | `strobe` | Cyan strobe flashes |
| P2-BladePower | `blade_power_plus` | Bass bars |
| P2-Energy | `energy` | Frequency response |
| P2-Strobe | `strobe` | Strobe accent |
| P2-Scroll | `scroll` | Color chase |

---

### Phase 3: Peak Playlists

**Color Palette:** `linear-gradient(90deg, #9900ff 0%, #ff00aa 50%, #ff0000 100%)` (Purple → Magenta → Red)

#### P3 Phase Normal (id: `p3-normal`)
Maximum energy with purple/red colors. Bass-reactive. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P3-Wavelength | `wavelength` | Intense spectrum |
| P3-Energy | `energy` | High-sensitivity response |
| P3-Power | `power` | Bass hits with sparks |
| P3-BladePower | `blade_power_plus` | Reactive bars |
| P3-Scroll | `scroll` | Fast color chase |

#### P3 Phase Crazy (id: `p3-crazy`)
Full intensity with real_strobe. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P3-Power | `power` | Bass-reactive base |
| P3-RealStrobe | `real_strobe` | Intense percussion strobe |
| P3-BladePower | `blade_power_plus` | Reactive bars |
| P3-RealStrobe | `real_strobe` | Strobe accent |
| P3-Energy | `energy` | Frequency response |
| P3-Scroll | `scroll` | Color chase |

---

### Phase 4: Release Playlists

**Color Palette:** `linear-gradient(90deg, #3366cc 0%, #cc99ff 50%, #00ccff 100%)` (Blue → Lavender → Aqua)

#### P4 Phase Normal (id: `p4-normal`)
Cool down with blue/lavender colors. Flowing effects. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P4-Wavelength | `wavelength` | Soft spectrum |
| P4-Energy2 | `energy2` | Flowing atmospheric energy |
| P4-BladePower | `blade_power_plus` | Gentle bass response |
| P4-Gradient | `gradient` | Relaxed rolling gradient |
| P4-Scroll | `scroll` | Smooth color chase |

#### P4 Phase Crazy (id: `p4-crazy`)
Gentler strobes, longer transitions. 32s transitions.

| Scene | Effect | Description |
|-------|--------|-------------|
| P4-Wavelength | `wavelength` | Spectrum base |
| P4-Strobe | `strobe` | Lavender strobe |
| P4-BladePower | `blade_power_plus` | Bass bars |
| P4-Power | `power` | Energy hits |
| P4-Strobe | `strobe` | Strobe accent |
| P4-Energy2 | `energy2` | Flowing response |

---

## DJ Workflow

**Option 1: Stay in Phase**
- Use phase-specific playlists to maintain mood
- Switch Normal ↔ Crazy within phase for energy control

**Option 2: Progress Through Phases**
- Chain playlists manually: P1 → P2 → P3 → P4
- Mix Normal/Crazy as needed per phase

---

## Effect Reference

### Rhythm/Pitch Focused (Normal Modes)
| Effect | Category | Best For | Audio Response |
|--------|----------|----------|----------------|
| wavelength | Classic | Spectrum display | Full frequency |
| pitchSpectrum | Classic | Note detection | Pitch |
| energy2 | Atmospheric | Flowing visuals | Reactive speed |
| blade_power_plus | Classic | Bass bars | Frequency range |
| scroll | Classic | Color flow | Lows/Mids/Highs |
| power | Classic | Bass hits | Beat + sparks |
| bands | 2D | Frequency bars | Band count |
| equalizer2d | Matrix | Full EQ | All frequencies |
| water | Atmospheric | Ambient | Bass/Mids/Highs |
| rain | Classic | Particles | Beat/Mids/Highs |
| scan | Classic | Moving eye | BPM + power |
| plasma2d | Matrix | Ambient | Beat injection |
| concentric | Matrix | Radial pulse | Frequency range |
| crawler | Atmospheric | Flowing | Reactivity |

### Strobe Effects (Crazy Modes Only)
| Effect | Category | Best For |
|--------|----------|----------|
| strobe | BPM | Beat-synced flash |
| real_strobe | Classic | Percussion response |

---

## Effect Settings Guidelines

### Mirror Mode
Enable `mirror: true` on effects that animate from one end to the other. This creates symmetry and looks more professional:
- **wavelength** - always enable mirror
- **breathing** - always enable mirror
- **scroll** - enable mirror for centered look
- **energy** - enable mirror for balanced visuals

### Background Colors by Phase
| Phase | Background Color | Hex Code |
|-------|-----------------|----------|
| P1 Jungle | Dark Green | `#001a00` |
| P2 Buildup | Very Dark Purple | `#0a000a` |
| P3 Peak | Pure Black | `#000000` |
| P4 Release | Dark Blue | `#000022` |

### Effect-Specific Notes
- **breathing**: Only interesting when set to fast speed. Boring at slow speeds - use sparingly or with high frequency.
- **wavelength**: Always use with mirror enabled.
- **scroll**: Consider mirror for symmetric patterns.

---

## Tips for DJs

1. **Phase Timing:** Each phase should last 2-4 songs depending on set length
2. **Playlist Switching:** Switch between Normal and Crazy playlists for instant energy shift
3. **Manual Override:** Use individual scenes for specific moments
4. **Build Gradually:** P1 → P2 → P3 → P4 → P2 → P3 (repeat) for longer sets
5. **Peak Sparingly:** Don't stay in P3 Crazy too long - it loses impact

---

## Hardware Setup

- **Virtual:** 3linematrix (main output virtual)
- **Source Virtuals (for blender mode only):**
  - 3linematrix-background (background layer)
  - 3linematrix-foreground (foreground layer)
  - 3linematrix-mask (strobe/mask layer)
- **Other Virtuals:** baby (not used in DJ scenes)

---

## Effect Mode Architecture

### Direct Effects vs Blender
The 3linematrix virtual can operate in two modes:

#### Direct Effect Mode (Used by all P1-P4 scenes)
- **3linematrix** runs a direct effect (wavelength, energy, scroll, etc.)
- The effect renders directly to the LED matrix
- Source virtuals (background, foreground, mask) are **ignored**
- This is the mode used by all DJ phase scenes

#### Blender Mode (Advanced compositing)
- **3linematrix** runs the `blender` effect
- The blender composites multiple layers:
  - Background virtual → base layer
  - Foreground virtual → overlaid on top
  - Mask virtual → controls transparency/strobes
- **Important:** The blender effect config MUST specify the source virtual names:
  - `"background": "3linematrix-background"`
  - `"foreground": "3linematrix-foreground"`
  - `"mask": "3linematrix-mask"`
- All source virtuals MUST have active effects before applying blender

### Blender Scenes (8 Total)

Each phase has 2 blender scenes for advanced layered effects:

| Scene ID | Phase | Background | Foreground | Mask | Description |
|----------|-------|------------|------------|------|-------------|
| `p1-blender-jungle` | P1 | singleColor (dark green) | wavelength | singleColor (off) | Spectrum on solid bg |
| `p1-blender-disco` | P1 | gradient (green/yellow) | energy | strobe | Energy with disco strobe |
| `p2-blender-tension` | P2 | singleColor (dark purple) | blade_power_plus | singleColor (off) | Bass bars on moody bg |
| `p2-blender-rise` | P2 | gradient (blue/purple) | energy | strobe | Rising energy with flash |
| `p3-blender-power` | P3 | singleColor (black) | power | singleColor (off) | Bass power on pure black |
| `p3-blender-chaos` | P3 | gradient (purple/red) | blade_power_plus | real_strobe | Maximum chaos mode |
| `p4-blender-flow` | P4 | singleColor (dark blue) | energy2 | singleColor (off) | Flowing release |
| `p4-blender-ethereal` | P4 | gradient (blue/lavender) | wavelength | strobe | Gentle ethereal pulse |

### Creating Blender Scenes
When creating a blender scene:
1. Set effects on all source virtuals FIRST (background, foreground, mask)
2. For "no mask", use `singleColor` with `brightness: 0, color: #000000`
3. Apply `blender` effect to 3linematrix with source virtual names in config
4. Clear baby virtual
5. Delete and recreate the scene to save

### Scene Cleanliness
All P1-P4 scenes are configured with:
- **3linematrix**: Has the active effect with proper settings
- **Source virtuals**: Cleared (no effect) to avoid confusion
- **baby**: Cleared (not used in DJ workflow)

When a scene uses direct effects on 3linematrix, the source virtuals show empty in the UI. This is intentional - it indicates the scene is clean and uses direct mode, not blender compositing.

### Creating New Scenes
When creating a new DJ scene:
1. Set the effect directly on **3linematrix** (not on source virtuals)
2. Leave source virtuals empty/cleared
3. Include `mirror: true` and phase-appropriate `background_color`
4. Delete and recreate the scene to save current state

---

*Generated for LedFX MCP Server*

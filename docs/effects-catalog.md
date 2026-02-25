# LedFX Effects Catalog

> **Source**: Derived from LedFX v2.1.x source code (`ledfx/effects/`) and live schema API.  
> **Purpose**: Guide for building good blender scenes, playlists, and MCP automations.  
> Last verified: 2026-02-25

---

## Quick-Reference: Blender Role Selection

| Goal | Use these effects |
|------|-------------------|
| **Mask** (must be audio-reactive) | `energy`, `scroll`, `scroll_plus`, `bands`, `equalizer`, `wavelength`, `spectrum`, `magnitude`, `filter`, `bar`, `strobe`, `real_strobe`, `vumeter`, `pitchSpectrum`, `rain`, `hierarchy` |
| **⛔ Never as Mask** (non-reactive) | `fade`, `gradient`, `singleColor`, `rainbow`, `random_flash` |
| **Background** (ambient, low-energy) | `gradient`, `fade`, `singleColor`, `noise2d`, `blocks`, `multiBar` |
| **Foreground** (primary visual) | `fire`, `lava_lamp`, `melt`, `water`, `energy`, `crawler`, `energy2`, `plasma2d`, `plasmawled`, `melt_and_sparkle` |
| **Beat-locked accent** | `bar`, `multiBar`, `strobe`, `real_strobe`, `keybeat2d`, `game_of_life` |
| **Scan/directional motion** | `scan`, `scan_and_flare`, `scan_multi`, `scroll`, `scroll_plus`, `blade_power_plus` |
| **2D matrix only** | `bleep`, `concentric`, `equalizer2d`, `flame2d`, `gifplayer`, `imagespin`, `keybeat2d`, `noise2d`, `plasma2d`, `plasmawled`, `radial`, `soap2d`, `texter2d`, `waterfall2d`, `digitalrain2d` |

---

## Categories (from LedFX source)

LedFX uses these official CATEGORY values:  
`Classic` · `BPM` · `Atmospheric` · `Simple` · `2D` · `Matrix` · `Non-Reactive` · `Diagnostic`

**Rule of thumb**: Everything except `Non-Reactive` (and `Diagnostic`) is audio-reactive.

---

## Full Effect Reference

### 🎵 BPM — Beat-locked, pulse with tempo

| Effect ID | Display Name | Gradient | Blender Role Notes |
|-----------|-------------|----------|--------------------|
| `bar` | Bar | ✅ | Excellent mask: beat-locked bar sweep. Use with `beat_offset`/`beat_skip`. |
| `multiBar` | Multicolor Bar | ✅ | Good mask/foreground: multiple bars sweeping on beat. |
| `strobe` | BPM Strobe | ✅ | Mask: hard beat gating. Use sparingly; combine with calm foreground. |

**Blender guidance**: BPM effects are the sharpest mask option — they gate in exact tempo. Pair with a calm `Atmospheric` background.

---

### 🎵 Classic — Direct audio-reactive, frequency visualization

| Effect ID | Display Name | Gradient | Key Params | Blender Role Notes |
|-----------|-------------|----------|------------|--------------------|
| `bands` | Bands | ✅ | `band_count`, `align` | Mask/foreground: per-band columns driven by melbank. |
| `bands_matrix` | Bands Matrix | ✅ | `band_count` | 2D only. Foreground: matrix bands display. |
| `blade_power_plus` | Blade Power+ | | `frequency_range`, `multiplier` | Foreground/mask: sharp frequency spike. |
| `energy` | Energy | | `sensitivity`, `mixing_mode`, `color_lows/mids/high` | Best all-round mask: clean 3-band color zone reactivity. |
| `equalizer` | Equalizer | ✅ | `align`, `gradient_repeat` | Mask: full-spectrum EQ bars. |
| `filter` | Filter | ✅ | `frequency_range`, `roll_speed`, `boost` | Mask/foreground: frequency-filtered color roll. |
| `magnitude` | Magnitude | ✅ | `frequency_range` | Mask: single frequency band power meter. |
| `pitchSpectrum` | Pitch Spectrum | ✅ | `responsiveness`, `fade_rate` | Mask: MIDI pitch-mapped spectrum. |
| `power` | Power | ✅ | `bass_decay_rate`, `sparks_color` | Foreground: bass-driven sparks and glow. |
| `rain` | Rain | | `lows/mids/high sensitivity` | Foreground/mask: droplets per frequency band. |
| `real_strobe` | Strobe | ✅ | `strobe_color`, `strobe_rate` | Mask: audio-triggered strobe. Softer than `strobe`. |
| `scan` | Scan | ✅ | `frequency_range`, `bounce`, `speed` | Foreground/mask: frequency-driven scanner. |
| `scan_and_flare` | Scan and Flare | ✅ | `frequency_range` | Foreground: scanner with flare burst. |
| `scan_multi` | Scan Multi | ✅ | `speed` | Foreground: multiple simultaneous scanners. |
| `scroll` | Scroll | | `color_lows/mids/high`, `speed`, `decay` | Mask/foreground: 3-band color scroll. Classic and reliable. |
| `scroll_plus` | Scroll+ | | `color_lows/mids/high`, `scroll_per_sec` | Mask/foreground: improved scroll with per-sec control. |
| `spectrum` | Spectrum | | `rgb_mix` | Mask: full-spectrum RGB mix. No config needed. |
| `wavelength` | Wavelength | ✅ | `gradient` | Mask: melbank mapped to gradient. Simple and effective. |

**Blender guidance**: `energy`, `scroll`, `wavelength`, `equalizer` are the most reliable 1D masks — always audio-reactive, simple config.

---

### 🎵 Atmospheric — Flowing, texture-based, audio-modulated

| Effect ID | Display Name | Gradient | Key Params | Blender Role Notes |
|-----------|-------------|----------|------------|--------------------|
| `block_reflections` | Block Reflections | | `reactivity`, `speed` | Background/foreground: slow audio-textured blocks. |
| `crawler` | Crawler | | `reactivity`, `speed`, `chop`, `sway` | Foreground: audio-reactive crawler motion. |
| `energy2` | Energy 2 | | `reactivity`, `speed` | Foreground: smoother energy bands. Good as primary visual. |
| `fire` | Fire | ✅ | `speed`, `intensity`, `fade_chance` | Background/foreground: ambient flame. Not strongly reactive. |
| `glitch` | Glitch | | `reactivity`, `speed`, `saturation_threshold` | Foreground/mask: audio-reactive color glitch. |
| `lava_lamp` | Lava lamp | | `reactivity`, `speed`, `contrast` | Background/foreground: bubbly lava motion. |
| `marching` | Marching | | `reactivity`, `speed` | Foreground: marching gradient pulses. |
| `melt` | Melt | | `reactivity`, `speed` | Foreground: melting color effect. Pairs well with reactive mask. |
| `melt_and_sparkle` | Melt and Sparkle | | `reactivity`, `speed`, `strobe_threshold` | Foreground: melt with audio-driven sparkle bursts. |
| `water` | Water | | `bass_size`, `mids_size`, `high_size` | Foreground: ripple droplets per frequency band. |

**Blender guidance**: Atmospheric effects make excellent foregrounds. They provide visual richness while the mask handles audio reactivity. Keep `reactivity` low on backgrounds.

---

### 🎵 Simple — Minimal config, direct reactivity

| Effect ID | Display Name | Gradient | Key Params | Blender Role Notes |
|-----------|-------------|----------|------------|--------------------|
| `filter` | Filter | ✅ | `frequency_range`, `boost` | See Classic above. |
| `hierarchy` | Hierarchy | | `color_lows/mids/high`, `threshold_lows/mids` | Mask: layered frequency color zones, very clean. |

---

### 🎵 2D — Audio-reactive, 1D display (misleadingly named category)

| Effect ID | Display Name | Gradient | Notes |
|-----------|-------------|----------|-------|
| `bands` | Bands | ✅ | Works on 1D strips. |
| `bands_matrix` | Bands Matrix | ✅ | Better on matrix displays. |
| `blocks` | Blocks | ✅ | Beat-driven color blocks. |
| `equalizer` | Equalizer | ✅ | Full EQ bar graph. |

---

### 🖥️ Matrix — 2D effects (require 2D virtual / matrix display)

> ⚠️ All Matrix effects inherit from `Twod → AudioReactiveEffect` — they ARE audio-reactive, but the degree varies. Those without explicit `frequency_range` params react more subtly.

| Effect ID | Display Name | Gradient | Audio Intensity | Notes |
|-----------|-------------|----------|-----------------|-------|
| `bleep` | Bleep | ✅ | Strong (freq_range) | Rolling spectrogram display. |
| `concentric` | Concentric | ✅ | Strong (freq_range + beat) | Beat-expanding concentric rings. |
| `digitalrain2d` | Digital Rain | ✅ | Subtle (impulse_decay) | Matrix rain, audio modulates intensity. |
| `equalizer2d` | Equalizer2d | ✅ | Strong (bands) | Full EQ on 2D matrix. |
| `flame2d` | Flame | | Strong (low/mid/high bands) | Flame height = audio energy. |
| `game_of_life` | Game of Life | | Strong (beat injection) | Beat injects new life cells. |
| `gifplayer` | GIF Player | | None (plays static GIF) | Pure visual; no audio reactivity. |
| `imagespin` | Image | | Strong (freq → spin) | Frequency controls rotation speed. |
| `keybeat2d` | Keybeat2d | | Strong (beat frames) | Beat-timed image/animation. |
| `noise2d` | Noise | ✅ | Subtle (impulse_decay) | Perlin noise, audio modulates. |
| `number` | Number | ✅ | Subtle (impulse_decay) | Diagnostic numeric display. |
| `plasma2d` | Plasma2d | ✅ | Strong (freq_range) | Plasma animated by frequency. |
| `plasmawled` | PlasmaWled2d | ✅ | Strong (freq_range) | WLED-style plasma with audio. |
| `radial` | Radial | | Strong (freq_range) | Radial frequency visualizer. |
| `soap2d` | Soap | ✅ | Strong (freq_range) | Soap bubble simulation. |
| `texter2d` | Texter | ✅ | Subtle (impulse_decay) | Scrolling text, audio-modulated. |
| `waterfall2d` | Waterfall | ✅ | Strong (melbank) | Classic audio waterfall spectrogram. |
| `clone` | Clone | | None | Clones another virtual. |

---

### 🌊 Non-Reactive — No audio response (ambient/static)

> ⛔ **Never use as blender mask.** Use only as background or decorative foreground.

| Effect ID | Display Name | Gradient | Key Params | Good For |
|-----------|-------------|----------|------------|---------|
| `fade` | Fade | ✅ | `speed` | Background: slow color cycling. |
| `gradient` | Gradient | ✅ | `speed`, `gradient_roll` | Background: scrolling gradient. |
| `rainbow` | Rainbow | | `speed`, `frequency` | Background: classic rainbow roll. |
| `random_flash` | Random Flash | | `speed`, `hit_probability_per_sec` | Accent: random sparkle. |
| `singleColor` | Single Color | | `color`, `speed` (modulation) | Background: solid color base. |

---

### 🔧 Diagnostic — Dev/utility effects

| Effect ID | Display Name | Audio-Reactive | Notes |
|-----------|-------------|----------------|-------|
| `metro` | Metro | ✅ | Metronome pulse display (dev tool). |
| `vumeter` | VuMeter | ✅ | Volume meter (useful as subtle mask). |
| `pixels` | Pixels | ❌ | Random pixel sparkle. |
| `number` | Number | ✅ (subtle) | Numeric overlay (diagnostic). |

---

### 🔀 Special

| Effect ID | Display Name | Notes |
|-----------|-------------|-------|
| `blender` | Blender | Meta-effect: combines background + foreground using a mask. Do not use as a source layer in another blender. |

---

## Blender Construction Rules

### Layer Roles
```
Background  →  base layer; should provide ambient visual texture
Foreground  →  primary visual; can be static or dynamic
Mask        →  controls which pixels show through; MUST be audio-reactive
```

### The Golden Rules
1. **Mask must be audio-reactive** — `Non-Reactive` effects as masks produce lifeless blenders
2. **Avoid dual strobe** — don't put strobe in both foreground AND mask
3. **Background should be low-key** — keep `reactivity` ≤ 0.3 and `brightness` ≤ 0.7 for backgrounds
4. **At least 1 of bg/fg should be audio-reactive** — fully static blenders are dull

### Recommended Combos

| Style | Background | Foreground | Mask |
|-------|-----------|-----------|------|
| **Club energy** | `gradient` | `energy2` | `bar` |
| **Deep bass** | `lava_lamp` | `fire` | `scroll` |
| **Melodic flow** | `fade` | `water` | `wavelength` |
| **Hard BPM** | `singleColor` | `melt_and_sparkle` | `strobe` |
| **Ambient reactive** | `noise2d` (matrix) | `plasma2d` (matrix) | `equalizer2d` (matrix) |
| **Spectrum sweep** | `blocks` | `crawler` | `equalizer` |
| **Chill vibes** | `gradient` | `melt` | `hierarchy` |

---

## Parameter Quick Reference

| Parameter | Type | Range | Meaning |
|-----------|------|-------|---------|
| `reactivity` | float | 0–1 | How strongly audio modulates the effect |
| `speed` | float | varies | Animation speed (non-audio) |
| `frequency_range` | enum | Bass/Lows/Mids/High/... | Which frequency band drives the effect |
| `gradient` | gradient-string | CSS gradient | Color palette for gradient-capable effects |
| `blur` | float | 0–10 | Gaussian blur amount |
| `mirror` | bool | — | Mirror the effect left-right |
| `flip` | bool | — | Flip the effect direction |
| `brightness` | float | 0–1 | Overall brightness |
| `background_color` | color | hex | Fill color behind the effect |
| `color_lows` | color | hex | Color for bass frequencies (scroll/energy/rain) |
| `color_mids` | color | hex | Color for mid frequencies |
| `color_high` | color | hex | Color for high frequencies |

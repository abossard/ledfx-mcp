# LedFX MCP Server - Usage Guide

**Version:** 0.2.0  
**Last Updated:** 2026-02-01

## Table of Contents

1. [Getting Started](#getting-started)
2. [Natural Language Scene Creation](#natural-language-scene-creation)
3. [Palette Management](#palette-management)
4. [Playlist Management](#playlist-management)
5. [Color Library](#color-library)
6. [Effect Recommendations](#effect-recommendations)
7. [Learning LedFX](#learning-ledfx)
8. [Advanced Usage](#advanced-usage)

## Getting Started

### Understanding LedFX Concepts

**Devices** → Physical LED hardware (WLED, ESP32, OpenRGB, etc.)  
**Virtuals** → Logical LED strips where effects are applied  
**Effects** → Visual patterns (rainbow, pulse, etc.)  
**Scenes** → Saved configurations of multiple virtuals + effects  
**Palettes** → Custom color collections (managed by this MCP)  

**IMPORTANT:** Effects are applied to **virtuals**, not devices!

### First Steps

1. **Check LedFX Connection**
   ```
   "Get LedFX server info"
   ```

2. **List Your Virtuals**
   ```
   "List all my LED virtuals"
   ```

3. **Activate a Virtual**
   ```
   "Activate my desk-light virtual"
   ```

4. **Apply an Effect**
   ```
   "Set rainbow effect on my desk-light virtual"
   ```

## Natural Language Scene Creation

The MCP can parse natural language descriptions and create scenes automatically.

### Basic Examples

**Calm Scenes:**
```
"Create a calm ocean scene with slow blue waves"
```
Creates:
- Scene name: derived from description
- Effect: gradient or wavelength
- Colors: blue tones
- Speed: slow (20)
- Brightness: medium
- Tags: chill

**Energetic Scenes:**
```
"Make an energetic party scene with fast rainbow colors"
```
Creates:
- Effect: rainbow
- Speed: fast (80)
- Brightness: full
- Tags: party

**Romantic Scenes:**
```
"Create a romantic scene with dim pink and purple gradients"
```
Creates:
- Effect: gradient
- Colors: pink, purple
- Speed: medium
- Brightness: dim (0.5)
- Tags: mood, romantic

**Focus Scenes:**
```
"Build a focus scene with steady white light at medium brightness"
```
Creates:
- Effect: singleColor
- Color: white
- Brightness: medium (0.7)
- Speed: slow
- Tags: focus, work

### Advanced Scene Descriptions

**Multi-Color Scenes:**
```
"Create a sunset scene with orange, pink, and purple flowing slowly"
```

**Audio-Reactive:**
```
"Make a music visualization with pulse effect responding to bass"
```

**Specific Effects:**
```
"Create a strobe effect in neon green for party mode"
```

### Keywords the Parser Understands

**Speed:**
- slow, slowly, gentle, calm → speed: 20
- medium, moderate → speed: 50
- fast, quick, rapid, energetic → speed: 80

**Brightness:**
- dim, dimmed, low → brightness: 0.5
- medium → brightness: 0.7
- bright, maximum, max, full → brightness: 1.0

**Moods/Tags:**
- party, energetic, dance → tag: party
- relax, calm, chill, ambient → tag: chill
- work, focus, concentrate → tag: focus
- romantic, mood → tag: mood

**Colors:**
- Any of 50+ named colors (crimson, ocean, neon-pink, etc.)
- Gradients (sunset, ocean, fire, aurora, galaxy, etc.)

## Palette Management

Palettes are custom color collections stored locally in SQLite.

### Create a Palette

```
"Create a new palette called 'Tropical Paradise' with these colors: #FF6B6B, #FFE66D, #4ECDC4, #44A08D"
```

Or using named colors:
```
"Create a palette named 'Neon Dreams' with neon-pink, neon-green, neon-blue, and neon-purple"
```

### List Palettes

```
"List all my palettes"
```

Filter by category:
```
"Show me all nature-themed palettes"
```

### Get Palette Details

```
"Show me the 'Tropical Paradise' palette"
```

### Use Palette in Effects

```
"Apply the sunset gradient from my palette to desk-light"
```

### Delete a Palette

```
"Delete palette #5"
```

## Playlist Management

Playlists are sequences of scenes that play automatically.

### Create a Playlist

```
"Create a playlist called 'Evening Moods' with scenes: calm-ocean, sunset-glow, starry-night, with 10 seconds per scene"
```

### List Playlists

```
"Show all my playlists"
```

### Get Playlist Details

```
"Show me the 'Evening Moods' playlist"
```

### Playlist Features

- **Transition time**: How long each scene plays (seconds)
- **Looping**: Whether to repeat the playlist
- **Scene order**: Specific sequence of scenes

## Color Library

### Named Colors (50+)

**Basic:** black, white, red, green, blue, yellow, cyan, magenta

**Extended:** orange, purple, pink, brown, gray, silver, gold

**Vivid:** crimson, scarlet, coral, emerald, jade, turquoise, sapphire, indigo, violet

**Pastel:** pastel-pink, pastel-blue, pastel-green, pastel-purple

**Neon:** neon-pink, neon-green, neon-blue, neon-yellow, neon-purple

### Using Named Colors

```
"Find the crimson color"
```

```
"List all neon colors"
```

```
"Set effect to neon-pink on my strip"
```

### Gradients (15+)

**Classic:** rainbow

**Nature:** sunset, ocean, forest, spring, autumn, tropical

**Energy:** fire, lava

**Cool:** ice

**Cosmic:** aurora, galaxy

**Tech:** cyber, neon-nights

**Sweet:** candy

### Using Gradients

```
"List all available gradients"
```

```
"Apply the sunset gradient to my virtual"
```

```
"Show me nature-themed gradients"
```

## Effect Recommendations

Get smart suggestions based on mood or description.

### By Mood

```
"Recommend effects for a relaxing evening"
```
Returns:
- Slow ocean gradient
- Dim indigo single color
- Other calm effects

```
"Suggest effects for a party"
```
Returns:
- Fast rainbow
- Strobe effects
- Energetic pulses

### By Description

```
"What effects work well with music?"
```
Returns:
- Pulse (audio-reactive)
- Wavelength (frequency visualization)
- Energy (spectrum display)

```
"Suggest something energetic"
```

Each recommendation includes:
- Effect type
- Suggested config
- Reason for recommendation
- Confidence score

## Learning LedFX

Ask about any LedFX concept or feature!

### Feature Explanations

```
"Explain what virtuals are in LedFX"
```

```
"What's the difference between devices and virtuals?"
```

```
"How do audio-reactive effects work?"
```

```
"Tell me about WLED devices"
```

```
"Explain segments in LedFX"
```

### List All Features

```
"List all LedFX features you can explain"
```

Returns organized categories:
- Core Concepts
- Audio Features
- Visual Elements
- Technical

### Effect Types

```
"List all available effect types"
```

Each effect includes:
- Name and category
- Description
- Whether it's audio-reactive
- Common parameters

### Categories

**Classic:** rainbow, gradient, scroll  
**Audio:** pulse, wavelength, energy  
**Static:** singleColor  
**Energy:** strobe  

## Advanced Usage

### Virtual Management

**List Virtuals:**
```
"List all my virtuals"
```

**Get Virtual Details:**
```
"Show me details for virtual desk-light"
```

**Activate/Deactivate:**
```
"Activate my living-room virtual"
```
```
"Deactivate all bedroom virtuals"
```

### Effect Management

**Set Effect:**
```
"Set rainbow effect on desk-light with speed 75 and brightness 0.9"
```

**Update Effect:**
```
"Update desk-light effect to speed 50"
```

**Clear Effect:**
```
"Clear effect from desk-light"
```

**Get Effect Schemas:**
```
"Show me all available effect parameters"
```

### Preset Management

**Get Presets:**
```
"Show available presets for desk-light's current effect"
```

**Apply Preset:**
```
"Apply the 'Blue' preset to desk-light"
```

### Scene Management

**List Scenes:**
```
"List all my scenes"
```

**Activate Scene:**
```
"Activate my party scene"
```

**Create Scene:**
```
"Save current configuration as 'Morning Routine'"
```

**Delete Scene:**
```
"Delete the old-scene"
```

### Audio Devices

**List Audio Devices:**
```
"Show all audio input devices"
```

**Set Audio Device:**
```
"Set audio device to index 2"
```

## Tips and Tricks

### 1. Start Simple

Begin with basic commands, then add complexity:
```
"Set rainbow on desk-light"  →  
"Set fast rainbow on desk-light"  →  
"Set fast rainbow with high brightness on desk-light"
```

### 2. Use Natural Language

The MCP understands conversational language:
```
"Make my lights calm and blue"
"I want energetic party lighting"
"Create a romantic atmosphere"
```

### 3. Combine Features

```
"Create a scene called 'Sunset Chill' using the sunset gradient at slow speed, then add it to my Evening playlist"
```

### 4. Explore the Library

```
"List all vivid colors"
"Show me cosmic gradients"
"What categories of effects are available?"
```

### 5. Learn as You Go

```
"Explain audio-reactive"  → Learn the concept
"Recommend audio effects"  → Get suggestions
"Set pulse effect"  → Try it out
```

### 6. Save Your Favorites

```
"Save current setup as 'My Favorite'"
"Create palette from current colors"
"Add this scene to my favorites playlist"
```

## Common Workflows

### Morning Routine

```
1. "Activate all bedroom virtuals"
2. "Set gentle white light at 50% brightness"
3. "Save as 'Morning Wake-Up' scene"
```

### Party Setup

```
1. "Create energetic party scene with rainbow"
2. "Set audio device to system audio"
3. "Apply pulse effect to all virtuals"
4. "Save as 'Party Mode'"
```

### Work Focus

```
1. "Create focus scene with steady white light"
2. "Apply to desk virtuals only"
3. "Set brightness to 70%"
4. "Add to Work playlist"
```

### Evening Wind-Down

```
1. "Create playlist 'Evening Relax'"
2. "Add scenes: sunset, ocean, starlight"
3. "Set 15 minutes per scene"
4. "Enable looping"
```

## Troubleshooting

### "Virtual not found"

Make sure you're using virtual IDs, not device IDs. List virtuals first:
```
"List all my virtuals"
```

### "Effect not applying"

1. Check if virtual is active:
```
"Activate my-virtual"
```

2. Verify effect type:
```
"List all effect types"
```

### "Scene not activating"

Check scene exists:
```
"List all my scenes"
```

### Database Issues

Database is stored at `~/.ledfx-mcp/palettes.db`

If corrupted, delete and restart to recreate.

## Example Session

```
You: "List my virtuals"
MCP: [Shows all virtuals with IDs and status]

You: "Activate desk-light"
MCP: "Virtual 'desk-light' activated"

You: "Create a calm ocean scene with slow blue gradient"
MCP: [Creates scene with blue gradient, slow speed]
      "Scene 'calm ocean scene' created"

You: "List all ocean gradients"
MCP: [Shows ocean, tropical, and other water-themed gradients]

You: "Create a palette called 'My Ocean' with turquoise, aqua, and navy"
MCP: "Palette 'My Ocean' created with ID 1"

You: "Explain what audio-reactive means"
MCP: [Detailed explanation of audio-reactive effects]

You: "Recommend effects for meditation"
MCP: [Lists gradient, singleColor with reasons]

You: "Apply the first recommendation to desk-light"
MCP: "Gradient effect applied to desk-light"
```

## Resources

- **LedFX Documentation:** https://docs.ledfx.app/
- **Color Picker:** Use web tools to get hex codes for custom palettes
- **Effect Ideas:** Explore LedFX community for inspiration

---

**Have fun creating amazing LED displays! 🎨✨**

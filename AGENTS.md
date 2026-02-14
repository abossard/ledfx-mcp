# AI Agent Rules (Repository-Wide)

## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used in this repository.

### Available skills
- blender-archetype-library: Apply reusable blender scene archetypes (wobble, flow, hard, bullet) with controlled layer behavior. Use when designing or refactoring LedFX blender scenes and masks for readable yet high-impact DJ visuals. (file: /Users/abossard/Desktop/projects/ledfx-mcp/skills/blender-archetype-library/SKILL.md)
- dj-phase-composer: Compose phase-based DJ lighting scenes from creative rules into executable direct and blender scene specs. Use when translating a DJ guide into LedFX scene blueprints, role ordering, or phase playlist flows. (file: /Users/abossard/Desktop/projects/ledfx-mcp/skills/dj-phase-composer/SKILL.md)
- ledfx-mcp-tooling: Build or debug LedFX automations through MCP tools with schema-safe effect configs, fallback chains, and palette/gradient validation. Use when writing scripts or commands that call `ledfx_*` tools, especially `set_effect`, `set_blender`, scene, or playlist operations. (file: /Users/abossard/Desktop/projects/ledfx-mcp/skills/ledfx-mcp-tooling/SKILL.md)
- playlist-variety-auditor: Audit DJ lighting playlists for effect-family diversity, strobe density, phase coverage, and role balance. Use when validating that playlists are not repetitive and comply with guide constraints before showtime. (file: /Users/abossard/Desktop/projects/ledfx-mcp/skills/playlist-variety-auditor/SKILL.md)
- rapid-flow-designer: Design rapid directional lighting scenes that read as lightning-bullet motion with controlled intensity. Use when creating high-velocity LED looks with scroll/scan carriers and safe duration/pacing constraints. (file: /Users/abossard/Desktop/projects/ledfx-mcp/skills/rapid-flow-designer/SKILL.md)

### How to use skills
- Discovery: The list above is the skills available in this repository session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill description shown above, use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill path cannot be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) Open its `SKILL.md` and read only enough to execute the workflow.
  2) Resolve relative paths in a skill relative to that skill directory first.
  3) Load only the specific extra files needed (`references/`, `assets/`, etc), not the entire folder.
  4) If `scripts/` exist in the skill, prefer running or patching them over rewriting large blocks.
  5) Reuse templates/assets from skills when available.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the task and state the order.
  - Announce which skill(s) are being used and why in one short line.
- Context hygiene:
  - Keep context small: summarize large sections and load only required files.
  - Avoid deep reference-chasing unless blocked.
- Safety and fallback: If a skill is unclear or incomplete, state the issue, choose the next-best approach, and continue.

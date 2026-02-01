# GitHub Copilot Instructions for LedFX MCP Server

## Project Overview

This is a Model Context Protocol (MCP) server for controlling LedFX LED lighting systems. The project is written in TypeScript and follows specific software design principles.

## Core Principles

### Grokking Simplicity
When writing code for this project, follow these principles from "Grokking Simplicity":

1. **Separate Actions from Calculations**
   - **Actions**: Functions that perform I/O (API calls, file operations, logging). These have side effects.
   - **Calculations**: Pure functions that transform data without side effects.
   - Clearly comment which functions are actions vs calculations.

2. **Stratified Design**
   - Build in layers: MCP protocol → Tools → Client → HTTP API
   - Higher layers should call lower layers, never the reverse
   - Each layer should be a complete abstraction

3. **Minimize Implicit Inputs**
   - Prefer explicit function parameters over global state
   - Document any necessary shared state clearly

### A Philosophy of Software Design
When designing modules and interfaces:

1. **Deep Modules**
   - Create modules with simple interfaces that hide complex implementations
   - The LedFxClient is a good example: simple methods hide HTTP complexity

2. **Information Hiding**
   - Hide implementation details
   - Expose only what's necessary for the module's purpose
   - Example: HTTP details are hidden inside LedFxClient methods

3. **Minimize Complexity**
   - Each module should have a single, focused purpose
   - Keep interfaces narrow and well-defined
   - Avoid exposing unnecessary details

## Code Style Guidelines

### TypeScript
- Always use explicit return types for functions
- Prefer `interface` over `type` for object shapes
- Use strict TypeScript settings
- Avoid `any` - use `unknown` when type is truly unknown

### Comments
- Use JSDoc comments for public functions and classes
- Include brief implementation notes for complex logic
- Document which functions are "actions" vs "calculations"
- Explain design decisions when they're not obvious

### Naming
- Use descriptive names that explain purpose
- Prefix private methods/properties with `private` keyword
- Use camelCase for functions and variables
- Use PascalCase for classes and interfaces

### Error Handling
- Throw meaningful errors with context
- Catch errors at appropriate boundaries
- Log errors to stderr (not stdout, which is used for MCP protocol)

## Project Structure

```
src/
├── index.ts         # MCP server setup and entry point
├── ledfx-client.ts  # LedFX API client (deep module)
└── tools.ts         # MCP tool definitions and handlers
```

### Module Responsibilities

- **index.ts**: MCP server initialization, protocol handling
- **ledfx-client.ts**: All LedFX HTTP API interactions (actions)
- **tools.ts**: Tool definitions (data) and execution handlers (actions)

## When Adding New Features

### Adding a New Tool
1. Add tool definition to `tools` array in `tools.ts` (pure data)
2. Add handler case to `handleToolCall` function (action)
3. Add corresponding method to `LedFxClient` if needed (action)
4. Update README with tool documentation

### Adding Client Methods
1. Add method to `LedFxClient` class
2. Document it as an "action" in comments
3. Include proper error handling
4. Return typed data (define interfaces as needed)

### Extending Configuration
1. Update `LedFxConfig` interface
2. Update `createLedFxClient` factory function
3. Update README configuration section
4. Add environment variable documentation

## Testing Approach
- Build before committing: `npm run build`
- Lint code: `npm run lint`
- Ensure TypeScript compiles without errors
- Test with actual LedFX instance when possible

## Common Patterns

### Making HTTP Requests
Always use the `LedFxClient.request()` private method:
```typescript
async getNewResource(): Promise<ResourceType> {
  return await this.request<ResourceType>("/endpoint");
}
```

### Tool Handlers
Follow this pattern in `tools.ts`:
```typescript
case "tool_name": {
  const result = await client.methodName(args.param);
  return formatResponse(result);
}
```

### Pure Data Structures
Tool definitions should be pure data:
```typescript
{
  name: "tool_name",
  description: "Clear description of what it does",
  inputSchema: {
    type: "object",
    properties: { /* ... */ },
    required: ["required_param"]
  }
}
```

## Important Notes

- Never commit `node_modules/` or `dist/` directories
- Keep the `.gitignore` up to date
- Use stderr for logging (console.error), not stdout
- MCP protocol communication happens over stdio - don't pollute it
- Always handle LedFX connection errors gracefully

## Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [LedFX API Documentation](https://docs.ledfx.app/)
- Grokking Simplicity by Eric Normand
- A Philosophy of Software Design by John Ousterhout

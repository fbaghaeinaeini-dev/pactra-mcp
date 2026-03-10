# Contributing to Pactra MCP

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/pactra-dev/pactra-mcp.git
cd pactra-mcp
npm install
npm run build
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes in `src/`
3. Run `npm run build` to verify TypeScript compiles
4. Test with Claude Code by pointing your MCP config to the local build:
   ```json
   {
     "mcpServers": {
       "pactra": {
         "command": "node",
         "args": ["./dist/cli.js"],
         "env": { "PACTRA_API_KEY": "pk_test_your_key" }
       }
     }
   }
   ```
5. Open a pull request with a clear description of your changes

## Guidelines

- Keep changes focused — one feature or fix per PR
- Follow existing code style (TypeScript strict mode)
- Add clear error messages for new failure modes
- Update README if adding new tools or changing configuration

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Your MCP client (Claude Code, Claude Desktop, etc.)
- The error message (if any)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

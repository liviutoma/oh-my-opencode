# PROJECT KNOWLEDGE BASE: script/

**Focus:** Build System, CI Scripts, Release Automation.

## OVERVIEW
The `script/` directory contains the automation logic for the project's lifecycle. All scripts are written in TypeScript and executed via `bun run`.

## KEY SCRIPTS
- `build-schema.ts`: Generates `assets/oh-my-opencode.schema.json` from Zod schemas in `src/config/schema.ts`. Uses `zod-to-json-schema`.
- `publish.ts`: Full release pipeline. Version bumping -> `package.json` update -> Bun build -> NPM publish -> Git Tag -> GitHub Release.
- `generate-changelog.ts`: Extracts notable changes from `git log` and attributes community contributions via `gh api`.

## HIGHLIGHTS
- **Bun Shell ($)**: Deeply integrated for external command execution. Faster and safer than `child_process`.
- **Schema Generation**: Automated Zod-to-JSON-Schema conversion. Source of truth is `src/config/`.
- **Release Automation**: Integrated with GitHub Actions and NPM. Supports `--tag` for pre-releases.
- **Contributor Attribution**: Automatically thanks community members in release notes using GitHub API.
- **Git Tagging**: `publish.ts` handles semantic versioning and local/remote tag synchronization.

## ANTI-PATTERNS
- **Manual Versioning**: Avoid manual edits to `package.json` version. Use `publish.ts` or CI environment.
- **Shell Scripts**: DO NOT create `.sh` files. Use Bun-native TypeScript for cross-platform compatibility.
- **Hardcoded Secrets**: Never include tokens or keys. Use environment variables.
- **Broken Builds**: Never publish without running `bun run build` and `bun test`.

## COMMANDS
```bash
bun script/build-schema.ts      # Update JSON schema
bun script/publish.ts           # Run publish pipeline (Local or CI)
bun script/generate-changelog.ts # Preview changelog for next release
```

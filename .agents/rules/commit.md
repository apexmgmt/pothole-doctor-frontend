# Commit Message Generation Guidelines

When generating git commit messages for this project, you MUST strictly adhere to the rules defined in `commitlint.config.js`.

## Format

```
<type>(<scope>): <subject>
```

## Rules

1. **Type**: Must be exactly one of the following:
   - `feat` (e.g., add jwt login system)
   - `fix` (e.g., resolve login authentication issue)
   - `docs` (e.g., update installation guide)
   - `style` (e.g., fix button alignment and spacing)
   - `refactor` (e.g., optimize query for user listing)
   - `test` (e.g., add unit tests for login service)
   - `chore` (e.g., update npm dependencies)
   - `perf` (e.g., improve response time using redis)
   - `ci` (e.g., add workflow for automated testing)
   - `revert` (e.g., revert a previous commit)
   - `build` (e.g., changes that affect the build system)
   - `wip` (e.g., work in progress on authentication module)
   - `release` (e.g., v1.0.0 commit)
   - `hotfix` (e.g., fix critical payment gateway issue)
   - `config` (e.g., update environment configuration)
   - `security` (e.g., fix token vulnerability issue)
   - `db` (e.g., add users table schema)
   - `api` (e.g., add new user endpoint)

2. **Scope**: Must be strictly in `lower-case`.
3. **Subject**:
   - Must be strictly in `lower-case`.
   - Maximum length of 72 characters.
   - Must not be empty.
4. **Description**:
   - If the commit has more files, then add description in points

## Examples

- `feat(auth): add jwt login system`
- `style(ui): fix button alignment and spacing`

---

<!--
======================================================================
HOW TO ADD MORE SKILLS / INSTRUCTIONS FOR AIs
======================================================================
If you want to add more rules or teach the AI new skills, you can do so by editing the following files based on the AI tool you are using:

1. **For Antigravity**:
   Create new Markdown files in the `.gemini/skills/` folder. Antigravity will automatically read any `.md` files here.

2. **For GitHub Copilot**:
   Add your instructions to `.github/copilot-instructions.md`.

3. **For Claude AI (via Cursor IDE)**:
   Add your instructions to `.cursorrules` in the root directory.

Just write your instructions in plain English, and the AI will follow them!
======================================================================
-->

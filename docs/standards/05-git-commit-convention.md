Purpose: Define the Git workflow, branch naming rules, and commit message standards for AI-generated code and collaborative development.

🇬🇧 Section 1: AI Coding Rules (for AI to follow)
1. Branch Naming Rules

AI must always create branches using the following format:

<type>/<scope>/<short-description>


Examples:

feat/employee/add-create-api
fix/auth/token-refresh
chore/biome-fix
refactor/employee-form-validation


Allowed branch types:

Type	Meaning
feat	New feature or functionality
fix	Bug fix or patch
refactor	Code improvement without behavior change
style	Code style, format, import order
chore	Non-code tasks (config, deps, CI, scripts)
docs	Documentation only
test	Unit or integration tests
2. Commit Message Structure

Each commit message must follow the Conventional Commits format:

<type>(<scope>): <message>


Example:

feat(employee): add employee create service
fix(auth): handle expired access token correctly
chore(biome): auto organize imports

3. Commit Message Rules

Use lowercase for all message text.

Limit message length to ≤ 100 characters.

Scope (inside parentheses) is optional but encouraged.

Commit message must be in English.

AI must not include emojis or non-standard prefixes.

4. Commit Examples
✅ Correct	❌ Incorrect
feat(employee): add employee form validation	Added new employee validation
fix(auth): resolve missing refresh token	Fix bug
refactor(ui): simplify button props	UI update
chore(ci): update workflow to Node 20	updated ci file
5. Pull Request (PR) Rules

Each PR must include:

A clear title matching the first commit message.

A short description explaining:

What the PR does.

Why it’s needed.

Any special setup or dependency.

PR titles follow the same format:

feat(employee): add employee CRUD feature

6. Commit Frequency

One logical change per commit.
Don’t commit multiple unrelated changes together.

Prefer small, atomic commits over large “bulk updates”.

Example of good sequence:

feat(employee): add employee form schema
feat(employee): implement employee create service
feat(employee): connect form to backend

7. Commit Hooks

AI must assume that pre-commit hooks are active using husky and lint-staged.

Therefore, all commits must pass:

pnpm biome check .

pnpm typecheck

No commit should ever contain lint or type errors.

8. Merge Rules

Always prefer Squash Merge for feature branches.

The final merge message should summarize the feature:

feat(employee): complete employee CRUD module
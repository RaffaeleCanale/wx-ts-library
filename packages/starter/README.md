# @RaffaeleCanale/starter

Shared Vite+ tooling configuration providing linting (Oxlint) and formatting (Oxfmt) configurations for wx projects.

## Installation

The consumer project should have `vite-plus` installed:

```bash
pnpm add -D vite-plus @RaffaeleCanale/starter
```

## Usage

### 1. As a Vite+ Plugin (Recommended)

In your `vite.config.ts`:

```ts
import { defineConfig } from 'vite-plus';
import wxStarter from '@RaffaeleCanale/starter';

export default defineConfig({
    plugins: [wxStarter()],
});
```

You can pass options to customize linting or formatting:

```ts
import { defineConfig } from 'vite-plus';
import wxStarter from '@RaffaeleCanale/starter';

export default defineConfig({
    plugins: [
        wxStarter({
            lint: {
                ignores: ['custom-folder/**'],
                rules: {
                    'no-console': 'warn',
                },
            },
            fmt: {
                tabWidth: 2,
            },
        }),
    ],
});
```

### 2. Using Config Helper (`wxConfig` / `defineWxConfig`)

```ts
import { defineConfig } from 'vite-plus';
import { wxConfig } from '@RaffaeleCanale/starter';

export default defineConfig(
    wxConfig({
        // user vite / vite-plus options here
    }),
);
```

### 3. Granular Configs

You can also import individual configs:

```ts
import { wxLintConfig } from '@RaffaeleCanale/starter/lint';
import { wxFmtConfig } from '@RaffaeleCanale/starter/fmt';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    lint: wxLintConfig({
        ignores: ['generated/**'],
    }),
    fmt: wxFmtConfig({
        tabWidth: 4,
    }),
});
```

## Running Checks

Using the Vite+ CLI:

```bash
# Run format, lint, and type check
vp check

# Auto-fix formatting and autofixable lint errors
vp check --fix

# Lint only
vp lint
vp lint --fix

# Format only
vp fmt
```

## Standards Overview

### Formatter (`oxfmt`)

- Indentation: 4 spaces (`tabWidth: 4`)
- Quotes: Single quotes (`singleQuote: true`)
- Semicolons: Enabled (`semi: true`)
- Trailing commas: Enabled everywhere (`trailingComma: 'all'`)
- Package.json sorting: Enabled (`sortPackageJson: true`)

### Linter (`oxlint`)

- Type-aware linting and type-checking enabled
- Strict boolean expressions and strict promise checks enabled
- Consistent type definitions (`type` over `interface`)
- Explicit function declarations (`func-style: declaration`)
- Equality: strict equality (`eqeqeq`)
- Console logging restricted (`no-console: error`)
- Null safety: bans `null` in favor of `undefined` (`unicorn/no-null`, `typescript/no-restricted-types`)
- File naming conventions: PascalCase for files, kebab-case for `.d.ts`
- Named exports enforced in `src/` (`import/no-default-export`)
- Test files have relaxed type assertions and prefer `test` over `it` (`vitest/consistent-test-it`)

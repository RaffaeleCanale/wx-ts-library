import { describe, expect, test } from 'vitest';

import {
    defaultWxLintOverrides,
    defaultWxLintRules,
    wxFmtConfig,
    wxLintConfig,
    wxStarter,
} from './index.js';

describe('wxStarter plugin', () => {
    test('creates a valid Vite plugin with name', () => {
        const plugin = wxStarter();
        expect(plugin.name).toBe('@canale/starter');
        expect(typeof plugin.config).toBe('function');
    });

    test('plugin config hook returns lint and fmt settings from user config', () => {
        const plugin = wxStarter();
        // @ts-expect-error config hook invocation
        const resolved = plugin.config(
            {
                lint: {
                    ignores: ['temp/**'],
                    rules: {
                        'no-console': 'warn',
                    },
                },
                fmt: {
                    tabWidth: 2,
                },
            },
            { command: 'build', mode: 'production' },
        );
        expect(resolved?.lint?.rules?.['no-console']).toBe('warn');
        expect(resolved?.lint?.ignorePatterns).toContain('temp/**');
        expect(resolved?.fmt?.tabWidth).toBe(2);
    });

    test('auto-merges consumer-defined lint and fmt blocks while keeping default rules', () => {
        const plugin = wxStarter();

        const consumerConfig = {
            lint: {
                ignorePatterns: ['consumer-ignore/**'],
                rules: {
                    'no-console': 'off',
                    'my-custom-rule': 'error',
                },
            },
            fmt: {
                tabWidth: 2,
            },
        };

        // @ts-expect-error config hook invocation
        const resolved = plugin.config(consumerConfig, { command: 'build', mode: 'production' });

        // Consumer rules take precedence
        expect(resolved?.lint?.rules?.['no-console']).toBe('off');
        expect(resolved?.lint?.rules?.['my-custom-rule']).toBe('error');

        // Starter default rules are still preserved
        expect(resolved?.lint?.rules?.['eqeqeq']).toBe('error');
        expect(resolved?.lint?.rules?.['curly']).toBe('error');
        expect(resolved?.lint?.rules?.['unicorn/no-null']).toBe('error');

        // Consumer ignore patterns are merged with starter defaults
        expect(resolved?.lint?.ignorePatterns).toContain('consumer-ignore/**');
        expect(resolved?.lint?.ignorePatterns).toContain('**/dist/**');

        // Formatter option overridden
        expect(resolved?.fmt?.tabWidth).toBe(2);
        // Formatter default options preserved
        expect(resolved?.fmt?.singleQuote).toBe(true);
    });
});

describe('wxFmtConfig', () => {
    test('provides correct default formatting configuration', () => {
        const fmt = wxFmtConfig();
        expect(fmt.tabWidth).toBe(4);
        expect(fmt.singleQuote).toBe(true);
        expect(fmt.sortImports).toBe(true);
        expect(fmt.ignorePatterns).toContain('**/dist/**');
        expect(fmt.ignorePatterns).toContain('**/node_modules/**');
    });

    test('allows overriding formatting options', () => {
        const fmt = wxFmtConfig({
            tabWidth: 2,
            singleQuote: false,
            ignorePatterns: ['build/**'],
        });
        expect(fmt.tabWidth).toBe(2);
        expect(fmt.singleQuote).toBe(false);
        expect(fmt.ignorePatterns).toContain('build/**');
    });
});

describe('wxLintConfig', () => {
    test('provides correct default lint configuration', () => {
        const lint = wxLintConfig();
        expect(lint.plugins).toEqual(
            expect.arrayContaining(['typescript', 'unicorn', 'oxc', 'import', 'vitest']),
        );
        expect(lint.options?.typeAware).toBe(true);
        expect(lint.options?.typeCheck).toBe(true);

        expect(lint.rules).toEqual(expect.objectContaining(defaultWxLintRules));
        expect(lint.rules?.['typescript/strict-boolean-expressions']).toBeDefined();
        expect(lint.rules?.['typescript/no-confusing-void-expression']).toBeDefined();
        expect(lint.rules?.['typescript/no-misused-promises']).toBeDefined();
        expect(lint.rules?.['typescript/no-unused-vars']).toBeDefined();
        expect(lint.rules?.['typescript/consistent-type-definitions']).toEqual(['error', 'type']);
        expect(lint.rules?.['curly']).toBe('error');
        expect(lint.rules?.['eqeqeq']).toBe('error');
        expect(lint.rules?.['no-console']).toBe('error');
        expect(lint.rules?.['unicorn/no-null']).toBe('error');
        expect(lint.rules?.['unicorn/filename-case']).toBeDefined();
    });

    test('includes standard overrides for src, d.ts, and test files', () => {
        const lint = wxLintConfig();
        expect(lint.overrides).toEqual(expect.arrayContaining(defaultWxLintOverrides));

        const srcOverride = lint.overrides?.find((o) => o.files.some((f) => f.includes('src')));
        expect(srcOverride?.rules?.['import/no-default-export']).toBe('error');

        const dtsOverride = lint.overrides?.find((o) => o.files.some((f) => f.includes('d.ts')));
        expect(dtsOverride?.rules?.['import/no-default-export']).toBe('off');
        expect(dtsOverride?.rules?.['typescript/consistent-type-definitions']).toBe('off');

        const testOverride = lint.overrides?.find((o) => o.files.some((f) => f.includes('test')));
        expect(testOverride?.rules?.['typescript/no-explicit-any']).toBe('off');
        expect(testOverride?.rules?.['no-console']).toBe('off');
        expect(testOverride?.rules?.['vitest/consistent-test-it']).toEqual([
            'error',
            { fn: 'test', withinDescribe: 'test' },
        ]);
    });

    test('allows adding custom rules and ignores', () => {
        const lint = wxLintConfig({
            ignores: ['custom-ignore/**'],
            rules: {
                'no-console': 'off',
            },
        });
        expect(lint.ignorePatterns).toContain('custom-ignore/**');
        expect(lint.rules?.['no-console']).toBe('off');
    });
});

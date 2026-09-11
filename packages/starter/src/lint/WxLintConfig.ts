import type { OxlintConfig, OxlintOverride } from 'vite-plus/lint';

export type WxLintOptions = {
    /**
     * Additional globs to ignore when linting.
     */
    ignores?: string[];
    /**
     * Oxlint ignorePatterns alias.
     */
    ignorePatterns?: string[];
    /**
     * Additional rules or rule overrides.
     */
    rules?: OxlintConfig['rules'];
    /**
     * Additional file-specific overrides.
     */
    overrides?: OxlintOverride[];
    /**
     * Additional Oxlint options.
     */
    options?: OxlintConfig['options'];
};

export const defaultWxLintRules: NonNullable<OxlintConfig['rules']> = {
    // TypeScript & Logic Rules
    'typescript/strict-boolean-expressions': [
        'error',
        {
            allowString: true,
            allowNullableString: true,
            allowNumber: false,
            allowNullableNumber: false,
            allowNullableEnum: false,
            allowAny: false,
            allowNullableObject: true,
            allowNullableBoolean: true,
        },
    ],
    'typescript/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    'typescript/unbound-method': 'off',
    'typescript/no-deprecated': 'off',
    'typescript/no-misused-promises': [
        'error',
        {
            checksVoidReturn: {
                attributes: false,
            },
            checksConditionals: true,
            checksSpreads: true,
        },
    ],
    'typescript/no-unused-vars': [
        'error',
        {
            argsIgnorePattern: '^_$',
            caughtErrorsIgnorePattern: '^_$',
            destructuredArrayIgnorePattern: '^_$',
            varsIgnorePattern: '^_$',
        },
    ],
    'typescript/consistent-type-definitions': ['error', 'type'],
    'typescript/no-empty-function': 'off',
    'typescript/consistent-type-assertions': [
        'error',
        {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'never',
            arrayLiteralTypeAssertions: 'never',
        },
    ],
    'typescript/no-unnecessary-condition': 'error',
    'typescript/await-thenable': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-for-in-array': 'error',

    // Stylistic & Quality Rules
    curly: 'error',
    eqeqeq: 'error',
    'no-console': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
    'no-implicit-coercion': 'error',

    // Null safety - ban null in favor of undefined
    'unicorn/no-null': 'error',
    'typescript/no-restricted-types': [
        'error',
        {
            types: {
                null: {
                    message: 'Use undefined instead',
                    fixWith: 'undefined',
                },
            },
        },
    ],

    // File naming conventions
    'unicorn/filename-case': [
        'error',
        {
            case: 'pascalCase',
            ignore: ['index\\..*', '.*\\.config\\..*', '.*\\.d\\.ts$'],
        },
    ],

    // Modern JS & Unicorn recommendations
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/no-await-in-promise-methods': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'oxc/no-accumulating-spread': 'error',
    'oxc/only-used-in-recursion': 'error',
};

export const defaultWxLintOverrides: OxlintOverride[] = [
    {
        files: ['**/src/**/*'],
        rules: {
            'import/no-default-export': 'error',
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'import/no-default-export': 'off',
            'typescript/consistent-type-definitions': 'off',
            'unicorn/filename-case': ['error', { case: 'kebabCase' }],
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', '**/test-utils/*.{ts,tsx}'],
        rules: {
            'typescript/no-explicit-any': 'off',
            'typescript/no-non-null-assertion': 'off',
            'typescript/no-unsafe-assignment': 'off',
            'typescript/no-unsafe-call': 'off',
            'typescript/no-unsafe-member-access': 'off',
            'typescript/consistent-type-assertions': 'off',
            'typescript/restrict-template-expressions': 'off',
            'no-console': 'off',
            'vitest/consistent-test-it': ['error', { fn: 'test', withinDescribe: 'test' }],
        },
    },
];

/**
 * Default Oxlint configuration for wx projects in Vite+.
 */
export function wxLintConfig(options: WxLintOptions = {}): OxlintConfig {
    return {
        plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest'],
        env: {
            browser: true,
            node: true,
            es2024: true,
        },
        options: {
            typeAware: true,
            typeCheck: true,
            reportUnusedDisableDirectives: 'error',
            respectEslintDisableDirectives: true,
            ...options.options,
        },
        ignorePatterns: [
            '**/dist/**',
            '**/node_modules/**',
            '**/*.gen.ts',
            ...(options.ignores ?? []),
            ...(options.ignorePatterns ?? []),
        ],
        rules: {
            ...defaultWxLintRules,
            ...options.rules,
        },
        overrides: [...defaultWxLintOverrides, ...(options.overrides ?? [])],
    };
}

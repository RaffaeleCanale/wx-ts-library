import type { OxlintConfig } from 'vite-plus/lint';

export const RulesBase: Pick<OxlintConfig, 'rules' | 'plugins' | 'env'> = {
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'jsdoc', 'promise'],
    env: {
        builtin: true,
    },
    rules: {
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
        // 'typescript/no-unnecessary-condition': 'error',
        // 'typescript/await-thenable': 'error',
        // 'typescript/no-floating-promises': 'error',
        // 'typescript/no-for-in-array': 'error',

        // Stylistic & Quality Rules
        curly: 'error',
        eqeqeq: 'error',
        'no-console': 'error',
        'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
        'no-implicit-coercion': 'error',

        'unicorn/no-array-sort': 'off',

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
                ignore: ['index\\..*', '.*\\.config\\..*', '.*\\.d\\.ts'],
            },
        ],

        'typescript/explicit-member-accessibility': [
            'error',
            { accessibility: 'no-public', overrides: { properties: 'explicit' } },
        ],
        'import/no-default-export': 'error',
        'typescript/consistent-return': 'off',
        'typescript/no-explicit-any': 'error',

        'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    },
};

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 *
 * @param {string} projectDirectory
 * @param {*} tseslint
 * @returns
 */
export default function config(projectDirectory, tseslint, rules = {}) {
    return tseslint.config(
        {
            ignores: [
                '**/node_modules/*',
                '**/dist/*',
                '**/build/*',
                '**/coverage/*',
                '**/lib/*',
                '**/*.mjs',
                '**/*.js',
            ],
        },
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: projectDirectory,
                },
            },
        },
        eslint.configs.recommended,
        {
            name: 'typescript-eslint/base',
            languageOptions: {
                parser: tseslint.parser,
                sourceType: 'module',
            },
            plugins: {
                '@typescript-eslint': tseslint.plugin,
            },
        },
        ...tseslint.configs.strictTypeChecked.slice(1),
        ...tseslint.configs.stylisticTypeChecked.slice(1),
        eslintConfigPrettier,
        {
            rules: {
                '@typescript-eslint/no-confusing-void-expression': [
                    'error',
                    {
                        ignoreArrowShorthand: true,
                    },
                ],
                '@typescript-eslint/consistent-indexed-object-style': 'off',
                '@typescript-eslint/unbound-method': 'off',
                'no-console': ['error'],
                '@typescript-eslint/consistent-type-imports': ['error'],
                ...rules,
            },
        },
    );
}

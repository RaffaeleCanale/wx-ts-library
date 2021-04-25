module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:prettier/recommended',

    ],
    plugins: ['@typescript-eslint'],
    overrides: [
        {
            files: ['*.ts'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:prettier/recommended',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['./tsconfig.json'],
                sourceType: 'module',
                ecmaVersion: 2020,
            },
        },
        {
            files: ['*.vue'],
            extends: [
                'plugin:vue/vue3-essential',
                'eslint:recommended',
                '@vue/typescript',
            ],
            rules: {
                'vue/html-self-closing': ['error', {
                    html: {
                        // We allow void elements to be self-closing to be compatible with prettier.
                        // Prettier will always self-close void elements (see https://github.com/prettier/prettier/issues/5246)
                        void: 'any',
                        normal: 'always',
                        component: 'always',
                    },
                },
                ],
            },
            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },
    ],
}

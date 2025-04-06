import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';

import { defineRuleSet } from '../RuleSet.js';

export function RulesFilesAndImports({
    testFilesGlob,
}: {
    testFilesGlob: string[];
}) {
    return defineRuleSet({
        setup: [
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            {
                // Disable unnecessary rules as recommend by:
                // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
                rules: {
                    'import/named': 'off',
                    'import/namespace': 'off',
                    'import/default': 'off',
                    'import/no-named-as-default-member': 'off',
                    'import/no-unresolved': 'off',
                },
                plugins: { 'check-file': checkFile },
            },
        ],

        globalRules: {
            'import/no-extraneous-dependencies': ['error'],
        },

        srcRules: {
            /**
             * DESCRIPTION
             * Prevents the use of default exports (e.g. `export default function myFunction() {`).
             *
             * MOTIVATION
             * This is a purely stylistic rule. We decide to only use named exports because:
             * - They are more readable and consistent (e.g. no import renaming)
             * - They are easier to refactor and resolve through IDE search
             * - They can handle all use cases, without needing to also understand the what and why of default exports
             *
             *
             * @see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-default-export.md
             */
            'import/no-default-export': 'error',

            /**
             * DESCRIPTION
             * Prevents importing modules that are not listed in package.json dependencies.
             *
             * MOTIVATION
             * Any dev/peer/optional dependencies will not be included in the production bundle,
             * thus they generally should not be imported in the code.
             *
             * We do still allow type imports (`includeTypes`) as types are anyway stripped from the
             * production bundle, so technically they can be imported and used for type-checking's sake.
             *
             * @see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
             */
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: false,
                    optionalDependencies: false,
                    peerDependencies: false,
                    includeInternal: true,
                    includeTypes: false,
                },
            ],

            /**
             * DESCRIPTION
             * Prevents importing from test files in the source code.
             *
             * MOTIVATION
             * As we mix both source and test files in the same folder, it can be an easy
             * mistake to import a test file (or test-related util) in the source code.
             * This could have consequences such as further importing dev dependencies in the source code.
             *
             * @see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md
             */
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        {
                            target: '**/*',
                            from: testFilesGlob,
                        },
                    ],
                },
            ],

            /**
             * DESCRIPTION
             * Enforces the case conventions of filenames and folders.
             *
             * MOTIVATION
             * This is a purely stylistic rule, but consistency is key.
             * We chose to use PascalCase for file names and kebab-case for folders.
             * It is somewhat arbitrary, but a bad convention is better than no convention.
             *
             * @see https://github.com/DukeLuo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md
             */
            'check-file/filename-naming-convention': [
                'error',
                { '**/!(index.*)': 'PASCAL_CASE' },
                { ignoreMiddleExtensions: true },
            ],
            'check-file/folder-naming-convention': [
                'error',
                { '*': 'KEBAB_CASE' },
            ],
        },

        declarationFilesRules: {
            /**
             * DESCRIPTION
             * Allows default exports in .d.ts files.
             *
             * MOTIVATION
             * As we only use .d.ts files to declare library types, there may be cases where the libraries
             * use default exports. In these cases, we want to allow default exports in .d.ts files.
             */
            'import/no-default-export': 'off',
            /**
             * DESCRIPTION
             * Allows both interface and type declarations in .d.ts files.
             *
             * MOTIVATION
             * Sometimes .d.ts files are also used to augment existing interfaces. So
             * we allow the interface syntax in .d.ts files.
             */
            '@typescript-eslint/consistent-type-definitions': 'off',
            /**
             * DESCRIPTION
             * Forces .d.ts files to follow the kebab-case naming convention.
             *
             * MOTIVATION
             * This is arbitrary, most code bases use kebab-case for .d.ts files.
             */
            'check-file/filename-naming-convention': [
                'error',
                { '**/*': 'KEBAB_CASE' },
                { ignoreMiddleExtensions: true },
            ],
        },

        testRules: {
            'import/no-restricted-paths': 'off',
            'import/no-extraneous-dependencies': [
                'off',
                {
                    devDependencies: true,
                    optionalDependencies: true,
                    peerDependencies: true,
                    includeInternal: true,
                    includeTypes: true,
                },
            ],
        },
    });
}

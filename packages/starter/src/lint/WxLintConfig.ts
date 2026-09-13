import type { OxlintConfig, OxlintOverride } from 'vite-plus/lint';

import { RulesBase } from './RulesBase.js';
import { RulesNode } from './RulesNode.js';
import { RulesVitest } from './RulesVitest.js';
import { RulesVue } from './RulesVue.js';

export type WxLintOptions =
    | {
          applicationType: 'node' | 'vue';
      }
    | {
          applicationType: 'workspace';
          packagesFolder: string;
          packages: Record<string, { applicationType: 'node' | 'vue' }>;
      };

function getOverrides(options: WxLintOptions): OxlintOverride[] {
    if (options.applicationType === 'workspace') {
        return [
            {
                // Workspace-root
                files: ['**/*'],
                excludeFiles: [`${options.packagesFolder}/**/*`],
                ...RulesNode,
            },
            ...Object.entries(options.packages).flatMap(([packageName, packageConfig]) =>
                getProjectOverrides(
                    packageConfig.applicationType,
                    `${options.packagesFolder}/${packageName}/`,
                ),
            ),
        ];
    }

    return getProjectOverrides(options.applicationType);
}

function getProjectOverrides(applicationType: 'node' | 'vue', prefix = ''): OxlintOverride[] {
    return [
        {
            // SRC
            files: [`${prefix}src/**/*`],
            ...(applicationType === 'vue' ? RulesVue : RulesNode),
        },
        {
            // Non-src
            files: [`${prefix}**/*`],
            excludeFiles: [`${prefix}src/**/*`],
            ...RulesNode,
        },
        {
            // Tests
            files: [`${prefix}**/*.test.{ts,tsx}`, `${prefix}/**/test-utils/*.{ts,tsx}`],
            ...RulesVitest,
        },
    ];
}

/**
 * Default Oxlint configuration for wx projects in Vite+.
 */
export function wxLintConfig(userConfig: OxlintConfig, options: WxLintOptions): OxlintConfig {
    return {
        ...userConfig,

        plugins: [...(RulesBase.plugins ?? []), ...(userConfig.plugins ?? [])],

        env: {
            ...RulesBase.env,
            ...userConfig.env,
        },

        categories: {
            correctness: 'error',
            // style: 'error',
            nursery: 'error',
            // pedantic: 'error',
            // perf: 'error',
            // restriction: 'error',
            suspicious: 'error',
            ...userConfig.categories,
        },

        options: {
            typeAware: true,
            typeCheck: true,
            reportUnusedDisableDirectives: 'error',
            ...userConfig.options,
        },

        ignorePatterns: [
            '**/dist/**',
            '**/node_modules/**',
            '**/*.gen.ts',
            ...(userConfig.ignorePatterns ?? []),
        ],

        rules: {
            ...RulesBase.rules,
            ...userConfig.rules,
        },

        overrides: [
            ...getOverrides(options),
            {
                // Config files
                files: ['**/*.config.{ts,js,json}'],
                excludeFiles: ['**/src/**'],
                rules: {
                    'import/no-default-export': 'off',
                },
            },
            {
                // Ambient declaration files
                files: ['**/*.d.ts'],
                rules: {
                    'typescript/consistent-type-definitions': 'off',
                },
            },
            ...(userConfig.overrides ?? []),
        ],
    };
}

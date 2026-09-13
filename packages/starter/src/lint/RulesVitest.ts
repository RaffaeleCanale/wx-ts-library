import type { OxlintConfig } from 'vite-plus/lint';

export const RulesVitest: Pick<OxlintConfig, 'rules' | 'plugins' | 'env'> = {
    plugins: ['vitest'],
    env: {
        vitest: true,
    },
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
};

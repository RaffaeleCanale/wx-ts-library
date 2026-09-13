import type { OxlintConfig } from 'vite-plus/lint';

export const RulesNode: Pick<OxlintConfig, 'rules' | 'plugins' | 'env'> = {
    plugins: ['node'],
    env: {
        node: true,
    },
};

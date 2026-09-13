import type { OxlintConfig } from 'vite-plus/lint';

export const RulesVue: Pick<OxlintConfig, 'rules' | 'plugins' | 'env' | 'globals'> = {
    plugins: ['vue'],
    env: {
        browser: true,
        node: false,
    },
    rules: {
        // Add Vue-specific rules here
    },
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
    },
};

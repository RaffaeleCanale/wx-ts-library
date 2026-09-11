import { wxStarter } from '@canale/starter';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    plugins: [wxStarter()],
    test: {
        exclude: ['**/backup/**', '**/node_modules/**', '**/dist/**'],
    },
    lint: {
        ignorePatterns: ['packages/eslint-config-wx/**', 'backup/**'],
    },
    fmt: {
        ignorePatterns: ['packages/eslint-config-wx/**', 'backup/**'],
    },
});

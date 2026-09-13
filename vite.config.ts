import { wxStarter } from '@RaffaeleCanale/starter';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    plugins: [
        wxStarter({
            lint: { applicationType: 'workspace', packagesFolder: 'packages', packages: {} },
        }),
    ],
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

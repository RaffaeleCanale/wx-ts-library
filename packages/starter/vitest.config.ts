import { defineProject } from 'vitest/config';

export default defineProject({
    test: {
        exclude: ['src/eslint/example-files', 'dist', 'node_modules'],
    },
});

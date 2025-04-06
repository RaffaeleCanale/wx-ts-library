declare module 'eslint-plugin-import' {
    import type { Linter } from 'eslint';

    export const flatConfigs: {
        recommended: Linter.Config;
        typescript: Linter.Config;
    };
}

declare module 'eslint-plugin-check-file' {
    import type { ESLint } from 'eslint';

    const Plugin: ESLint.Plugin;
    export default Plugin;
}

declare module 'eslint-plugin-react' {
    import type { Linter } from 'eslint';
    export const configs: {
        flat: Record<'all' | 'recommended' | 'jsx-runtime', Linter.Config>;
    };
}

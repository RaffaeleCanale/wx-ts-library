import type { OxfmtConfig } from 'vite-plus/fmt';

export type WxFmtOptions = Partial<OxfmtConfig>;

/**
 * Default Oxfmt configuration for wx projects.
 * Matches previously used Prettier conventions (tabWidth: 4, singleQuote, etc.)
 */
export function wxFmtConfig(options: WxFmtOptions = {}): OxfmtConfig {
    return {
        tabWidth: 4,
        singleQuote: true,
        ignorePatterns: ['**/dist/**', '**/node_modules/**', ...(options.ignorePatterns ?? [])],
        sortImports: true,
        ...options,
    };
}

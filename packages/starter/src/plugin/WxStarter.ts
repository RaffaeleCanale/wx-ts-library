import type { Plugin, UserConfig } from 'vite-plus';

import { wxFmtConfig } from '../fmt/WxFmtConfig.js';
import { wxLintConfig, type WxLintOptions } from '../lint/WxLintConfig.js';

type WxStarterOptions = {
    lint: WxLintOptions;
};

/**
 * Vite+ plugin that configures Oxlint and Oxfmt according to wx standards.
 * Supports auto-merging with consumer-provided `lint` and `fmt` blocks.
 */
export function wxStarter(options: WxStarterOptions): Plugin {
    return {
        name: '@RaffaeleCanale/starter',
        config(userConfig: UserConfig = {}): UserConfig {
            return {
                lint: wxLintConfig(userConfig.lint ?? {}, options.lint),
                fmt: wxFmtConfig(userConfig.fmt),
            };
        },
    };
}

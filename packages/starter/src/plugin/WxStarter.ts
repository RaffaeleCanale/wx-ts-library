import type { Plugin, UserConfig } from 'vite-plus';

import { wxFmtConfig } from '../fmt/WxFmtConfig.js';
import { wxLintConfig } from '../lint/WxLintConfig.js';

/**
 * Vite+ plugin that configures Oxlint and Oxfmt according to wx standards.
 * Supports auto-merging with consumer-provided `lint` and `fmt` blocks.
 */
export function wxStarter(): Plugin {
    return {
        name: '@canale/starter',
        config(userConfig: UserConfig = {}): UserConfig {
            return {
                lint: wxLintConfig(userConfig.lint),
                fmt: wxFmtConfig(userConfig.fmt),
            };
        },
    };
}

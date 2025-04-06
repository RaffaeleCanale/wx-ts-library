import { ESLint, type Linter } from 'eslint';
import { resolve } from 'path';
import { describe, expect, test } from 'vitest';
import { wxEslintConfig } from './WxEslintConfig.js';

describe('RulesTests', () => {
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: wxEslintConfig() as Linter.Config[],
        cwd: resolve(import.meta.dirname, './example-files'),
        // baseConfig: [],
    });

    test('eslint', async () => {
        const result = await eslint.lintFiles('.');

        const problemsCount = result.reduce(
            (acc, file) => acc + file.messages.length,
            0,
        );

        if (problemsCount > 0) {
            console.warn(
                `Found ${problemsCount} problems:`,
                result.flatMap((file) =>
                    file.messages.map((message) => ({
                        path: `${file.filePath}:${message.line}:${message.column}`,
                        message: message.message,
                        rule: message.ruleId,
                    })),
                ),
            );
        }

        expect(problemsCount).toBe(0);
    });
});

import type { Linter } from 'eslint';
import 'eslint-plugin-only-warn';
import { defineConfig, globalIgnores } from 'eslint/config';
import type { ConfigArray } from 'typescript-eslint';
import { RulesBase } from './rule-sets/RulesBase.js';
import { RulesFilesAndImports } from './rule-sets/RulesFilesAndImports.js';
import { mergeRules } from './RuleSet.js';

type WxEslintConfigOptions = {
    additionalConfigs?: Linter.Config[];
    /**
     * List of globs to ignore when linting.
     */
    ignores?: string[];
};

export function wxEslintConfig({
    additionalConfigs = [],
    ignores = [],
}: WxEslintConfigOptions = {}): ConfigArray {
    const testFilesGlob = ['**/*.test.{ts,tsx}', '**/test-utils/*.{ts,tsx}'];
    const ruleSets = [RulesBase, RulesFilesAndImports({ testFilesGlob })];

    return defineConfig([
        globalIgnores([
            '**/dist/**',
            '**/node_modules/**',
            '**/*.gen.ts',
            ...ignores,
        ]),
        ...ruleSets.flatMap((ruleSet) => ruleSet.setup ?? []),
        {
            rules: mergeRules(ruleSets, 'globalRules'),
        },
        {
            files: ['**/src/**/*'],
            rules: mergeRules(ruleSets, 'srcRules'),
        },
        {
            files: ['**/*.d.ts'],
            rules: mergeRules(ruleSets, 'declarationFilesRules'),
        },
        {
            files: testFilesGlob,
            rules: mergeRules(ruleSets, 'testRules'),
        },
        ...ruleSets.flatMap((ruleSet) => ruleSet.additionalConfigs ?? []),
        ...additionalConfigs,
    ]);
}

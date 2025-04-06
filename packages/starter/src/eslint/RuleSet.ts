import type { Linter } from 'eslint';

type RuleSet = {
    setup?: Linter.Config[];
    globalRules?: Linter.RulesRecord;
    srcRules?: Linter.RulesRecord;
    declarationFilesRules?: Linter.RulesRecord;
    testRules?: Linter.RulesRecord;
    additionalConfigs?: Linter.Config[];
};

export function defineRuleSet(ruleSet: RuleSet): RuleSet {
    return ruleSet;
}

export function mergeRules(
    ruleSets: RuleSet[],
    key: Exclude<keyof RuleSet, 'setup' | 'additionalConfigs'>,
): Linter.RulesRecord {
    const result: Linter.RulesRecord = {};
    for (const ruleSet of ruleSets) {
        Object.assign(result, ruleSet[key]);
    }
    return result;
}

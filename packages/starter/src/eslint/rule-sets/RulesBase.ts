import eslint from '@eslint/js';
import type { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import { defineRuleSet } from '../RuleSet.js';

export const RulesBase = defineRuleSet({
    setup: [
        // GENERAL CONFIG
        {
            languageOptions: {
                globals: globals.browser,
                parserOptions: {
                    projectService: true,
                },
            },
            settings: {
                react: {
                    version: 'detect',
                },
                'import/resolver': {
                    typescript: true,
                    node: true,
                },
            },
            linterOptions: {
                reportUnusedDisableDirectives: 'error',
                reportUnusedInlineConfigs: 'error',
            },
        },

        // TS & JS
        eslint.configs.recommended,
        ...(tsEslint.configs.strictTypeChecked as Linter.Config[]),
        ...(tsEslint.configs.stylisticTypeChecked as Linter.Config[]),
        eslintConfigPrettier,
    ],

    globalRules: {
        /**
         * DESCRIPTION
         * Prevents boolean expressions with ambiguous truthiness (e.g. `if (myNumber) {`).
         *
         * MOTIVATION
         * This is a very common source of bugs due as not everyone is familiar about the truthiness behaviors of JavaScript.
         * So we prefer to enforce a more explicit writing style (e.g. `if (myNumber !== undefined && myNumber !== 0) {`).
         *
         * - allowString/allowNullableString:
         *      Not everyone is aware that an empty string `''` is falsy, which can lead to wrong assumptions
         *      (e.g. `if (myOptionalString) {` returns false for ''). However, as it's almost more common to
         *      filter out empty strings as well, we allow it.
         * - allowNumber/allowNullableNumber:
         *      Not everyone is aware that the number 0 is falsy, which can lead to wrong assumptions
         *      (e.g. `if (myOptionalNumber) {` returns false with 0).
         * - allowNullableObject:
         *      There is ambiguity here as an object will only be falsy if it is `null` or `undefined`, no other edge cases.
         * - allowNullableBoolean:
         *      Although there is an ambiguity here (e.g. `if (myOptionalBoolean) {` returns false if undefined or false),
         *      it is common to assume that a null boolean equates to false, so we allow it.
         *
         *
         * @see https://typescript-eslint.io/rules/strict-boolean-expressions/
         */
        '@typescript-eslint/strict-boolean-expressions': [
            'error',
            {
                allowString: true,
                allowNullableString: true,
                allowNumber: false,
                allowNullableNumber: false,
                allowNullableEnum: false,
                allowAny: false,
                allowNullableObject: true,
                allowNullableBoolean: true,
            },
        ],

        /**
         * DESCRIPTION
         * When a function returns `void`, this rule prevents the return value from being used.
         * E.g. `const foo = myVoidFunction();` or `return myVoidFunction();` will trigger this rule.
         *
         * MOTIVATION
         * If the return value of a void function is used, it is almost always a mistake or misunderstanding, so this rule
         * helps to catch these bugs early.
         *
         * - ignoreArrowShorthand
         *     We enable this option because it is very idiomatic to 1-line arrow functions, including with void functions.
         *     E.g. `onClick={() => someVoidFunction()}`. Although these examples suffer the same risk, they are
         *     so common and idiomatic we prefer not to restrict them.
         *
         * @see https://typescript-eslint.io/rules/no-confusing-void-expression/
         */
        '@typescript-eslint/no-confusing-void-expression': [
            'error',
            { ignoreArrowShorthand: true },
        ],

        /**
         * DESCRIPTION
         * Prevents to call unbound methods (e.g. `myArray.flatMap(someMapping)`) and forces to always bind them
         * (e.g. `myArray.flatMap(someMapping.bind(this))` or `myArray.flatMap((x) => someMapping(x))`).
         *
         * This rule exists because if `someMapping` has any reference to `this`, the unbound approach will cause unexpected errors.
         *
         * MOTIVATION
         * As we prefer functional programming and almost never rely on `this`, we can disable this rule.
         * Unbound functions are safe to use for as long as they don't rely on `this`, which is the case in our entire codebase.
         *
         * @see https://typescript-eslint.io/rules/unbound-method/
         */
        '@typescript-eslint/unbound-method': 'off',

        /**
         * DESCRIPTION
         * This rule warns when the @deprecated annotation is used
         *
         * MOTIVATION
         * As any ESLint warning is blocking the merge, we disable this rule to still allow
         * devs to use the @deprecated annotation when necessary.
         *
         * @see https://typescript-eslint.io/rules/no-deprecated/
         */
        '@typescript-eslint/no-deprecated': 'off',

        /**
         * DESCRIPTION
         * Prevents the misuse of promises, for example by forgetting to `await` a promise.
         * In other words, this forces to always handle promises, or to explicitly ignore them (e.g. `void callThisAsyncWithoutWaiting()`).
         *
         * MOTIVATION
         * This rule prevents very common misuses of promises. However, there are cases especially in React
         * where it is idiomatic to pass a function returning a promise to an event handler.
         * (e.g. `onClick={doMyAsyncThing}`)
         *
         * Therefore we disable this rule for JSX attributes only.
         *
         * @see https://typescript-eslint.io/rules/no-misused-promises/
         */
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                checksVoidReturn: {
                    attributes: false,
                },
                checksConditionals: true,
                checksSpreads: true,
            },
        ],

        /**
         * DESCRIPTION
         * Basic rule that prevents unused variables.
         *
         * MOTIVATION
         * We slightly adapt this rule to still allow unused variables but only if they are named `_`.
         * There are a few cases, like destructuring, where this can be useful.
         * E.g. `const { notNeeded: _, ...rest } = someObject;`
         *
         * @see https://typescript-eslint.io/rules/no-unused-vars/
         */
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_$',
                caughtErrorsIgnorePattern: '^_$',
                destructuredArrayIgnorePattern: '^_$',
                varsIgnorePattern: '^_$',
            },
        ],

        /**
         * DESCRIPTION
         * This rule enforces types to either always use `type` or always use `interface`.
         *
         * MOTIVATION
         * This is somewhat opinionated and not everyone agrees, but consistency is key.
         * Type and interfaces have slightly different semantics and syntaxes. But as type can do most of what interface can (the reverse is not true),
         * especially for our use cases, then for consistency's sake we prefer `type`. In particular cases where interface is needed, this rule can be disabled.
         *
         * References:
         * - https://www.totaltypescript.com/type-vs-interface-which-should-you-use
         * - https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces
         *
         * @see https://typescript-eslint.io/rules/consistent-type-definitions/
         */
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

        /**
         * DESCRIPTION
         * Purely stylistic rule that prevents empty functions.
         *
         * MOTIVATION
         * As there can be use cases for empty functions and they cause no harm, we disable this rule.
         *
         * @see https://eslint.org/docs/latest/rules/no-empty-function
         */
        '@typescript-eslint/no-empty-function': 'off',

        /**
         * DESCRIPTION
         * Purely stylistic rule that enforces curly brackets around if statements.
         *
         * MOTIVATION
         * We decide to enable this rule just for code consistency, as Prettier doesn't cover this.
         *
         * @see https://eslint.org/docs/latest/rules/curly
         */
        curly: 'error',

        /**
         * DESCRIPTION
         * Enforces the use of `===` (or `!==`) instead of `==` (or `!=`).
         *
         * MOTIVATION
         * Using `==` can lead to unexpected behavior as it performs type coercion, which is almost never what we want.
         * On the other hand, `===` fits most developers' expectations and there should be no reason to ever use ==.
         *
         * @see https://eslint.org/docs/latest/rules/eqeqeq
         */
        eqeqeq: ['error'],

        /**
         * DESCRIPTION
         * Disable the use of `console.log` and other console methods.
         *
         * MOTIVATION
         * Logging directly to the console is not a good practice, as all logs are easily accessible to end users
         * and exposes unnecessary insights into the application's inner workings.
         * Instead, our applications should use a Logger implementation which can be configured
         * for every environment and possibly even integrate with monitoring tools like Sentry.
         *
         * @see https://eslint.org/docs/latest/rules/no-console
         */
        'no-console': 'error',

        /**
         * DESCRIPTION
         * Forces to write function with the `function` keyword instead of arrow functions.
         * E.g. `function myFunction() {` instead of `const myFunction = () => {`.
         *
         * MOTIVATION
         * This is opinionated, but consistency is key.
         * We prefer the `function` syntax because declaring functions with the `function` keyword
         * is more readable and doesn't suffer some of the limitations such as declaration order.
         *
         * Note: This doesn't ban arrow functions, they are still the recommended syntax for lambdas. This
         * rule only applies to function declarations.
         *
         * @see https://eslint.org/docs/latest/rules/func-style
         */
        'func-style': ['error', 'declaration', { allowArrowFunctions: false }],

        /**
         * DESCRIPTION
         * Disallows the use of `as` for type assertions.
         *
         * MOTIVATION
         * The `as` keyword is a common source of bugs and can easily lead to type errors when misused.
         * In the majority of cases, a type assertion can be avoided with better type definitions or type inference, which
         * is what this rule promotes.
         *
         * Although there are cases where `as` is necessary.
         *
         * @see https://typescript-eslint.io/rules/consistent-type-assertions/
         */
        '@typescript-eslint/consistent-type-assertions': [
            'error',
            {
                assertionStyle: 'as',
                objectLiteralTypeAssertions: 'never',
                arrayLiteralTypeAssertions: 'never',
            },
        ],

        /**
         * DESCRIPTION
         * Disallows implicit type coercion (e.g. `const myString = 'hello ' + myObject`).
         *
         * MOTIVATION
         * Most of the time, when coercion is used, it is a mistake or a misunderstanding of the code.
         * So we want to prevent this behavior to avoid bugs.
         *
         * @see https://eslint.org/docs/latest/rules/no-implicit-coercion
         */
        'no-implicit-coercion': ['error'],

        /**
         * DESCRIPTION
         * This run bans the usage of `null`, and prefers `undefined` instead.
         *
         * MOTIVATION
         * Although JS plagues us with both `null` and `undefined`, we can "decide" to use only one
         * and avoid all the small intricacies that come when differentiating between the two.
         *
         * This rule doesn't guarantee that `null` will never appear in the codebase, as it could still come
         * from external libraries, but it will enforce us to immediately replace them with `undefined`.
         * And thus, our codebase can have the luxury of only dealing with a single "null-like" value.
         *
         * We decided to use `undefined` instead of `null` as the one "null-like" value because it is the
         * most "natural" to JS. For example, it allows to work with optionals (e.g. `type MyObj = { key?: string }`).
         *
         * This is the same conclusion reached by the TypeScript internal team:
         * - https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined
         *
         */
        'no-restricted-syntax': [
            'error',
            {
                selector: 'Literal[raw="null"]',
                message: 'Use "undefined" instead of "null".',
            },
        ],
        '@typescript-eslint/no-restricted-types': [
            'error',
            {
                types: {
                    null: {
                        message: 'Use undefined instead',
                        fixWith: 'undefined',
                    },
                },
            },
        ],
    },

    testRules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react/jsx-no-literals': ['off'],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'vitest',
                        importNames: ['it'],
                        message: 'Use test instead',
                    },
                ],
            },
        ],
    },
});

import { wxEslintConfig } from '@canale/starter/eslint';

export default wxEslintConfig({
    // Package is deprecated
    ignores: [
        'packages/starter/src/eslint/example-files',
        'prettier.config.js',
        'packages/eslint-config-wx',
    ],
    additionalConfigs: [
        {
            rules: {
                'import/no-extraneous-dependencies': 'off',
            },
        },
    ],
});

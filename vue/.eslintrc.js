module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
    ],
    rules: {
        'no-console': ['error', {allow: ['warn', 'error']}],
        'quote-props': ['error', 'as-needed'],
        quotes: ['error', 'single', {avoidEscape: true}]
    }
};

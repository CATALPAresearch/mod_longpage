module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
    ],
    globals: {
        MathJax: 'readonly',
    },
    rules: {
        curly: ['error', 'multi-line'],
        'no-console': ['error', {allow: ['warn', 'error']}],
        'quote-props': ['error', 'as-needed'],
        quotes: ['error', 'single', {avoidEscape: true}]
    }
};

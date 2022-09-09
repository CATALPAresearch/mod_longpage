module.exports = {
    env: {
        browser: true,
        //node: true,
        //"es2015": true
    },
    extends: [
        'eslint:recommended',
        //'plugin:vue/vue3-recommended',
        "plugin:vue/vue3-essential"
    ],
    globals: {
        $: 'readonly',
        MathJax: 'readonly',
    },
    rules: {
        curly: ['error', 'multi-line'],
        'no-console': ['error', {allow: ['warn', 'error']}],
        'object-shorthand': ['error'],
        'quote-props': ['error', 'as-needed'],
        quotes: ['error', 'single', {avoidEscape: true}],
    },
    "plugins": [
        "vue"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    }
};




module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "env": {
        "browser": true
    },
    "rules": {
        "indent": ["error", 4],
        "prefer-const": "off",
        "space-before-function-paren": ["error", {
            "anonymous": "always",
            "named": "never",
            "asyncArrow": "always"
        }],
        "class-methods-use-this": "off"
    }
};
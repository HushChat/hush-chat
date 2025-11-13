import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactNative from 'eslint-plugin-react-native';

export default [
    {
        ignores: ['node_modules/**', 'android/**', 'ios/**', 'build/**', 'dist/**', 'scripts/**', '**/apps/frontend/hushchat-mobile/scripts/**']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                __DEV__: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            'react-hooks': pluginReactHooks,
            'react-native': pluginReactNative,
        },
        rules: {
            // React Native
            'react-native/no-unused-styles': 'error',
            'react-native/split-platform-components': 'error',
            'react-native/no-inline-styles': 'warn',
            'react-native/no-color-literals': 'warn',
            'react-native/no-single-element-style-arrays': 'error',

            // React Hooks
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'off',

            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',

            // TypeScript
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',

            // General
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-unused-vars': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'no-duplicate-imports': 'error',
            'max-lines': ['warn', { max: 300, skipBlankLines: true }],
        },
        settings: {
            react: { version: 'detect' },
          'import/resolver': {
            node: {
              extensions: [
                '.js',
                '.jsx',
                '.ts',
                '.tsx',
                '.web.tsx',
                '.native.tsx'
              ],
            },
            typescript: {},
          },
        },
    },
];
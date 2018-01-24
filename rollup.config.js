import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';

export default {
    input: 'src/main.js',
    output: {
        globals: {
            firebase: 'firebase',
        },
        file: 'bundle.js',
        format: 'iife',
    },
    external: ['firebase'],
    sourcemap: 'inline',
    name: 'minichat',
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        css({
            output: 'bundle.css',
        }),
    ],
};

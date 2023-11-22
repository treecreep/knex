import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
    input: 'dist/knex.js',
    output: {
        file: 'dist/knex2.js',
        format: 'esm'
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        json()
    ]
}
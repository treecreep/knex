import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'knex.mjs',
    output: {
        file: 'dist/knex.js',
        format: 'esm'
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false,
            alias: {
                timers: 'timers-browserify',
                util: 'util.browserify',
                stream: 'stream-browserify',
                assert: 'assert-browserify',
                tty: 'tty-browserify',
                fs: false,
                crypto: 'crypto-browserify'
            }
        }),
        commonjs()
    ]
}
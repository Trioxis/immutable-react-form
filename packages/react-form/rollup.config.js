import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs({
      include: [
        './node_modules/**',
        '../../node_modules/**'
      ]
    }),
    babel({
      exclude: [
        './node_modules/**',
        '../../node_modules/**'
      ],
      runtimeHelpers: true
    })
  ],
  external: Object.keys(pkg.peerDependencies),
};
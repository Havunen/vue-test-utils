import {rollup} from 'rollup';
import flow from 'rollup-plugin-flow-no-whitespace';
import {resolve} from 'path';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import chalk from 'chalk';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';

function success(text) {
  console.log(chalk.green(`${text} ✔`))
}

function error(text) {
  console.log(chalk.red(`${text} ✘`))
}

const rollupOptionsBuild = [
  {
    file: 'dist/vue-test-utils.js',
    format: 'cjs'
  },
  {
    file: 'dist/vue-test-utils.iife.js',
    format: 'iife',
    name: 'VueTestUtils',
    globals: {
      vue: 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  },
  {
    file: 'dist/vue-test-utils.esm.mjs',
    format: 'esm',
    name: 'VueTestUtils',
    globals: {
      vue: 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  },
  {
    file: 'dist/vue-test-utils.umd.js',
    format: 'umd',
    name: 'VueTestUtils',
    globals: {
      vue: 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    },
    moduleName: 'vueTestUtils'
  }
]

const rollupOptionsTest = [
  {
    file: 'dist/vue-test-utils.js',
    format: 'cjs',
    sourcemap: 'inline'
  }
]

const rollupOptions =
  process.env.NODE_ENV === 'test' ? rollupOptionsTest : rollupOptionsBuild

rollupOptions.forEach(options => {
  rollup({
    input: resolve('src/index.js'),
    external: ['vue', 'vue-template-compiler'],
    plugins: [
      del({ targets: 'dist/*' }),
      replace({
        'process.env.SHOW_DEPRECATIONS': process.env.SHOW_DEPRECATIONS
      }),
      flow(),
      json(),
      nodeResolve(),
      commonjs()
    ]
  })
    .then(bundle => {
      bundle.write(options)
    })
    .then(() => success(`${options.format} build successful`))
    .catch(err => {
      error(err)
      process.exit(1)
    })
})

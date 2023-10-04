import {rollup} from 'rollup';
import flow from 'rollup-plugin-flow-no-whitespace';
import {resolve} from 'path';
import buble from '@rollup/plugin-buble';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import chalk from 'chalk';
import json from '@rollup/plugin-json';

function success(text) {
  console.log(chalk.green(`${text} ✔`))
}

function error(text) {
  console.log(chalk.red(`${text} ✘`))
}

const rollupOptionsBuild = [
  {
    file: 'dist/vue-server-test-utils.js',
    format: 'cjs'
  }
]

const rollupOptionsTest = [
  {
    file: 'dist/vue-server-test-utils.js',
    format: 'cjs',
    sourcemap: 'inline'
  }
]

const rollupOptions =
  process.env.NODE_ENV === 'test' ? rollupOptionsTest : rollupOptionsBuild

rollupOptions.forEach(options => {
  rollup({
    input: resolve('src/index.js'),
    external: [
      'vue',
      'vue-template-compiler',
      'vue-server-renderer',
      'cheerio',
      '@vue/test-utils'
    ],
    plugins: [
      flow(),
      json(),
      // buble({
      //   objectAssign: 'Object.assign'
      // }),
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

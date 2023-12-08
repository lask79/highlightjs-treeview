const resolve = require('@rollup/plugin-node-resolve')
const del = require('rollup-plugin-delete')
const { generateTreeViewAssets } = require('./lib/generator.js')
const copy = require('rollup-plugin-copy')
const eslint = require('@rollup/plugin-eslint')
const stylelint = require('stylelint')

function generateDefaultAssets (options) {
  return {
    name: 'genreate-treeview-assets',
    generateBundle (outputOptions, bundle) {
      generateTreeViewAssets(options)
    },
  }
}

function rollupStylelintPlugin () {
  return {
    name: 'rollup-plugin-stylelint',
    generateBundle () {
      stylelint.lint({
        files: 'dist/css/*.css',
        formatter: 'string',
        fix: true,
      }).then((result) => {
        if (result.errored) {
          console.error('Stylelint found errors:', result.output)
          throw new Error('Stylelint found errors.')
        } else {
          console.log('Stylelint completed with no errors.')
        }
      }).catch((err) => {
        console.error('Stylelint failed:', err)
        throw err
      })
    },
  }
}

module.exports = {
  input: {
    'lib/generator': 'lib/generator.js',
    'lib/rules-generator': 'lib/rules-generator.js',
    'lib/css-generator': 'lib/css-generator.js',
  },
  output: {
    format: 'cjs',
    // sourcemap: true,
    dir: 'dist',
  },
  plugins: [
    del({
      targets: 'dist/*',
      verbose: true,
    }), // Clears the 'dist' directory before building
    copy({
      targets: [
        { src: 'data', dest: 'dist' },
      ],
    }),
    generateDefaultAssets({
      outputCSS: 'dist/css/treeview-default.css',
      outputJS: 'dist/js/treeview-default.js',
      includeImagesInCSS: true,
      config: {
        configName: 'default',
      },
    }),
    generateDefaultAssets({
      outputCSS: 'dist/css/treeview-minimal.css',
      outputJS: 'dist/js/treeview-minimal.js',
      includeImagesInCSS: true,
      config: {
        configName: 'minimal',
      },
    }),
    rollupStylelintPlugin(),
    eslint({
      fix: true,
      throwOnError: true,
      throwOnWarning: true,
      include: ['lib/**/*.js'],
      exclude: ['node_modules/**', 'dist/**'],
    }),
    resolve({
      customResolveOptions: {
        modulePaths: ['../node_modules', 'node_modules'],
      },
    }), // Resolves modules from 'node_modules'
  ],
}

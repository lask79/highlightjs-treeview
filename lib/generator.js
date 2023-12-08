'use strict'

const fs = require('fs')
const path = require('path')
const cssGenerator = require('./css-generator.js')
const rulesGenerator = require('./rules-generator.js')

const availableIconsSets = {
  'material-icons': 'material-icon-theme/dist/material-icons.json',
}

const defaultConfig = {
  configDir: '../data/config',
  configName: 'default',
  iconSet: 'material-icons',
}

function createFolder (folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.info('Create folder: ' + folderPath)
    fs.mkdirSync(folderPath, { recursive: true })
  }
}

function getIconSetConfig (config) {
  const iconSetDefinitionPath = require.resolve(availableIconsSets[config.iconSet || defaultConfig.iconSet])
  const iconSetDefinition = JSON.parse(fs.readFileSync(iconSetDefinitionPath, 'utf8'))
  const iconSetDefinitionDir = path.dirname(iconSetDefinitionPath)

  const iconSetconfigFilePath = require.resolve(
    path.join(
      config.configDir || defaultConfig.configDir,
      (config.configName || defaultConfig.configName) + '.json')
  )
  const iconSetConfig = JSON.parse(fs.readFileSync(iconSetconfigFilePath, 'utf8'))

  const iconSet = {
    sourceDir: iconSetDefinitionDir,
    defaults: iconSetConfig.defaults,
    showFolderExpanded: iconSetConfig.options.showFolderExpanded,
  }

  // add fileNames
  if (iconSetConfig.options.inheritFileNames) {
    iconSet.fileNames = {
      ...iconSetDefinition.fileNames || {},
      ...iconSetConfig.fileNames || {},
    }
  } else {
    iconSet.fileNames = iconSetConfig.fileNames || {}
  }

  // add fileExtensions
  if (iconSetConfig.options.inheritFileExtensions) {
    iconSet.fileExtensions = {
      ...iconSetDefinition.fileExtensions || {},
      ...iconSetConfig.fileExtensions || {},
    }
  } else {
    iconSet.fileExtensions = iconSetConfig.fileExtensions || {}
  }

  // add folderNames
  if (iconSetConfig.options.inheritFolderNames) {
    iconSet.folderNames = {
      ...iconSetConfig.showFolderExpanded ? iconSetDefinition.folderNamesExpanded : iconSetDefinition.folderNames || {},
      ...iconSetConfig.folderNames || {},
    }
  } else {
    iconSet.folderNames = iconSetConfig.folderNames || {}
  }

  iconSet.iconDefinitions = iconSetDefinition.iconDefinitions

  return iconSet
}

function createOutputFolders ({ outputCSS, outputJS, outputImagesDir }) {
  if (!outputCSS || !outputJS) {
    throw new Error('outputCSS and outputJS are required')
  }

  const outputCssDirPath = path.dirname(outputCSS)
  const outputJsDirPath = path.dirname(outputJS)

  if (outputImagesDir) {
    const outputImagesDirPath = path.dirname(outputImagesDir)
    createFolder(outputImagesDirPath)
  }

  createFolder(outputCssDirPath)
  createFolder(outputJsDirPath)
}

function generateTreeViewAssets (options) {
  const config = options.config || defaultConfig

  createOutputFolders(options)
  const iconSet = getIconSetConfig(config)

  rulesGenerator.generate(options, iconSet)
  cssGenerator.generate(options, iconSet)
}

module.exports = { generateTreeViewAssets }

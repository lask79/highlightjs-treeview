const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')

function generate (options, iconSet) {
  const cssFileRulesSet = new Set()
  const cssFileRules = [] // Changed to an array

  const cssFolderRulesSet = new Set()
  const cssFolderRules = [] // Changed to an array

  const imageDataUri = (imagePath) => {
    const fileData = fs.readFileSync(imagePath)
    const base64Image = Buffer.from(fileData).toString('base64')
    return `data:image/svg+xml;base64,${base64Image}`
  }

  const addUniqueCssRule = (role, iconPath, ruleSet, rules) => {
    const absoluteIconPath = path.resolve(iconSet.sourceDir, iconPath)
    const iconDataUri = imageDataUri(absoluteIconPath)
    const prefixedRole = /^\d/.test(role) ? `_${role}` : role
    const rule = {
      role: prefixedRole,
      iconDataUri: iconDataUri, // Pass the data URI directly
    }
    if (!ruleSet.has(prefixedRole)) {
      ruleSet.add(prefixedRole)
      rules.push(rule) // Add an object to the array
    }
  }

  for (const ext in iconSet.fileExtensions) {
    const role = iconSet.fileExtensions[ext]
    if (iconSet.iconDefinitions[role]) {
      addUniqueCssRule(role, iconSet.iconDefinitions[role].iconPath, cssFileRulesSet, cssFileRules)
    }
  }

  for (const fileName in iconSet.fileNames) {
    const role = iconSet.fileNames[fileName]
    if (iconSet.iconDefinitions[role]) {
      addUniqueCssRule(role, iconSet.iconDefinitions[role].iconPath, cssFileRulesSet, cssFileRules)
    }
  }

  for (const folderName in iconSet.folderNames) {
    const role = iconSet.folderNames[folderName]
    if (iconSet.iconDefinitions[role]) {
      addUniqueCssRule(role, iconSet.iconDefinitions[role].iconPath, cssFolderRulesSet, cssFolderRules)
    }
  }

  const folderIcon = iconSet.showFolderExpanded ? 'folder-open' : 'folder'

  addUniqueCssRule('folder', iconSet.iconDefinitions[folderIcon].iconPath, cssFolderRulesSet, cssFolderRules)
  addUniqueCssRule('file', iconSet.iconDefinitions.file.iconPath, cssFileRulesSet, cssFileRules)

  const templatePath = path.join(__dirname, '../data/templates/treeview.css.hbs')
  const templateFile = fs.readFileSync(templatePath, 'utf8')
  const template = Handlebars.compile(templateFile)
  const templateData = {
    cssFileRules: cssFileRules, // Pass the array to the template
    cssFolderRules: cssFolderRules, // Pass the array to the template
  }

  const cssPath = path.resolve(options.outputCSS)
  fs.writeFileSync(cssPath, template(templateData))
}

module.exports = { generate }

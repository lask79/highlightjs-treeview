const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')

function generate (options, iconSet) {
  const rules = []
  addFileNameRules(iconSet.fileNames, rules)
  addFileExtensionRules(iconSet.fileExtensions, rules)
  addFolderNameRules(iconSet.folderNames, rules)

  const templatePath = path.join(__dirname, '../data/templates/treeview.js.hbs')
  const templateFile = fs.readFileSync(templatePath, 'utf8')
  const template = Handlebars.compile(templateFile)
  const templateData = {
    hljsRules: rules, // Pass the array to the template
  }

  const hljsTreeViewPath = path.resolve(options.outputJS)
  fs.writeFileSync(hljsTreeViewPath, template(templateData))
}

function addFileNameRules (fileNames, rules) {
  // Generate rules for file extensions
  for (const extension in fileNames) {
    const role = fileNames[extension]

    // Escape special characters in the extension for regex
    const fileName = extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Create a RegExp object for the specific file extension
    const regex = new RegExp(`(?<![\\w-])${fileName}(?![\\w-])`, 'i')

    const rule = {
      className: `file ${role}`,
      begin: regex,
      relevance: 10,
    }

    rules.push(rule)
  }
}

function addFileExtensionRules (fileExtensions, rules, relevance = 10) {
  // Generate rules for file extensions
  for (const extension in fileExtensions) {
    const role = fileExtensions[extension]

    // Escape special characters in the extension for regex
    const escapedExtension = extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Create a RegExp object for the specific file extension
    const regex = new RegExp(`(?:\\b|\\.)([\\w.-]+\\.${escapedExtension})\\b`, 'i')

    const rule = {
      className: `file ${role}`,
      begin: regex,
      relevance: relevance,
    }

    rules.push(rule)
  }
}

function addFolderNameRules (folderNames, rules) {
  // Generate rules for file extensions
  for (const folderKey in folderNames) {
    const folderName = folderNames[folderKey]
    // Escape special characters in the extension for regex
    const escapedFolderName = folderKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Create a RegExp object for the specific file extension
    const regex = new RegExp(`(?<![\\w-])${escapedFolderName}(?![\\w-])`, 'i')
    const rule = {
      className: `folder ${folderName}`,
      begin: regex,
      relevance: 10,
    }

    rules.push(rule)
  }
}

module.exports = { generate }

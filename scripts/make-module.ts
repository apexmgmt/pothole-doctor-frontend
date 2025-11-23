#!/usr/bin/env ts-node

import fs from 'fs-extra'
import path from 'path'

// Get the module name from command line arguments
const moduleName = process.argv[2]

if (!moduleName) {
  console.error('❌ Please provide a module name')
  process.exit(1)
}

const { lower, pascal, snake, kebab, constant, lowerPlural, pascalPlural, snakePlural, kebabPlural, constantPlural } =
  normalizeModuleName(moduleName)

// Paths
const paths = {
  page: `app/${kebabPlural}/page.tsx`,
  view: `views/${kebabPlural}/${pascalPlural}.tsx`,
  constFile: `constants/api/${snakePlural}_api.ts`,
  constIndex: `constants/api/index.ts`,
  typeFile: `types/${snakePlural}.types.ts`,
  typeIndex: `types/index.ts`,
  service: `services/api/${snakePlural}.service.ts`
}

// Templates
const pageTemplate = `
    export default function ${pascalPlural}Page() {
    return <div>${pascalPlural} Page</div>;
    }
    `.trim()

const viewTemplate = `
    export default function ${pascalPlural}() {
    return <div>${pascalPlural} View</div>;
    }
    `.trim()

const constTemplate = `export const ${constantPlural}: string = '';`.trim()
const typeTemplate = `
    export interface ${pascal} {
    id: string;
    }
    `.trim()

const serviceTemplate = `
    export default class ${pascal}Service {
    static index = async () => {};
    static store = async () => {};
    static show = async () => {};
    static update = async () => {};
    static destroy = async () => {};
    }
    `.trim()

// Create files
fs.outputFileSync(paths.page, pageTemplate)
console.log(`✅ "${pascal}" Page created successfully!`)

fs.outputFileSync(paths.view, viewTemplate)
console.log(`✅ "${pascal}" View created successfully!`)

fs.outputFileSync(paths.constFile, constTemplate)
console.log(`✅ "${constant}" API Constants created successfully!`)

fs.outputFileSync(paths.typeFile, typeTemplate)
console.log(`✅ "${pascal}" Types created successfully!`)

fs.outputFileSync(paths.service, serviceTemplate)
console.log(`✅ "${pascal}" API Service created successfully!`)

// Append exports
fs.appendFileSync(paths.constIndex, `\nexport * from './${snakePlural}_api';`)
console.log(`✅ "${constant}" API Constants export added successfully!`)

fs.appendFileSync(paths.typeIndex, `\nexport * from './${snakePlural}.types';`)
console.log(`✅ "${pascal}" Types export added successfully!`)
console.log(`----------------------------------------------------------------------------`)
console.log(`✅ Module "${pascal}" created successfully!`)

/**
 * Normalize a module name into lower and Pascal case formats
 * @param name - module name
 * @returns { lower: string, pascal: string }
 */
function normalizeModuleName(name: string) {
  // Replace - and _ with spaces, then split camelCase and PascalCase, then join and format
  const words = name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camelCase
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1 $2') // split ALLCAPS followed by CapitalWord
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.toLowerCase())

  const lower = words.join('')
  const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  const snake = words.join('_')
  const kebab = words.join('-')
  const constant = words.join('_').toUpperCase()
  // Create plural versions
  const pluralize = (str: string) => {
    if (str.endsWith('y')) return str.slice(0, -1) + 'ies'
    if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) return str + 'es'
    return str + 's'
  }
  const lastWord = words[words.length - 1]
  const pluralWords = [...words.slice(0, -1), pluralize(lastWord)]

  const lowerPlural = pluralWords.join('')
  const pascalPlural = pluralWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  const snakePlural = pluralWords.join('_')
  const kebabPlural = pluralWords.join('-')
  const constantPlural = pluralWords.join('_').toUpperCase()

  return {
    lower,
    pascal,
    snake,
    kebab,
    constant,
    lowerPlural,
    pascalPlural,
    snakePlural,
    kebabPlural,
    constantPlural
  }
}

#!/usr/bin/env ts-node

import fs from 'fs-extra'
import path from 'path'

// Get the module name from command line arguments
const moduleName = process.argv[2]

if (!moduleName) {
  console.error('❌ Please provide a module name')
  process.exit(1)
}

const { lower, pascal, snake, kebab, constant } = normalizeModuleName(moduleName)

// Paths
const paths = {
  page: `app/${kebab}/page.tsx`,
  view: `view/${snake}/${pascal}.tsx`,
  constFile: `constants/api/${snake}_api.ts`,
  constIndex: `constants/api/index.ts`,
  typeFile: `types/${snake}.types.ts`,
  typeIndex: `types/index.ts`,
  service: `services/api/${snake}.service.ts`
}

// Templates
const pageTemplate = `
    export default function ${pascal}Page() {
    return <div>${pascal} Page</div>;
    }
    `.trim()

const viewTemplate = `
    export default function ${pascal}() {
    return <div>${pascal} View</div>;
    }
    `.trim()

const constTemplate = `export const ${constant}: string = '';`.trim()

const typeTemplate = `
    export interface ${pascal} {
    id: number;
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
fs.appendFileSync(paths.constIndex, `\nexport * from './${snake}_api';`)
console.log(`✅ "${constant}" API Constants export added successfully!`)

fs.appendFileSync(paths.typeIndex, `\nexport * from './${snake}.types';`)
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
  return { lower, pascal, snake, kebab, constant }
}

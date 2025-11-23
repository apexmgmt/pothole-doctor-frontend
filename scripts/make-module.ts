#!/usr/bin/env ts-node

import fs from 'fs-extra'
import path from 'path'

// Get the module name from command line arguments
const moduleName = process.argv[2]

if (!moduleName) {
  console.error('❌ Please provide a module name')
  process.exit(1)
}

const { lower, pascal } = normalizeModuleName(moduleName)

// Paths
const paths = {
  page: `app/${lower}/page.tsx`,
  view: `view/${lower}/${pascal}.tsx`,
  constFile: `constants/api/${lower}_api.ts`,
  constIndex: `constants/api/index.ts`,
  typeFile: `types/${lower}.types.ts`,
  typeIndex: `types/index.ts`,
  service: `services/api/${lower}.service.ts`
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

const constTemplate = `export const ${lower}: string = '';`.trim()

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
console.log(`✅ "${moduleName}" Page created successfully!`)

fs.outputFileSync(paths.view, viewTemplate)
console.log(`✅ "${moduleName}" View created successfully!`)

fs.outputFileSync(paths.constFile, constTemplate)
console.log(`✅ "${moduleName}" API Constants created successfully!`)

fs.outputFileSync(paths.typeFile, typeTemplate)
console.log(`✅ "${moduleName}" Types created successfully!`)

fs.outputFileSync(paths.service, serviceTemplate)
console.log(`✅ "${moduleName}" API Service created successfully!`)

// Append exports
fs.appendFileSync(paths.constIndex, `\nexport * from './${lower}_api';`)
console.log(`✅ "${moduleName}" API Constants export added successfully!`)

fs.appendFileSync(paths.typeIndex, `\nexport * from './${lower}.types';`)
console.log(`✅ "${moduleName}" Types export added successfully!`)
console.log(`----------------------------------------------------------------------------`)
console.log(`✅ Module "${moduleName}" created successfully!`)

/**
 * Normalize a module name into lower and Pascal case formats
 * @param name - module name
 * @returns { lower: string, pascal: string }
 */
function normalizeModuleName(name: string) {
  // Replace - and _ with spaces, then split camelCase, then join and format
  const words = name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.toLowerCase());

  const lower = words.join('');
  const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return { lower, pascal };
}

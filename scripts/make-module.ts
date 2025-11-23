#!/usr/bin/env ts-node

import fs from 'fs-extra'
import path from 'path'

const moduleName = process.argv[2]

if (!moduleName) {
  console.error('❌ Please provide a module name')
  process.exit(1)
}

const lower = moduleName.toLowerCase()
const pascal = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)

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
fs.outputFileSync(paths.view, viewTemplate)
fs.outputFileSync(paths.constFile, constTemplate)
fs.outputFileSync(paths.typeFile, typeTemplate)
fs.outputFileSync(paths.service, serviceTemplate)

// Append exports
fs.appendFileSync(paths.constIndex, `\nexport * from './${lower}_api';`)
fs.appendFileSync(paths.typeIndex, `\nexport * from './${lower}.types';`)

console.log(`✅ Module "${moduleName}" created successfully!`)

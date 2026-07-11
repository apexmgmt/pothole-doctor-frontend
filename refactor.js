const fs = require('fs')
const path = require('path')

const dirPath = path.join(__dirname, 'services/api')

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file)

    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist)
    } else if (
      file.endsWith('.ts') &&
      !file.includes('api.interceptor') &&
      !file.includes('base.service') &&
      !file.includes('server.service')
    ) {
      filelist.push(filepath)
    }
  })

  return filelist
}

const files = walkSync(dirPath)

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')

  // Replace import
  content = content.replace(
    /import apiInterceptor from '.*?api\.interceptor'/g,
    "import { handleRequest } from './base.service'"
  )
  content = content.replace(
    /import apiInterceptor from '\@\/services\/api\/api\.interceptor'/g,
    "import { handleRequest } from '@/services/api/base.service'"
  )

  // Replace function calls
  content = content.replace(/apiInterceptor\(/g, 'handleRequest(')

  // Replace the error block:
  // if (!response.ok) {
  //   const errorData = await response.json()
  //   throw new Error(errorData.message || 'Failed to fetch...')
  // }
  //
  // Since handleRequest throws natively, we can just delete the whole !response.ok block!
  // Regex to match: if\s*\(\!(\w+)\.ok\)\s*\{[\s\S]*?\}
  content = content.replace(/if\s*\(!(\w+)\.ok\)\s*\{[\s\S]*?\}/g, '')

  // Replace `await response.json()` with `response` (or whatever the variable name is)
  // Matches: await response.json()
  content = content.replace(/await\s+(\w+)\.json\(\)/g, '$1')

  fs.writeFileSync(file, content)
})

console.log('Regex refactor complete')

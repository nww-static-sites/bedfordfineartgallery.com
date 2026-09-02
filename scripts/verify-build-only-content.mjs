/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { parseComponent } = require('vue-template-compiler')

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectories = [
    'components',
    'layouts',
    'libs',
    'middleware',
    'modules',
    'pages',
    'plugins',
    'services',
    'store',
]
const sourceExtensions = new Set(['.js', '.mjs', '.vue'])
const problems = []

function listSourceFiles(directory) {
    if (!fs.existsSync(directory)) {
        return []
    }

    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            return listSourceFiles(fullPath)
        }

        return sourceExtensions.has(path.extname(entry.name)) ? [fullPath] : []
    })
}

function propertyName(node) {
    if (!node || !node.key) {
        return null
    }

    if (node.key.type === 'Identifier') {
        return node.key.name
    }

    return node.key.value
}

function isInsideObjectFunction(identifierPath, expectedName) {
    return Boolean(identifierPath.findParent((candidate) => {
        if (candidate.isObjectMethod()) {
            return propertyName(candidate.node) === expectedName
        }

        if (!candidate.isObjectProperty() || propertyName(candidate.node) !== expectedName) {
            return false
        }

        const value = candidate.get('value')
        return value.isFunctionExpression() || value.isArrowFunctionExpression()
    }))
}

function parseJavaScript(source, file) {
    try {
        return parse(source, {
            sourceType: 'unambiguous',
            allowAwaitOutsideFunction: true,
            plugins: [
                'dynamicImport',
                'objectRestSpread',
                'optionalChaining',
                'nullishCoalescingOperator',
            ],
        })
    } catch (error) {
        problems.push(`${path.relative(projectRoot, file)} could not be parsed for browser-content safety: ${error.message}`)
        return null
    }
}

function verifyPaintingsHelperImports(ast, file) {
    traverse(ast, {
        ImportDeclaration(importPath) {
            const source = importPath.node.source.value
            if (source !== '~/libs/paintings' && source !== '@/libs/paintings') {
                return
            }

            if (!file.endsWith('.vue') || !file.startsWith(path.join(projectRoot, 'pages'))) {
                problems.push(`${path.relative(projectRoot, file)} imports the build-only paintings helper outside a page`)
                return
            }

            for (const specifier of importPath.node.specifiers) {
                const binding = importPath.scope.getBinding(specifier.local.name)
                if (!binding) {
                    continue
                }

                for (const reference of binding.referencePaths) {
                    if (!isInsideObjectFunction(reference, 'asyncData')) {
                        problems.push(`${path.relative(projectRoot, file)} uses ${specifier.local.name} outside asyncData`)
                    }
                }
            }
        },
    })
}

function verifyContentIdentifiers(ast, file) {
    const relativeFile = path.relative(projectRoot, file)

    traverse(ast, {
        Identifier(identifierPath) {
            if (identifierPath.node.name !== '$content') {
                return
            }

            if (relativeFile === 'nuxt.config.js' && isInsideObjectFunction(identifierPath, 'extendRoutes')) {
                return
            }

            if (relativeFile === path.join('libs', 'paintings.js')) {
                return
            }

            if (file.endsWith('.vue') && isInsideObjectFunction(identifierPath, 'asyncData')) {
                return
            }

            problems.push(`${relativeFile} contains browser-reachable $content access outside asyncData/route generation`)
        },
    })
}

const files = [
    path.join(projectRoot, 'nuxt.config.js'),
    ...sourceDirectories.flatMap((directory) => listSourceFiles(path.join(projectRoot, directory))),
]

for (const file of files) {
    const rawSource = fs.readFileSync(file, 'utf8')
    let source = rawSource

    if (file.endsWith('.vue')) {
        const component = parseComponent(rawSource)
        if (component.template && /<\s*nuxt-content\b/i.test(component.template.content)) {
            problems.push(`${path.relative(projectRoot, file)} renders NuxtContent in the browser`)
        }
        source = component.script ? component.script.content : ''
    }

    if (!source.trim()) {
        continue
    }

    const ast = parseJavaScript(source, file)
    if (!ast) {
        continue
    }

    verifyContentIdentifiers(ast, file)
    verifyPaintingsHelperImports(ast, file)
}

if (problems.length > 0) {
    console.error('Build-only Nuxt Content safety validation failed:')
    for (const problem of problems) {
        console.error(`- ${problem}`)
    }
    process.exit(1)
}

console.log(`Build-only Nuxt Content safety validation passed for ${files.length} source files.`)

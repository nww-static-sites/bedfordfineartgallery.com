import fs from 'node:fs'
import path from 'node:path'

const deployRef = process.env.COMMIT_REF || 'local'
const outputRoot = path.join(process.cwd(), 'dist')
const stampedPages = ['index.html', 'Artists--Bios.html']

if (!/^(?:[0-9a-f]{7,64}|local)$/i.test(deployRef)) {
    throw new Error(`Refusing to stamp invalid deploy ref: ${deployRef}`)
}

for (const page of stampedPages) {
    const file = path.join(outputRoot, page)
    const html = fs.readFileSync(file, 'utf8')
    const marker = `<meta name="cx-deploy-ref" content="${deployRef}">`

    if (!html.includes('</head>')) {
        throw new Error(`Cannot stamp deploy ref because ${page} has no closing head tag.`)
    }

    fs.writeFileSync(file, html.replace('</head>', `${marker}</head>`))
}

console.log(`Stamped deploy ref ${deployRef} into ${stampedPages.join(' and ')}.`)

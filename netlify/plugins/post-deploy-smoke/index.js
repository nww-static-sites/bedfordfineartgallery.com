const { spawn } = require('node:child_process')

function runSmokeVerification() {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, ['./scripts/verify-deploy.mjs'], {
            cwd: process.cwd(),
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
        })
        let output = ''

        child.stdout.on('data', (chunk) => {
            const text = chunk.toString()
            output += text
            process.stdout.write(text)
        })
        child.stderr.on('data', (chunk) => {
            const text = chunk.toString()
            output += text
            process.stderr.write(text)
        })
        child.on('close', (code) => resolve({ code, output }))
    })
}

module.exports = {
    onSuccess: async ({ utils }) => {
        if (!process.env.DEPLOY_PRIME_URL) {
            utils.status.show({
                title: 'Deploy smoke verification',
                summary: 'Skipped because DEPLOY_PRIME_URL is unavailable.',
            })
            return
        }

        const result = await runSmokeVerification()

        if (result.code !== 0) {
            utils.build.failPlugin('The deployed site failed Bedford smoke verification.', {
                error: new Error(result.output.trim()),
            })
            return
        }

        utils.status.show({
            title: 'Deploy smoke verification',
            summary: 'Representative public routes, shared chrome, route preservation, and deploy identity passed.',
        })
    },
}

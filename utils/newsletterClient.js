const endpoint = 'https://beta.ecommerceplatform.com/forms/mems_list.cgi'
const sitekey = '0x4AAAAAAF3En7HtDWKMaOj9'
let scriptPromise

function loadTurnstile() {
    if (window.turnstile) return Promise.resolve()
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
            script.async = true
            script.onload = resolve
            script.onerror = () => {
                scriptPromise = null
                script.remove()
                reject(new Error('verification_failed'))
            }
            document.head.appendChild(script)
        })
    }
    return scriptPromise
}

async function tokenFor(element) {
    await loadTurnstile()
    return new Promise((resolve, reject) => {
        let widget
        let finished = false
        const finish = (error, token) => {
            if (finished) return
            finished = true
            clearTimeout(timer)
            if (widget !== undefined) window.turnstile.remove(widget)
            if (error) reject(new Error('verification_failed'))
            else resolve(token)
        }
        const timer = setTimeout(() => finish(true), 25000)
        widget = window.turnstile.render(element, {
            sitekey,
            action: 'bedford_newsletter',
            execution: 'execute',
            'response-field': false,
            retry: 'never',
            callback: (token) => finish(false, token),
            'error-callback': () => {
                finish(true)
                return true
            },
            'timeout-callback': () => finish(true),
            'expired-callback': () => finish(true),
        })
        window.turnstile.execute(widget)
    })
}

export async function joinNewsletter(email, challengeElement, onSaving) {
    const token = await tokenFor(challengeElement)
    const data = new URLSearchParams({
        e: email.trim(),
        m: '88',
        l: '1263',
        ajax: 'json',
        r: 'https://www.bedfordfineartgallery.com/mailing_list_thanks.htm',
        'cf-turnstile-response': token,
    })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30000)
    onSaving()
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: data,
            credentials: 'omit',
            redirect: 'error',
            signal: controller.signal,
            cache: 'no-store',
        })
        const result = await response.json()
        if (!result || typeof result.status !== 'string') throw new Error('unknown')
        return result
    } catch (error) {
        throw new Error('unknown')
    } finally {
        clearTimeout(timer)
    }
}

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
            const fail = () => {
                clearTimeout(timer)
                scriptPromise = null
                script.remove()
                reject(new Error('verification_failed'))
            }
            const timer = setTimeout(fail, 12000)
            script.onload = () => {
                clearTimeout(timer)
                resolve()
            }
            script.onerror = fail
            document.head.appendChild(script)
        })
    }
    return scriptPromise
}

export async function requestTurnstileToken(element, widgetSitekey, action) {
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
        try {
            widget = window.turnstile.render(element, {
                sitekey: widgetSitekey,
                action,
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
        } catch (error) {
            finish(true)
        }
    })
}

export async function joinNewsletter(email, challengeElement, onSaving) {
    const token = await requestTurnstileToken(challengeElement, sitekey, 'bedford_newsletter')
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

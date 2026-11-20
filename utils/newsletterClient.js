const endpoint = 'https://beta.ecommerceplatform.com/forms/mems_list.cgi'
const sitekey = '0x4AAAAAAF3En7HtDWKMaOj9'
let scriptPromise

function loadTurnstile() {
    if (typeof window.turnstile?.render === 'function') return Promise.resolve()
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
                if (typeof window.turnstile?.render !== 'function') {
                    fail()
                    return
                }
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
    try {
        await loadTurnstile()
    } catch (error) {
        console.warn('Turnstile verification failed', action, 'script_load')
        throw error
    }
    const turnstile = window.turnstile
    let widget
    try {
        return await new Promise((resolve, reject) => {
            let finished = false
            const finish = (reason, token) => {
                if (finished) return
                finished = true
                clearTimeout(timer)
                if (reason) {
                    console.warn('Turnstile verification failed', action, reason)
                    reject(new Error('verification_failed'))
                } else {
                    resolve(token)
                }
            }
            const timer = setTimeout(() => finish('client_timeout'), 25000)
            try {
                // The script's load event gates explicit rendering. Turnstile's ready() rejects async scripts.
                widget = turnstile.render(element, {
                    sitekey: widgetSitekey,
                    action,
                    'response-field': false,
                    retry: 'never',
                    callback: (token) => finish(token ? '' : 'missing_token', token),
                    'error-callback': (code) => {
                        finish(/^\d{6}$/.test(code) ? code : 'challenge_error')
                        return true
                    },
                    'unsupported-callback': () => finish('unsupported_browser'),
                    'timeout-callback': () => finish('challenge_timeout'),
                    'expired-callback': () => finish('challenge_expired'),
                })
            } catch (error) {
                finish('widget_render')
            }
        })
    } finally {
        if (typeof widget === 'string') {
            try {
                turnstile.remove(widget)
            } catch (error) {
                console.warn('Turnstile widget cleanup failed', action)
            }
        }
    }
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

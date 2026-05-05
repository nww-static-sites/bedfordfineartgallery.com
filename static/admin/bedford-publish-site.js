(function () {
    var endpoint = '/.netlify/functions/publish-site'
    var mountId = 'bedford-publish-site-panel'
    var identityListenerInstalled = false

    function createElement(tagName, attributes, children) {
        var element = document.createElement(tagName)

        Object.keys(attributes || {}).forEach(function (key) {
            if (key === 'style') {
                Object.assign(element.style, attributes[key])
                return
            }

            if (key === 'text') {
                element.textContent = attributes[key]
                return
            }

            element.setAttribute(key, attributes[key])
        })

        ;(children || []).forEach(function (child) {
            element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
        })

        return element
    }

    function getIdentityUser() {
        if (!window.netlifyIdentity || !window.netlifyIdentity.currentUser) {
            return null
        }

        return window.netlifyIdentity.currentUser()
    }

    function getJwt(user) {
        if (!user) {
            return Promise.reject(new Error('Please log in before publishing the site.'))
        }

        if (typeof user.jwt === 'function') {
            return user.jwt()
        }

        if (user.token && user.token.access_token) {
            return Promise.resolve(user.token.access_token)
        }

        return Promise.reject(new Error('Could not find your CMS login token. Please refresh and log in again.'))
    }

    function installPanel() {
        if (!getIdentityUser()) {
            return
        }

        if (document.getElementById(mountId)) {
            return
        }

        var status = createElement('div', {
            style: {
                color: '#475569',
                fontSize: '12px',
                lineHeight: '1.35',
                marginTop: '8px',
            },
            text: 'CMS saves are queued in Git. Publish when your editing batch is ready.',
        })
        var button = createElement('button', {
            type: 'button',
            style: {
                background: '#742924',
                border: '0',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                padding: '10px 14px',
                width: '100%',
            },
            text: 'Publish Site',
        })
        var panel = createElement('div', {
            id: mountId,
            style: {
                background: '#ffffff',
                border: '1px solid #d6dee8',
                borderRadius: '6px',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18)',
                boxSizing: 'border-box',
                color: '#0f172a',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                maxWidth: '260px',
                padding: '12px',
                position: 'fixed',
                bottom: '18px',
                right: '18px',
                zIndex: '100001',
            },
        }, [
            button,
            status,
        ])

        button.onclick = function () {
            if (!window.confirm('Publish all saved CMS changes to the live site now? Netlify usually takes 7-10 minutes.')) {
                return
            }

            button.disabled = true
            button.style.opacity = '0.7'
            status.textContent = 'Starting Netlify publish...'

            getJwt(getIdentityUser())
                .then(function (token) {
                    return fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            authorization: 'Bearer ' + token,
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            source: 'bedford-cms-admin',
                        }),
                    })
                })
                .then(function (response) {
                    return response.text().then(function (text) {
                        var json = {}

                        if (text) {
                            try {
                                json = JSON.parse(text)
                            } catch (error) {
                                json = { error: text }
                            }
                        }

                        if (!response.ok) {
                            throw new Error(json.error || 'Could not start the publish.')
                        }

                        return json
                    })
                })
                .then(function (json) {
                    status.textContent = json.message || 'Publish started. Check Netlify deploys for progress.'
                })
                .catch(function (error) {
                    status.textContent = error.message
                })
                .finally(function () {
                    button.disabled = false
                    button.style.opacity = '1'
                })
        }

        document.body.appendChild(panel)
    }

    function installIdentityListeners() {
        if (identityListenerInstalled || !window.netlifyIdentity || typeof window.netlifyIdentity.on !== 'function') {
            return
        }

        identityListenerInstalled = true
        window.netlifyIdentity.on('login', installPanel)
        window.netlifyIdentity.on('init', installPanel)
    }

    function waitForLogin() {
        installIdentityListeners()

        if (getIdentityUser()) {
            installPanel()
        }

        if (!document.getElementById(mountId)) {
            window.setTimeout(waitForLogin, 500)
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForLogin)
    } else {
        waitForLogin()
    }
})()

(function () {
    var endpoint = '/.netlify/functions/publish-site'
    var mountId = 'bedford-publish-site-panel'
    var statusPollMs = 30000
    var identityListenerInstalled = false
    var statusPollingInstalled = false
    var panelButton = null
    var panelStatus = null
    var saveLabelObserverInstalled = false
    var currentPublishStatus = {
        state: 'checking',
        canPublish: false,
        message: 'Checking publish status...',
    }
    var cmsSaveLabels = {
        Publish: 'Save',
        'Publishing...': 'Saving...',
        'Publish and create new': 'Save and create new',
        'Publish and duplicate': 'Save and duplicate',
        'Publish now': 'Save now',
    }

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

    function readJsonResponse(response) {
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
                if (json.state) {
                    applyPublishStatus(json)
                }

                throw new Error(json.error || 'Could not contact the publish service.')
            }

            return json
        })
    }

    function requestPublishStatus(method) {
        return getJwt(getIdentityUser())
            .then(function (token) {
                return fetch(endpoint, {
                    method: method,
                    headers: {
                        authorization: 'Bearer ' + token,
                        'content-type': 'application/json',
                    },
                    body: method === 'POST' ? JSON.stringify({ source: 'bedford-cms-admin' }) : undefined,
                })
            })
            .then(readJsonResponse)
    }

    function commitSummary(json) {
        if (!json || !json.gitShortCommit) {
            return ''
        }

        if (json.deployedShortCommit && json.deployedShortCommit !== json.gitShortCommit) {
            return ' Saved ' + json.gitShortCommit + ', live ' + json.deployedShortCommit + '.'
        }

        return ' Live ' + json.gitShortCommit + '.'
    }

    function applyPublishStatus(json) {
        currentPublishStatus = Object.assign({}, currentPublishStatus, json || {})

        if (!panelButton || !panelStatus) {
            return
        }

        panelButton.style.opacity = '1'

        if (currentPublishStatus.state === 'publishing') {
            panelButton.disabled = true
            panelButton.style.opacity = '0.7'
            panelButton.textContent = 'Publishing...'
            panelStatus.textContent = currentPublishStatus.message || 'Publishing saved changes now.'
            return
        }

        if (currentPublishStatus.canPublish) {
            panelButton.disabled = false
            panelButton.textContent = 'Publish Site'
            panelStatus.textContent = (currentPublishStatus.message || 'Saved changes are waiting to publish.') + commitSummary(currentPublishStatus)
            return
        }

        if (currentPublishStatus.state === 'current') {
            panelButton.disabled = true
            panelButton.style.opacity = '0.7'
            panelButton.textContent = 'Nothing to Publish'
            panelStatus.textContent = (currentPublishStatus.message || 'Live site is current.') + commitSummary(currentPublishStatus)
            return
        }

        panelButton.disabled = true
        panelButton.style.opacity = '0.7'
        panelButton.textContent = 'Checking...'
        panelStatus.textContent = currentPublishStatus.message || 'Checking publish status...'
    }

    function refreshPublishStatus() {
        if (!getIdentityUser()) {
            return Promise.resolve()
        }

        applyPublishStatus({
            state: currentPublishStatus.state === 'checking' ? 'checking' : currentPublishStatus.state,
            canPublish: false,
            message: currentPublishStatus.state === 'checking' ? 'Checking publish status...' : currentPublishStatus.message,
        })

        return requestPublishStatus('GET')
            .then(applyPublishStatus)
            .catch(function (error) {
                currentPublishStatus = {
                    state: 'error',
                    canPublish: false,
                    message: error.message,
                }
                applyPublishStatus(currentPublishStatus)
                if (panelButton) {
                    panelButton.textContent = 'Status Error'
                }
            })
    }

    function installStatusPolling() {
        if (statusPollingInstalled) {
            return
        }

        statusPollingInstalled = true
        window.setInterval(refreshPublishStatus, statusPollMs)
        window.addEventListener('focus', refreshPublishStatus)
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                refreshPublishStatus()
            }
        })
    }

    function replacementLabel(value) {
        return cmsSaveLabels[value] || null
    }

    function replaceLabelText(element) {
        if (!element || element.id === mountId || element.closest && element.closest('#' + mountId)) {
            return
        }

        var text = element.textContent && element.textContent.trim()
        var replacement = replacementLabel(text)

        if (replacement) {
            if (!element.children.length) {
                element.textContent = replacement
            } else {
                Array.prototype.forEach.call(element.childNodes, function (node) {
                    var nodeReplacement = node.nodeType === Node.TEXT_NODE && replacementLabel(node.nodeValue.trim())

                    if (nodeReplacement) {
                        node.nodeValue = nodeReplacement
                    }
                })
            }
        }

        ;['aria-label', 'title'].forEach(function (attribute) {
            var value = element.getAttribute && element.getAttribute(attribute)
            var attributeReplacement = replacementLabel(value)

            if (attributeReplacement) {
                element.setAttribute(attribute, attributeReplacement)
            }
        })
    }

    function replaceCmsPublishLabels(root) {
        var selectors = 'button, [role="button"], [role="menuitem"], [data-testid], span'
        var scope = root && root.querySelectorAll ? root : document

        if (scope.matches && scope.matches(selectors)) {
            replaceLabelText(scope)
        }

        Array.prototype.forEach.call(scope.querySelectorAll(selectors), replaceLabelText)
    }

    function installCmsSaveLabels() {
        if (saveLabelObserverInstalled) {
            return
        }

        saveLabelObserverInstalled = true
        replaceCmsPublishLabels(document)

        new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'characterData') {
                    replaceLabelText(mutation.target.parentElement)
                    return
                }

                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        replaceCmsPublishLabels(node)
                    }
                })
            })
        }).observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true,
        })
    }

    function installPanel() {
        if (!getIdentityUser()) {
            return
        }

        if (document.getElementById(mountId)) {
            refreshPublishStatus()
            return
        }

        panelStatus = createElement('div', {
            style: {
                color: '#475569',
                fontSize: '12px',
                lineHeight: '1.35',
                marginTop: '8px',
            },
            text: 'Checking publish status...',
        })
        panelButton = createElement('button', {
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
            text: 'Checking...',
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
                maxWidth: '280px',
                padding: '12px',
                position: 'fixed',
                bottom: '18px',
                right: '18px',
                zIndex: '100001',
            },
        }, [
            panelButton,
            panelStatus,
        ])

        panelButton.onclick = function () {
            if (!currentPublishStatus.canPublish) {
                refreshPublishStatus()
                return
            }

            if (!window.confirm('Publish all saved CMS changes to the live site now? Netlify usually takes 7-10 minutes.')) {
                return
            }

            panelButton.disabled = true
            panelButton.style.opacity = '0.7'
            panelButton.textContent = 'Starting...'
            panelStatus.textContent = 'Starting Netlify publish...'

            requestPublishStatus('POST')
                .then(function (json) {
                    applyPublishStatus(json)
                    window.setTimeout(refreshPublishStatus, 8000)
                })
                .catch(function (error) {
                    panelStatus.textContent = error.message
                    window.setTimeout(refreshPublishStatus, 8000)
                })
        }

        document.body.appendChild(panel)
        applyPublishStatus(currentPublishStatus)
        installStatusPolling()
        installCmsSaveLabels()
        refreshPublishStatus()
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

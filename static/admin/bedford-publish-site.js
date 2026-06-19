(function () {
    var endpoint = '/.netlify/functions/publish-site'
    var mountId = 'bedford-publish-site-panel'
    var statusPollMs = 120000
    var minimumStatusRefreshMs = 60000
    var identityListenerInstalled = false
    var statusPollingInstalled = false
    var panelButton = null
    var panelStatus = null
    var lastStatusRefreshAt = 0
    var pendingStatusRefresh = null
    var saveLabelObserverInstalled = false
    var slugProtectionInstalled = false
    var slugProtectionEventInstalled = false
    var originalSlugByEntryKey = {}
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

    function normalizedText(element) {
        return (element && element.textContent ? element.textContent : '').replace(/\s+/g, ' ').trim()
    }

    function getEditorRoute() {
        var hash = window.location.hash || ''
        var entryMatch = hash.match(/\/collections\/([^/]+)\/entries\/([^/?#]+)/)

        if (entryMatch) {
            return {
                collection: decodeURIComponent(entryMatch[1]),
                entrySlug: decodeURIComponent(entryMatch[2]),
                isExistingEntry: true,
            }
        }

        return {
            isExistingEntry: false,
        }
    }

    function currentEntryKey() {
        var route = getEditorRoute()

        if (!route.isExistingEntry || !route.collection || !route.entrySlug) {
            return ''
        }

        return route.collection + ':' + route.entrySlug
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

    function refreshPublishStatus(force) {
        if (!getIdentityUser()) {
            return Promise.resolve()
        }

        if (!force && pendingStatusRefresh) {
            return pendingStatusRefresh
        }

        if (!force && lastStatusRefreshAt && Date.now() - lastStatusRefreshAt < minimumStatusRefreshMs) {
            return Promise.resolve()
        }

        lastStatusRefreshAt = Date.now()
        applyPublishStatus({
            state: currentPublishStatus.state === 'checking' ? 'checking' : currentPublishStatus.state,
            canPublish: false,
            message: currentPublishStatus.state === 'checking' ? 'Checking publish status...' : currentPublishStatus.message,
        })

        pendingStatusRefresh = requestPublishStatus('GET')
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
            .then(function () {
                pendingStatusRefresh = null
            })

        return pendingStatusRefresh
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

    function isSlugLabel(element) {
        var text = normalizedText(element)

        return text === 'Slug' || text.indexOf('Slug ') === 0
    }

    function findSlugControls(label) {
        var root = label
        var depth = 0

        while (root && root !== document.body && depth < 8) {
            var controls = root.querySelectorAll && root.querySelectorAll('input:not([type="hidden"]), textarea')

            if (controls && controls.length) {
                return [controls[0]]
            }

            root = root.parentElement
            depth += 1
        }

        return []
    }

    function protectSlugControl(control, key) {
        if (!control || !control.value) {
            return
        }

        if (!originalSlugByEntryKey[key]) {
            originalSlugByEntryKey[key] = control.value
        }

        var originalSlug = originalSlugByEntryKey[key]

        control.value = originalSlug
        control.readOnly = true
        control.setAttribute('aria-readonly', 'true')
        control.setAttribute('data-bedford-slug-protected', 'true')
        control.setAttribute('title', 'Protected after creation. Ask the site maintainer if this URL must change.')
        control.style.backgroundColor = '#f3f4f6'
        control.style.borderColor = '#cbd5e1'
        control.style.color = '#475569'
        control.style.cursor = 'not-allowed'

        if (!control.parentElement || control.parentElement.querySelector('[data-bedford-slug-note="true"]')) {
            return
        }

        control.parentElement.appendChild(createElement('div', {
            'data-bedford-slug-note': 'true',
            style: {
                color: '#742924',
                fontSize: '12px',
                lineHeight: '1.35',
                marginTop: '6px',
            },
            text: 'Protected after creation. Ask the site maintainer if this URL must change.',
        }))
    }

    function protectExistingSlugFields(root) {
        var key = currentEntryKey()

        if (!key) {
            return
        }

        var scope = root && root.querySelectorAll ? root : document
        var labels = []

        if (scope.matches && isSlugLabel(scope)) {
            labels.push(scope)
        }

        Array.prototype.forEach.call(scope.querySelectorAll('label, span, div'), function (element) {
            if (isSlugLabel(element)) {
                labels.push(element)
            }
        })

        labels.forEach(function (label) {
            Array.prototype.forEach.call(findSlugControls(label), function (control) {
                protectSlugControl(control, key)
            })
        })
    }

    function protectEntrySlugBeforeSave(args) {
        var key = currentEntryKey()
        var originalSlug = key && originalSlugByEntryKey[key]
        var entry = args && args.entry
        var data = entry && entry.get && entry.get('data')

        if (!originalSlug || !data || !data.get || !data.set) {
            return data
        }

        if (data.get('slug') !== originalSlug) {
            return data.set('slug', originalSlug)
        }

        return data
    }

    function installSlugProtection() {
        if (!slugProtectionEventInstalled && window.CMS && typeof window.CMS.registerEventListener === 'function') {
            slugProtectionEventInstalled = true
            window.CMS.registerEventListener({
                name: 'preSave',
                handler: protectEntrySlugBeforeSave,
            })
        }

        if (slugProtectionInstalled) {
            protectExistingSlugFields(document)
            return
        }

        slugProtectionInstalled = true
        protectExistingSlugFields(document)

        window.addEventListener('hashchange', function () {
            window.setTimeout(function () {
                protectExistingSlugFields(document)
            }, 250)
        })

        new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        protectExistingSlugFields(node)
                    }
                })
            })
        }).observe(document.body, {
            childList: true,
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
                refreshPublishStatus(true)
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
                    window.setTimeout(function () {
                        refreshPublishStatus(true)
                    }, 8000)
                })
                .catch(function (error) {
                    panelStatus.textContent = error.message
                    window.setTimeout(function () {
                        refreshPublishStatus(true)
                    }, 8000)
                })
        }

        document.body.appendChild(panel)
        applyPublishStatus(currentPublishStatus)
        installStatusPolling()
        installCmsSaveLabels()
        installSlugProtection()
        refreshPublishStatus(true)
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

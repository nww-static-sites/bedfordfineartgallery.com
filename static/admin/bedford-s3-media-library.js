(function () {
    var imageHost = 'https://img.bedfordfineartgallery.com'
    var uploadEndpoint = '/.netlify/functions/s3-upload'

    function createElement(tagName, attributes, children) {
        var element = document.createElement(tagName)
        Object.keys(attributes || {}).forEach(function (key) {
            if (key === 'style') {
                Object.assign(element.style, attributes[key])
                return
            }

            element.setAttribute(key, attributes[key])
        })
        ;(children || []).forEach(function (child) {
            element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
        })
        return element
    }

    function normalizeHost(options) {
        return (
            (options && options.config && options.config.image_host) ||
            imageHost
        ).replace(/\/+$/, '')
    }

    function normalizeUploadEndpoint(options) {
        return (options && options.config && options.config.upload_endpoint) || uploadEndpoint
    }

    function isAllowedUrl(url, host) {
        return url.indexOf(host + '/') === 0
    }

    function readFileAsBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader()
            reader.onload = function () {
                resolve(String(reader.result).split(',')[1] || '')
            }
            reader.onerror = function () {
                reject(new Error('Could not read the selected image file.'))
            }
            reader.readAsDataURL(file)
        })
    }

    function parseUploadResponse(response) {
        return response.text().then(function (text) {
            var json = {}

            if (text) {
                try {
                    json = JSON.parse(text)
                } catch (error) {
                    json = {
                        error: text,
                    }
                }
            }

            if (!response.ok) {
                throw new Error(json.error || 'Upload failed.')
            }

            return json
        })
    }

    function closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal)
        }
    }

    function showModal(host, endpoint, handleInsert) {
        var status = createElement('p', {
            style: {
                color: '#4b5563',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '12px 0 0',
            },
        })
        var fileInput = createElement('input', {
            accept: 'image/jpeg,image/png,image/gif,image/webp',
            type: 'file',
        })
        var urlInput = createElement('input', {
            placeholder: host + '/cms-uploads/example.jpg',
            type: 'url',
            style: {
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                boxSizing: 'border-box',
                display: 'block',
                fontSize: '14px',
                marginTop: '8px',
                padding: '8px',
                width: '100%',
            },
        })
        var insertButton = createElement('button', {
            type: 'button',
            style: {
                background: '#742924',
                border: '0',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                marginTop: '8px',
                padding: '8px 12px',
            },
        }, ['Use URL'])
        var closeButton = createElement('button', {
            type: 'button',
            style: {
                background: 'transparent',
                border: '0',
                color: '#334155',
                cursor: 'pointer',
                float: 'right',
                fontSize: '18px',
            },
        }, ['x'])
        var panel = createElement('div', {
            style: {
                background: '#ffffff',
                borderRadius: '6px',
                boxShadow: '0 24px 80px rgba(15, 23, 42, 0.35)',
                boxSizing: 'border-box',
                maxWidth: '520px',
                padding: '24px',
                width: '90vw',
            },
        }, [
            closeButton,
            createElement('h2', {
                style: {
                    color: '#111827',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '20px',
                    margin: '0 0 12px',
                },
            }, ['Upload image to AWS']),
            createElement('p', {
                style: {
                    color: '#4b5563',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0 0 16px',
                },
            }, ['Choose an image file. The CMS will upload it to the AWS bucket and save the public image URL.']),
            fileInput,
            createElement('hr', {
                style: {
                    border: '0',
                    borderTop: '1px solid #e5e7eb',
                    margin: '20px 0',
                },
            }),
            createElement('p', {
                style: {
                    color: '#4b5563',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0',
                },
            }, ['Or paste an existing AWS image URL:']),
            urlInput,
            insertButton,
            status,
        ])
        var modal = createElement('div', {
            style: {
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.55)',
                bottom: '0',
                display: 'flex',
                justifyContent: 'center',
                left: '0',
                position: 'fixed',
                right: '0',
                top: '0',
                zIndex: '100000',
            },
        }, [panel])

        closeButton.onclick = function () {
            closeModal(modal)
        }

        insertButton.onclick = function () {
            var url = urlInput.value.trim()
            if (!isAllowedUrl(url, host)) {
                status.textContent = 'Image URLs must start with ' + host + '/'
                return
            }

            handleInsert(url)
            closeModal(modal)
        }

        fileInput.onchange = function () {
            var file = fileInput.files && fileInput.files[0]
            if (!file) {
                return
            }

            status.textContent = 'Uploading to AWS...'
            fileInput.disabled = true

            readFileAsBase64(file)
                .then(function (base64) {
                    return fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            base64: base64,
                            contentType: file.type,
                            filename: file.name,
                        }),
                    })
                })
                .then(function (response) {
                    return parseUploadResponse(response)
                })
                .then(function (json) {
                    if (!json.url) {
                        throw new Error('Upload completed, but no image URL was returned.')
                    }

                    handleInsert(json.url)
                    closeModal(modal)
                })
                .catch(function (error) {
                    status.textContent = error.message
                    fileInput.disabled = false
                })
        }

        document.body.appendChild(modal)
    }

    var bedfordS3MediaLibrary = {
        name: 'bedford_s3',
        init: function ({ options, handleInsert }) {
            var host = normalizeHost(options)
            var endpoint = normalizeUploadEndpoint(options)

            return {
                show: function () {
                    showModal(host, endpoint, handleInsert)
                },
                hide: function () {},
                enableStandalone: function () {
                    return true
                },
            }
        },
    }

    window.CMS.registerMediaLibrary(bedfordS3MediaLibrary)
    window.CMS.init()
})()

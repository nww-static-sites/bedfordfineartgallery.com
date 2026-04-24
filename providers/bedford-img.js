const defaultBaseURL = 'https://img.bedfordfineartgallery.com'

function isAbsoluteUrl(src) {
    return /^https?:\/\//.test(src)
}

function joinImageUrl(baseURL, src) {
    if (!src) {
        return ''
    }

    if (isAbsoluteUrl(src) || src.startsWith('data:')) {
        return src
    }

    return `${baseURL.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`
}

export function getImage(src, { baseURL = defaultBaseURL } = {}) {
    return {
        url: joinImageUrl(baseURL, src),
    }
}

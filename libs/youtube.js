const SUPPORTED_YOUTUBE_HOSTS = ['youtube.com', 'youtube-nocookie.com']
const EMBED_QUERY_PARAMS = [
    'controls',
    'end',
    'loop',
    'modestbranding',
    'mute',
    'playlist',
    'playsinline',
    'rel',
    'start',
]

const parseUrl = (link) => {
    if (!link || typeof link !== 'string') {
        return null
    }

    let value = link.trim()

    if (!value) {
        return null
    }

    if (value.startsWith('//')) {
        value = `https:${value}`
    } else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
        value = `https://${value}`
    }

    try {
        return new URL(value)
    } catch (error) {
        return null
    }
}

const normalizedHost = (url) =>
    url.hostname
        .toLowerCase()
        .replace(/^www\./, '')
        .replace(/^m\./, '')

export const getYouTubeVideoId = (link) => {
    const url = parseUrl(link)

    if (!url) {
        return ''
    }

    const host = normalizedHost(url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    if (host === 'youtu.be') {
        return pathParts[0] || ''
    }

    if (!SUPPORTED_YOUTUBE_HOSTS.includes(host)) {
        return ''
    }

    if (['embed', 'shorts', 'v'].includes(pathParts[0])) {
        return pathParts[1] || ''
    }

    if (pathParts[0] === 'watch') {
        return url.searchParams.get('v') || ''
    }

    return ''
}

export const normalizeYouTubeEmbedUrl = (link) => {
    const url = parseUrl(link)
    const videoId = getYouTubeVideoId(link)

    if (!url || !videoId) {
        return ''
    }

    const params = new URLSearchParams()

    EMBED_QUERY_PARAMS.forEach((param) => {
        const value = url.searchParams.get(param)

        if (value) {
            params.set(param, value)
        }
    })

    if (!params.has('rel')) {
        params.set('rel', '0')
    }

    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`
}

import cf from 'cloudfront';

const kvs = cf.kvs();
const releasePattern = /^[0-9a-f]{40}$/;

function serializedQuery(querystring) {
    const pairs = [];
    for (const key of Object.keys(querystring || {})) {
        const entry = querystring[key] || {};
        const values = Array.isArray(entry.multiValue)
            ? entry.multiValue.map((item) => item.value)
            : [entry.value];
        for (const value of values) {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`);
        }
    }
    return pairs.join('&');
}

function withQuery(location, querystring) {
    const query = serializedQuery(querystring);
    if (!query) return location;
    return `${location}${location.includes('?') ? '&' : '?'}${query}`;
}

function redirect(location, querystring, statusCode) {
    return {
        statusCode: statusCode || 301,
        statusDescription: 'Moved Permanently',
        headers: {
            location: { value: withQuery(location, querystring) },
            'cache-control': { value: 'public,max-age=300' },
        },
    };
}

async function optionalRedirect(activeRelease, uri) {
    try {
        const value = JSON.parse(await kvs.get(`r:${activeRelease}:${uri}`));
        if (value && typeof value.location === 'string' && value.location) return value;
    } catch (error) {
        // A missing exact redirect is the normal path for most requests.
    }
    return null;
}

async function handler(event) {
    const request = event.request;
    const host = String(request.headers.host && request.headers.host.value || '').toLowerCase();

    if (host === 'bedfordfineartgallery.com') {
        return redirect(`https://www.bedfordfineartgallery.com${request.uri}`, request.querystring, 301);
    }

    let activeRelease = '';
    try {
        activeRelease = await kvs.get('@active');
    } catch (error) {
        activeRelease = '';
    }
    if (!releasePattern.test(activeRelease)) {
        return {
            statusCode: 503,
            statusDescription: 'Service Unavailable',
            headers: {
                'cache-control': { value: 'no-store,max-age=0' },
                'content-type': { value: 'text/plain; charset=utf-8' },
            },
            body: 'Temporarily unavailable.',
        };
    }

    const exact = await optionalRedirect(activeRelease, request.uri);
    if (exact) return redirect(exact.location, request.querystring, Number(exact.status) || 301);

    let originPath = request.uri;
    if (originPath === '/ipad' || originPath === '/ipad.html' || originPath === '/ipad/' || originPath.startsWith('/ipad/')) {
        originPath = '/ipad-shell.html';
    } else if (originPath === '/') {
        originPath = '/index.html';
    } else if (originPath === '/admin' || originPath === '/admin/') {
        originPath = '/admin/index.html';
    } else if (originPath === '/highlights_article_15.html-1') {
        originPath = '/highlights_article_15.html';
    } else {
        const lastSegment = originPath.slice(originPath.lastIndexOf('/') + 1);
        if (lastSegment && !lastSegment.includes('.')) originPath += '.html';
    }

    request.uri = `/releases/${activeRelease}${originPath}`;
    return request;
}

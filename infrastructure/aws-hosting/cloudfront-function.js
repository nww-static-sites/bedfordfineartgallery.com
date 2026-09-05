import cf from 'cloudfront';

const kvs = cf.kvs();
const releasePattern = /^[0-9a-f]{40}$/;
const digestPattern = /^[0-9a-f]{64}$/;

function serializedQuery(querystring) {
    const pairs = [];
    const keys = Object.keys(querystring || {});
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
        const key = keys[keyIndex];
        const entry = querystring[key] || {};
        const values = Array.isArray(entry.multiValue)
            ? entry.multiValue.map((item) => item.value)
            : [entry.value];
        for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
            const value = values[valueIndex];
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

function unavailable() {
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

async function routePrefix(activeRelease) {
    const configuration = await kvs.get(`@config:${activeRelease}`);
    if (digestPattern.test(configuration)) return `r:${activeRelease}:`;
    const value = JSON.parse(configuration);
    if (!value || value.v !== 2 || !digestPattern.test(value.routeSet || '')) throw new Error('configuration');
    const markerText = await kvs.get(`@routes-ready:${value.routeSet}`);
    const marker = JSON.parse(markerText);
    if (!marker || marker.v !== 2 || marker.routeSet !== value.routeSet ||
        !Number.isInteger(marker.count) || marker.count < 0) throw new Error('readiness');
    return `r2:${value.routeSet}:`;
}

async function optionalRedirect(prefix, uri) {
    // Missing routes are normal; failed store reads and malformed values are not.
    const key = prefix + uri;
    const exists = await kvs.exists(key);
    if (!exists) return null;
    const serializedValue = await kvs.get(key);
    const value = JSON.parse(serializedValue);
    if (!value || value.status !== 301 || typeof value.location !== 'string' || !value.location) throw new Error('redirect');
    return value;
}

async function handler(event) {
    const request = event.request;
    const host = String(request.headers.host && request.headers.host.value || '').toLowerCase();

    if (host === 'bedfordfineartgallery.com') {
        return redirect(`https://www.bedfordfineartgallery.com${request.uri}`, request.querystring, 301);
    }

    // CloudFront's custom 403/404 response re-requests this one stable object.
    // It intentionally lives outside the active immutable release prefix.
    if (request.uri === '/errors/404.html') return request;

    let activeRelease = '';
    try {
        activeRelease = await kvs.get('@active');
    } catch (error) {
        activeRelease = '';
    }
    if (!releasePattern.test(activeRelease)) {
        return unavailable();
    }

    let exact;
    try {
        const prefix = await routePrefix(activeRelease);
        exact = await optionalRedirect(prefix, request.uri);
    } catch (error) {
        return unavailable();
    }
    if (exact) return redirect(exact.location, request.querystring, Number(exact.status) || 301);

    let originPath = request.uri;
    if (originPath === '/ipad' || originPath === '/ipad.html' || originPath === '/ipad/' || originPath.startsWith('/ipad/')) {
        originPath = '/ipad-shell.html';
    } else if (originPath === '/') {
        originPath = '/index.html';
    } else if (originPath === '/admin' || originPath === '/admin/') {
        originPath = '/admin/index.html';
    } else if (originPath === '/highlights_article_15.html-1') {
        originPath = '/highlights_article_15.html-1.html';
    } else {
        const lastSegment = originPath.slice(originPath.lastIndexOf('/') + 1);
        if (lastSegment && !lastSegment.includes('.')) originPath += '.html';
    }

    request.uri = `/releases/${activeRelease}${originPath}`;
    return request;
}

const headers = {
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-origin': 'https://www.bedfordfineartgallery.com',
    'cache-control': 'no-store',
    'content-type': 'application/json',
}

exports.handler = async () => ({
    statusCode: 410,
    headers,
    body: JSON.stringify({
        error: 'The legacy Bedford CMS upload service has been retired.',
        retired: true,
    }),
})

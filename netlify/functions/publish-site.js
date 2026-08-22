const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json',
}

exports.handler = async () => ({
    statusCode: 410,
    headers,
    body: JSON.stringify({
        error: 'The legacy Bedford CMS publish service has been retired.',
        retired: true,
    }),
})

(function () {
    var imageHost = 'https://img.bedfordfineartgallery.com'

    function normalizeHost(options) {
        return (
            (options && options.config && options.config.image_host) ||
            imageHost
        ).replace(/\/+$/, '')
    }

    function isAllowedUrl(url, host) {
        return url.indexOf(host + '/') === 0
    }

    var bedfordS3MediaLibrary = {
        name: 'bedford_s3',
        init: function ({ options, handleInsert }) {
            var host = normalizeHost(options)

            return {
                show: function () {
                    var url = window.prompt(
                        'Paste the full image URL from the AWS bucket, starting with ' + host + '/'
                    )

                    if (!url) {
                        return
                    }

                    url = url.trim()

                    if (!isAllowedUrl(url, host)) {
                        window.alert(
                            'Images must be uploaded to the AWS bucket and saved as ' + host + '/... URLs.'
                        )
                        return
                    }

                    handleInsert(url)
                },
                hide: function () {},
                enableStandalone: function () {
                    return false
                },
            }
        },
    }

    window.CMS.registerMediaLibrary(bedfordS3MediaLibrary)
    window.CMS.init()
})()

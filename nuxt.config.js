export default {
    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: '19th Century Paintings - Bedford Fine Art Gallery - 19th Century Art for Sale',
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'Historic gallery of 19th century paintings for sale, featuring the 19th century art of European, British and American 19th century artists. Many 1800s paintings including 19th century oil paintings by some of the most renowned 19th century painters.' },
            { name: 'format-detection', content: 'telephone=no' },
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        script: [
            {
                "hid": "schema",
                "innerHTML": "{\"@context\":\"https://schema.org\",\"@type\":\"ArtGallery\",\"name\":\"Bedford Fine Art Gallery\",\"image\":\"https://res.cloudinary.com/dg6smdedp/image/upload/f_auto,q_auto/cms-uploads/highlights_6.jpg\",\"@id\":\"\",\"url\":\"https://www.bedfordfineartgallery.com/\",\"telephone\":\"724-459-0612\",\"address\": {\"@type\":\"PostalAddress\",\"streetAddress\":\"230 South Juliana St.\",\"addressLocality\":\"Bedford\",\"addressRegion\":\"PA\",\"postalCode\":\"15522\",\"addressCountry\":\"US\"},\"geo\": {\"@type\":\"GeoCoordinates\",\"latitude\": 40.0164441,\"longitude\": -78.5038553},\"openingHoursSpecification\": {\"@type\":\"OpeningHoursSpecification\",\"dayOfWeek\": [\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\",\"Saturday\" ],\"opens\":\"10:00\",\"closes\":\"17:00\"}}",
                "async": true,
                "defer": true,
                "type": "application/ld+json"
            }
        ],
        __dangerouslyDisableSanitizers: ['script'],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['~/assets/css/fonts.css', '~/assets/css/global.css'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '~/plugins/vue-gtag.client.js',
        '~/plugins/head.js',
        '~/plugins/referer.client.js',
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: false,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/eslint
        '@nuxtjs/eslint-module',
        '@nuxt/image',
        '@nuxtjs/router-extras',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        '@nuxtjs/markdownit',
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        '@nuxt/content',
        'nuxt-interpolation',
        '@nuxtjs/sitemap',
    ],
    content: {
        dir: 'cms',
    },

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {
        // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
        baseURL: '/',
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: ['vue-picture-swipe'],
    },
    loading: {
        color: '#CCB38D',
    },
    router: {
        trailingSlash: false,
        async extendRoutes(routes, resolve) {
            const { $content } = require('@nuxt/content')

            const paintings = await $content('paintings').only(['slug']).fetch()
            paintings.forEach(function(painting) {
                routes.push({
                    name: painting.slug,
                    path: `/${painting.slug.replace('-html', '.html')}`,
                    component: resolve(__dirname, 'pages/painting.vue')
                })
            })

            const artists = await $content('artists').where({ hasLandingPage: true }).only(['slug']).fetch()
            artists.forEach(function(artist) {
                routes.push({
                    name: artist.slug,
                    path: `/${artist.slug.replace('-html', '.html')}`,
                    component: resolve(__dirname, 'pages/artist-bio.vue')
                })
            })

            const articles = await $content('articles').only(['slug']).fetch()
            articles.forEach(function(article) {
                routes.push({
                    name: article.slug,
                    path: `/${article.slug.replace('-html', '.html')}`,
                    component: resolve(__dirname, 'pages/highlight.vue')
                })
            })

            const artLoversNicheArticles = await $content('artLoversNicheArticles').only(['slug']).fetch()
            artLoversNicheArticles.forEach(function(artLoversNicheArticle) {
                routes.push({
                    name: artLoversNicheArticle.slug,
                    path: `/${artLoversNicheArticle.slug.replace('-html', '.html')}`,
                    component: resolve(__dirname, 'pages/art-lovers-niche-article.vue')
                })
            })

            const ipadPaintings = await $content('paintings').only(['slug']).fetch()
            ipadPaintings.forEach((ipadPainting) => {
                routes.push({
                    name: `ipad-${ipadPainting.slug}`,
                    path: `/ipad/${ipadPainting.slug.replace('-html', '.html')}`,
                    component: resolve(__dirname, 'pages/ipad/painting.vue')
                })
            })

          }
    },
    image: {
        cloudinary: {
          baseURL: 'https://res.cloudinary.com/dg6smdedp/image/upload/'
        }
    },
    sitemap: {
        hostname: 'https://www.bedfordfineartgallery.com',
        gzip: true,
        exclude: [
            '/ipad/**',
            '/admin/**'
        ],
        defaults: {
            changefreq: 'weekly',
            lastmod: new Date(),
        },
    },
    generate: {
        subFolders: false,
        crawler: true,
    },
}

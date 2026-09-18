/* Shared by the public article and the editor preview. No content is rewritten. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory()
    else root.BedfordArticleOutline = factory()
})(typeof window === 'undefined' ? this : window, function () {
    'use strict'

    function plainText(tokens) {
        return (tokens || []).map(function (token) {
            if (token.type === 'image') return plainText(token.children)
            if (token.type === 'text' || token.type === 'code_inline') return token.content
            if (token.type === 'softbreak' || token.type === 'hardbreak') return ' '
            return ''
        }).join('').replace(/\s+/g, ' ').trim()
    }

    function render(markdown, body, enabled) {
        const source = String(body || '')
        // The opt-out path preserves the historical renderer byte for byte.
        if (enabled !== true) return { html: markdown.render(source), headings: [] }
        const env = {}; const tokens = markdown.parse(source, env); const used = Object.create(null); const headings = []
        tokens.forEach(function (token, index) {
            // Only ordinary top-level H2 sections appear in the contents list.
            // H3 subheadings, blockquotes and fenced examples are not entries.
            if (token.type !== 'heading_open' || token.tag !== 'h2' || token.level !== 0) return
            const inline = tokens[index + 1]
            if (!inline || inline.type !== 'inline') return
            const title = plainText(inline.children)
            if (!title) return
            const base = 'article-' + (title.normalize('NFKD').replace(/[\u0300-\u036F]/g, '')
                .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/, '') || 'section')
            let id = base; let suffix = 2
            while (used[id]) id = base + '-' + suffix++
            used[id] = true
            token.attrSet('id', id)
            token.attrSet('tabindex', '-1')
            headings.push({ id, title })
        })
        return { html: markdown.renderer.render(tokens, markdown.options, env), headings }
    }

    return { render }
});

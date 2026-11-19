/* Used by the public site, Content Editor previews, and mailer generation. */
;(function (factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory()
    else window.BedfordNicheArticle = factory()
})(function () {
    'use strict'
    const origin = 'https://www.bedfordfineartgallery.com'
    const format = 'niche-v7'
    const type = 'font-family:Georgia,\'Times New Roman\',serif;'
    const prose = type + 'font-size:18px;line-height:28px;color:#3e3934;'
    const caption = type + 'font-size:15px;line-height:21px;color:#625c55;'
    const heading = type + 'font-size:23px;line-height:30px;font-weight:700;text-transform:none;color:#4b3028;'
    const css = '@media(max-width:480px){.niche-copy{padding-left:16px!important;padding-right:16px!important}.niche-quote{padding-left:20px!important;padding-right:20px!important}.niche-gallery{font-size:20px!important;padding:18px 16px!important}} .niche-v7 a:focus-visible{outline:3px solid #742924;outline-offset:3px}.niche-v7 .niche-list{list-style:disc outside}'
    const widths = {
        banner: [680,130], footer: [680,272],
        grid: [316,237],
    }
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
    }
    function https(value, media) {
        if (!value || /[\\\s]/.test(value)) return ''
        try {
            const parsed = new URL(value, origin)
            if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return ''
            if (media && !['www.bedfordfineartgallery.com','img.bedfordfineartgallery.com'].includes(parsed.hostname)) return ''
            return parsed.href
        } catch (error) {
            return ''
        }
    }
    function articlePath(slug) {
        return '/' + slug.replace('-html', '.html')
    }
    function mailerPath(slug) {
        return '/mailers/' + slug.replace(/-html$/, '.htm')
    }
    function paragraph(text, margin) {
        return '<p style="margin:' + margin + ';' + prose + '">' + escape(text).replace(/\n/g, '<br>') + '</p>'
    }
    function rich(text, last) {
        const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
        const blocks = []
        for (const line of lines) {
            if (!line.trim()) continue
            const item = /^\s*[-•]\s+(.+)$/.exec(line)
            const kind = item ? 'list' : 'text'
            const previous = blocks[blocks.length - 1]
            if (previous && previous.kind === kind) previous.lines.push(item ? item[1] : line)
            else blocks.push({ kind, lines: [item ? item[1] : line] })
        }
        return blocks.map((block, i) => {
            const margin = last && i === blocks.length - 1 ? '0' : '0 0 18px'
            if (block.kind === 'text') return paragraph(block.lines.join('\n'), margin)
            return '<ul class="niche-list" style="list-style:disc outside;margin:' + margin + ';padding:0 0 0 25px;' + prose + '">' +
                block.lines.map(line => '<li style="margin:0 0 9px;padding-left:3px;">' + escape(line) + '</li>').join('') + '</ul>'
        }).join('')
    }
    function image(photo, size, rounded, siteAsset) {
        const src = siteAsset ? photo.src : https(photo.src, true)
        if (!src) return ''
        const [width, fallbackHeight] = size
        const ratio = Number(photo.ratio)
        const height = Number.isFinite(ratio) && ratio >= .3 && ratio <= 4 ? Math.round(width / ratio) : fallbackHeight
        const url = https(photo.link, false)
        const tag = '<img src="' + escape(src) + '" alt="' + escape(photo.alt) + '" width="' + width + '" height="' + height +
            '" border="0" style="display:block;width:100%;height:auto;max-width:' + width + 'px;border:0;' + (rounded ? 'border-radius:10px;' : '') + '">'
        return url ? '<a href="' + escape(url) + '" target="_blank" rel="noopener" style="display:block;text-decoration:none;">' + tag + '</a>' : tag
    }
    function row(html, padding, attributes = '') {
        return '<tr><td ' + attributes + ' style="padding:' + padding + ';">' + html + '</td></tr>'
    }
    function photoRows(photo, padding) {
        if (!https(photo.src, true)) return ''
        return row(image(photo,[680,383]), padding) +
            (photo.caption ? row('<p style="margin:0;' + caption + '">' + escape(photo.caption) + '</p>', '10px 24px 0', 'class="niche-copy"') : '')
    }
    function gridCell(photo, left) {
        const item = image(photo, widths.grid)
        return '<td width="50%" valign="top" style="vertical-align:top;width:50%;padding:' + (left ? '0 10px 0 0' : '0 0 0 10px') + ';">' +
            item + (item && photo.caption ? '<p style="margin:10px 0 0;text-align:center;' + caption + '">' + escape(photo.caption) + '</p>' : '') + '</td>'
    }
    function grid(photos) {
        return row('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;"><tr>' +
            gridCell(photos[0],true) + gridCell(photos[1],false) + '</tr><tr><td colspan="2" height="26" style="height:26px;font-size:1px;">&nbsp;</td></tr><tr>' +
            gridCell(photos[2],true) + gridCell(photos[3],false) + '</tr></table>', '28px 24px 0', 'class="niche-copy"')
    }
    function topic(data, key) {
        return '<h2 style="margin:0 0 18px;' + heading + '">' + escape(data[key + 'Heading']) + '</h2>' +
            rich(data[key + 'First'], false) + rich(data[key + 'Second'], true)
    }
    function render(record, options = {}) {
        const d = record.niche || {}
        const item = key => d[key] || {}
        const banner = image({src:'/images/art-lovers-niche-v7-banner.png',alt:'Bedford Fine Art Gallery — Art Lovers’ Niche'},widths.banner,true,options.site)
        const footer = image({src:'/images/art-lovers-niche-v7-signature.png',alt:'A framed photograph of Joan and Jerry beside their handwritten thank-you message on a notebook'},widths.footer,true,options.site)
        const title = '<h1 style="margin:0 0 26px;' + type + 'font-size:28px;line-height:36px;font-weight:700;text-transform:none;color:#4b3028;">' + escape(d.title || 'Article title') + '</h1>'
        const quote = '<blockquote style="margin:0;text-align:center;' + type + 'font-size:24px;line-height:34px;font-style:italic;color:#5a3e31;">“' + escape(d.quote) + '”</blockquote>' +
            '<p style="margin:17px 0 0;text-align:center;' + caption + '">— ' + escape(d.quoteAuthor) + '</p>'
        const cta = '<table role="presentation" width="448" align="center" cellspacing="0" cellpadding="0" style="width:100%;max-width:448px;margin:auto;"><tr>' +
            '<td bgcolor="#742924" style="background:#742924;border:1px solid #bfa373;border-radius:8px;mso-padding-alt:20px 24px;">' +
            '<a class="niche-gallery" href="' + origin + '/Artists--Bios.html" style="display:block;padding:20px 24px;text-align:center;color:#fff7e8;text-decoration:none;border-radius:8px;' +
            type + 'font-size:22px;font-weight:700;line-height:28px;">View Our Online Gallery</a></td></tr></table>'
        const browserLink = options.mailer && record.slug
            ? row('<p style="margin:0;text-align:center;' + caption + '"><a style="color:#742924" href="' + origin + mailerPath(record.slug) + '">View in your browser</a></p>', '0 16px 13px') : ''
        return '<!--[if mso]><table role="presentation" width="680" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->' +
            '<table class="niche-v7" role="presentation" width="680" align="center" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="margin:0 auto;width:100%;max-width:680px;border-collapse:collapse;background-color:#ffffff;">' +
            browserLink + row(banner,'0') + photoRows(item('opening'),'22px 0 0') +
            row(title + topic(d,'first'),'32px 24px 0','class="niche-copy"') +
            grid(['painting1','painting2','painting3','painting4'].map(item)) +
            row(topic(d,'second'),'36px 24px 0','class="niche-copy"') + photoRows(item('featured'),'26px 0 0') +
            row(quote,'64px 40px 60px','class="niche-quote"') + row(footer,'0') + row(cta,'32px 24px 0','class="niche-copy"') +
            row('<p style="margin:0;text-align:center;color:#742924;' + type + 'font-size:20px;font-weight:700;line-height:28px;">Know someone who\'d love these? Forward this along!</p>', '26px 24px 36px','class="niche-copy"') +
            '</table><!--[if mso]></td></tr></table><![endif]-->'
    }
    function mailer(record) {
        // MEMS appends the unsubscribe link and derives the plain-text part from this HTML.
        const address = '<p class="niche-postal-address" align="center" style="margin:16px 0 0;text-align:center;font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:#3e3934;">' +
            'Bedford Fine Art Gallery<br>230 South Juliana Street<br>Bedford, PA 15522</p>'
        return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>' +
            escape(record.niche.title) + '</title><style>' + css + '</style></head><body style="margin:0;padding:24px 10px;background:#f3f0ea;">' +
            render(record,{mailer:true}) + address + '</body></html>\n'
    }
    return {origin, format, css, render, mailer, articlePath, mailerPath, https, escape}
})

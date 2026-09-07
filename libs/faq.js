import MarkdownIt from 'markdown-it'

// FAQs have their own small, inert Markdown surface. Photos use the image field.
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true }).disable('image')
const defaultValidate = markdown.validateLink.bind(markdown)
markdown.validateLink = function (value) {
    if (!defaultValidate(value) || /[\u0000-\u0020<>\\]/.test(value) || /^\/\//.test(value)) return false
    if (/^(?:\/[^/]|#[^\s]|[a-z0-9][a-z0-9_.\/-]*\.html(?:[?#].*)?$)/i.test(value)) return true
    if (/^mailto:[^\s@]+@[^\s@]+$/i.test(value)) return true
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password }
    catch (error) { return false }
}
export function renderFaq(value) { return markdown.render(String(value || '')) }
export function sortFaqs(records) {
    return records.slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) ||
        (String(a.slug) < String(b.slug) ? -1 : String(a.slug) > String(b.slug) ? 1 : 0))
}

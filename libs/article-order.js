// Stable newest-first ordering for both date-only and legacy ISO timestamps.
function timestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return -Infinity
    const parsed = Date.parse(value.length === 10 ? value + 'T00:00:00Z' : value)
    return Number.isFinite(parsed) ? parsed : -Infinity
}

function compareArticles(left, right) {
    const a = timestamp(left.date)
    const b = timestamp(right.date)
    if (a !== b) return a > b ? -1 : 1
    return String(left.slug || '').localeCompare(String(right.slug || ''))
}

module.exports = { compareArticles, timestamp }

export function easternDateKey(date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date || new Date())

    const values = parts.reduce((result, part) => {
        result[part.type] = part.value
        return result
    }, {})

    return [values.year, values.month, values.day].join('-')
}

export function hashString(value) {
    let hash = 2166136261

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
    }

    return hash >>> 0
}

export function seededRandom(seed) {
    let value = seed >>> 0

    return function () {
        value += 0x6d2b79f5
        let result = value
        result = Math.imul(result ^ result >>> 15, result | 1)
        result ^= result + Math.imul(result ^ result >>> 7, result | 61)
        return ((result ^ result >>> 14) >>> 0) / 4294967296
    }
}

export function dailyRandomSelection(items, count, seedParts = []) {
    const dateKey = easternDateKey()
    const identity = items.map((item) => item.slug || '').join('|')
    const seed = hashString([dateKey, ...seedParts, identity].join(':'))
    const random = seededRandom(seed)

    return items
        .map((item) => ({
            item,
            score: random(),
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, count)
        .map((entry) => entry.item)
}

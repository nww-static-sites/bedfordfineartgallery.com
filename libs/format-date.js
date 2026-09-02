const displayDateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
})

export const formatDateNoTime = function (utcString) {
    return utcString ? displayDateFormatter.format(new Date(utcString)) : null
}

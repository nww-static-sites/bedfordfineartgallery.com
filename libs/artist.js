export const artistNameWithTinyDescription = (artist) => {
    if (!artist) {
        return ''
    }

    let nameWithTinyDescription = artist.name || ''
    if (artist.tinyDescription) {
        nameWithTinyDescription += ` (${artist.tinyDescription})`
    }

    return nameWithTinyDescription
}

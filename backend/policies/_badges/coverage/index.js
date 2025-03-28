module.exports = {
    id: 'coverage',
    title: 'Coverage',
    description: 'This badge is for system usage.',
    category: 'Coverage',
    ordinal: 100,
    image: require('fs').readFileSync(__dirname + '/badge.svg').toString('base64')
}
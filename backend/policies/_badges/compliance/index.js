module.exports = {
    id: 'compliance',
    title: 'Compliance',
    description: 'This badge represents the compliance of the project with the best practices.',
    category: 'Package',
    ordinal: 100,
    image: require('fs').readFileSync(__dirname + '/badge.svg').toString('base64')
}
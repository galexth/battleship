module.exports = {
    default: {
        ships: {
            battleship: {
                count: 1,
                length: 5
            },
            cruiser: {
                count: 2,
                length: 4
            },
            destroyer: {
                count: 3,
                length: 3
            },
            submarine: {
                count: 4,
                length: 2
            }
        }
    },

    test: {
        ships: {
            cruiser: {
                count: 1,
                length: 4
            },
            submarine: {
                count: 2,
                length: 2
            }
        }
    }
}
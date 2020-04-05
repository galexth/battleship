var defer = require('config/defer').deferConfig;

const config = {
    host: 'localhost',
    port: 3000,
    db: {
        name: 'battleship_game',
        url: 'mongodb://localhost:27017',
        uri: defer(function () {
            return `${this.db.url}/${this.db.name}?retryWrites=true&w=majority`;
        }),
        options: {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        }
    },
    session: {
        cookie: {
            maxAge: 14 * 24 * 3600 * 1000
        },
        name: 'sid',
        secret: 'some secret',
        resave: true,
        saveUninitialized: true
    }
}

module.exports = config;
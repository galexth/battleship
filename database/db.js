const config = require('config');
const mongoose = require('mongoose');

mongoose.connect(config.get('db.uri'), config.get('db.options'));

module.exports = mongoose;
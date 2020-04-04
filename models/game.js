const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    layout: {
        type: Array,
        required: true
    },
    data: {
        type: JSON,
        required: true
    },
    rules: {
        type: JSON,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Game', schema);
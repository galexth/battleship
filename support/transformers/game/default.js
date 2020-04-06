const constsants = require('../../../lib/engine/constants');
const math = require('mathjs');
const helpers = require('../../helpers');

const POINT_HIT = 2;

module.exports = (doc, ret, options) => {

    if (doc.status === constsants.STATUS_NEW) {
        // Hide ships positions
        ret.layout = math.matrix(ret.layout).map(function (value, index, matrix) {
            if (helpers.isObject(value)) {
                return value.hit ? constsants.POINT_HIT : constsants.POINT_BLANK;
            }

            return value;
        }).toArray();
    }

    delete ret.__v;

    return ret;
}
const constants = require('../../../lib/engine/constants');
const math = require('mathjs');
const helpers = require('../../helpers');

const POINT_HIT = 2;

module.exports = (doc, ret, options) => {

    if (doc.status === constants.STATUS_NEW) {
        // Hide ships positions
        ret.layout = math.matrix(ret.layout).map(function (value, index, matrix) {
            if (helpers.isObject(value)) {
                return value.hit ? POINT_HIT : constants.POINT_BLANK;
            }

            return value;
        }).toArray();
    }

    Reflect.deleteProperty(ret, '__v');

    return ret;
};
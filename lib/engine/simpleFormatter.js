const constants = require('./constants');
const helpers = require('../../support/helpers');

module.exports = (layout) => {
    var pic = '';

    for (const row of layout) {
        for (const val of row) {

            if (helpers.isObject(val)) {
                pic += val.status === 'hit' ? constants.POINT_HIT : constants.POINT_SHIP;
            } else {
                pic += val;
            }
        }
        pic += '\n';
    }

    return pic;
}
const constants = require('./constants');
const helpers = require('../../support/helpers');

const POINT_HIT = String.fromCharCode(120);
const POINT_SHIP = String.fromCharCode(35);
const POINT_BLANK = String.fromCharCode(61);
const POINT_MISS = String.fromCharCode(176);

module.exports = (layout, reveal = true) => {
    var pic = '';

    for (const row of layout) {
        for (const val of row) {

            var pointShip = reveal ? POINT_SHIP : POINT_BLANK;

            if (helpers.isObject(val)) {
                pic += val.hit ? POINT_HIT : pointShip;
            } else {
                pic += val === constants.POINT_BLANK ? POINT_BLANK : POINT_MISS;
            }
        }
        pic += '\n';
    }

    return pic;
}
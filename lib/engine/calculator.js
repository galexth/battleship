const constants = require('./constants');

module.exports = (point, value, dir) => {
    var newPoint = { ...point };

    switch (dir) {
    case constants.DIRECTION_UP:
        newPoint.y -= value;
        break;
    case constants.DIRECTION_DOWN:
        newPoint.y += value;
        break;
    case constants.DIRECTION_LEFT:
        newPoint.x -= value;
        break;
    case constants.DIRECTION_RIGHT:
        newPoint.x += value;
        break;
    default: throw new Error(`Wrong direction '${dir}'`);
    }

    return newPoint;
};
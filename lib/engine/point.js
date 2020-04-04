function Point (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.isEqual = function (point) {
    if (this.x === point.x && this.y === point.y) {
        return true;
    }

    return false;
}

module.exports = Point;
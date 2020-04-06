function Point (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.isEqual = function (point) {
    return this.x === point.x && this.y === point.y;
};

module.exports = Point;
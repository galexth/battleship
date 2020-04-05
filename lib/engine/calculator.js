const UP = 'up';
const DOWN = 'down';
const LEFT = 'left';
const RIGHT = 'right';

module.exports = (point, value, dir) => {
    var newPoint = { ...point };

    switch (dir) {
    case UP:
        newPoint.y -= value;
        break;
    case DOWN:
        newPoint.y += value;
        break;
    case LEFT:
        newPoint.x -= value;
        break;
    case RIGHT:
        newPoint.x += value;
        break;
    default: throw new Error(`Wrong dir ${dir}`);
    }

    return newPoint;
}
const Board = require('./lib/engine/Board');
const rules = require('./lib/engine/rules');
const mathjs = require('mathjs');

const Point = require('./lib/engine/Point');
const constants = require('./lib/engine/constants');
const formatter = require('./lib/engine/SimpleFormatter');

// var d = {};

// console.log(constants.POINT_BLANK);

const b = [[0, 1], [2, 3]]

// process.exit(1);

// const d = math.matrix([[0, 1, 2], [3, 4, 5], [6, 7, 8]])

// console.log(d.subset(math.index([0, 1, 2], 0)).toArray());
// console.log(math.subset(d, math.index([0, 1, 2], 0), math.matrix().resize([3], 9)).toArray());

const board = new Board();

board.newGame(rules.default, 10, 10);


board.placeShip('submarine', new Point(0, 0), 'right')
board.placeShip('submarine', new Point(0, 9), 'right')
board.placeShip('submarine', new Point(9, 0), 'down')
board.placeShip('submarine', new Point(9, 9), 'up')
board.placeShip('destroyer', new Point(0, 2), 'right')
board.placeShip('destroyer', new Point(0, 4), 'right')
board.placeShip('destroyer', new Point(0, 6), 'right')
board.placeShip('cruiser', new Point(4, 0), 'down')
board.placeShip('cruiser', new Point(6, 0), 'down')
board.placeShip('battleship', new Point(5, 5), 'down')
console.log(board.draw(formatter, true));

console.log(board.hit(new Point(0, 0)));
console.log(board.hit(new Point(1, 0)));

console.log(board.hit(new Point(0, 9)));

console.log(board.hit(new Point(6, 2)));
console.log(board.hit(new Point(6, 0)));
console.log(board.hit(new Point(1, 9)));

console.log(board.hit(new Point(6, 1)));
console.log(board.hit(new Point(6, 3)));

console.log(board.hit(new Point(4, 0)));
console.log(board.hit(new Point(4, 1)));
console.log(board.hit(new Point(4, 2)));
console.log(board.hit(new Point(4, 3)));
console.log(board.hit(new Point(4, 4)));

console.log(board.hit(new Point(0, 2)));
console.log(board.hit(new Point(1, 2)));
console.log(board.hit(new Point(2, 2)));

console.log(board.hit(new Point(9, 0)));
console.log(board.hit(new Point(9, 1)));

console.log(board.hit(new Point(9, 8)));
console.log(board.hit(new Point(9, 9)));

console.log(board.hit(new Point(0, 6)));
console.log(board.hit(new Point(1, 6)));
console.log(board.hit(new Point(2, 6)));

console.log(board.hit(new Point(0, 4)));
console.log(board.hit(new Point(1, 4)));
console.log(board.hit(new Point(2, 4)));

console.log(board.hit(new Point(0, 8)));
console.log(board.hit(new Point(1, 8)));
console.log(board.hit(new Point(2, 8)));

console.log(board.hit(new Point(5, 9)));
console.log(board.hit(new Point(5, 8)));
console.log(board.hit(new Point(5, 7)));
console.log(board.hit(new Point(5, 6)));
console.log(board.hit(new Point(5, 5)));

console.log(board.draw(formatter, false));
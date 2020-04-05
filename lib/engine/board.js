const math = require('mathjs');
const Point = require('./point');
const GameError = require('./exceptions/GameError');
const constants = require('./constants');
const calculator = require('./calculator');
const format = require('./simpleFormatter');
const helpers = require('../../support/helpers');

class Board {

    newGame (rules, rows = 10, columns = 10) {
        this.rows = rows;
        this.columns = columns;
        this.status = constants.STATUS_NEW;
        this.layout = math.matrix().resize([this.rows, this.columns], constants.POINT_BLANK).toArray();

        this.rules = rules;
        this.history = [];

        this.ships = this.initShips();
    }

    loadGame (game) {
        this.layout = game.layout;
        [this.rows, this.columns] = math.size(this.layout);

        this.history = game.data.history;
        this.rules = game.rules;
        this.ships = this.initShips();
        this.status = this.checkStatus();
    }

    /**
     * Place a ship on the board
     * @param {string} ship // cruiser|...
     * @param {Point} startPoint // x:int, y:int
     * @param {string} direction // up|down|left|right
     * @returns {void}
     */
    placeShip (ship, startPoint, direction) {

        if (! this.canPlaceShip(ship)) {
            throw new GameError(`You have already placed all ships of type "${ship}".`);
        }

        const layoutBackup = math.matrix(this.layout).clone().toArray();

        var lastPoint = { ...startPoint };

        for (let i = 0; i < this.rules[ship].length; i++) {
            var point = calculator(startPoint, i, direction);

            if (this.isOutOfRange(point)) {
                this.layout = layoutBackup;
                throw new GameError('Coordinates are out of range.');
            }

            if (this.hasConflicts(point, lastPoint)) {
                this.layout = layoutBackup;
                throw new GameError('You can only place a ship at least 1 square from other ships.');
            }

            this.setPoint(point, {
                type: ship,
                id: [startPoint.x, startPoint.y].join(':'),
                status: 'new'
            });

            lastPoint = { ...point };
        }

        if (! this.ships[ship]) {
            this.ships[ship] = 0;
        }

        this.ships[ship]++;

        if (this.isGameReady()) {
            this.status = constants.STATUS_READY;
        }

        return true;
    }

    hit (point) {

        if (! this.isGameReady()) {
            throw new GameError('Place your ships.');
        }

        if (this.isOutOfRange(point)) {
            throw new GameError('Out of range.');
        }

        this.history.push({
            timestamp: new Date().getTime(),
            hit: { ...point }
        });

        if (this.isShip(point)) {

            var ship = this.getPoint(point);

            ship.status = 'hit';

            this.setPoint(point, ship);

            if (this.isShipSunk(ship)) {

                if (this.isGameFinished()) {
                    this.status = constants.STATUS_FINISHED;

                    return `${ship.type} sunk. All ships sunk. You won!`;
                }

                return `${ship.type} sunk.`;
            }

            return 'hit';
        }

        this.setPoint(point, constants.POINT_MISS);

        return 'miss';
    }

    initShips () {

        var ships = {};

        math.matrix(this.layout).forEach(function (value) {
            if (helpers.isObject(value)) {

                if (! ships[value.type]) {
                    ships[value.type] = {};
                }

                ships[value.type][value.id] = true;
            }
        });

        for (const ship in ships) {
            ships[ship] = ships[ship].length;
        }

        return ships;
    }

    checkStatus () {
        var status = constants.STATUS_NEW;

        if (this.isGameReady()) {

            status = constants.STATUS_READY;

            if (this.isGameFinished()) {
                status = constants.STATUS_FINISHED;
            }

        }

        return status;
    }

    draw () {
        return format(this.layout);
    }

    hasConflicts (cur, last) {
        if (! this.isBlank(cur)) {
            return true;
        }

        for (var i = Math.max(cur.x - 1, 0); i <= Math.min(cur.x + 1, this.rows - 1); i++) {
            for (var j = Math.max(cur.y - 1, 0); j <= Math.min(cur.y + 1, this.columns - 1); j++) {

                var point = new Point(i, j);

                if (! point.isEqual(cur) && ! point.isEqual(last) && this.isShip(point)) {
                    console.log(point);

                    return true;
                }
            }
        }

        return false;
    }

    isOutOfRange (point) {
        return typeof this.getPoint(point) === 'undefined';
    }

    isShip (point) {
        return helpers.isObject(this.getPoint(point));
    }

    isShipSunk (ship) {

        var hits = 0;

        math.matrix(this.layout).forEach(function (value) {
            if (helpers.isObject(value) && value.id === ship.id && value.status === 'hit') {
                hits++;
            }
        });

        return this.rules[ship.type].length === hits;
    }

    isBlank (point) {
        return this.getPoint(point) === constants.POINT_BLANK;
    }

    isGameReady () {
        for (const ship in this.rules) {
            if (! this.ships[ship] || this.ships[ship] !== this.rules[ship].count) {
                return false;
            }
        }

        return true;
    }

    isGameFinished () {
        for (var i = 0; i <= this.rows - 1; i++) {
            for (var j = 0; j <= this.columns - 1; j++) {
                var point = this.getPoint(new Point(i, j));

                if (helpers.isObject(point) && point.status !== 'hit') {
                    return false;
                }
            }
        }

        return true;
    }

    canPlaceShip (ship) {
        if (this.rules[ship] === 'undefined') {
            throw new GameError(`Unknown ship ${ship}.`);
        }

        return ! this.ships[ship] || this.ships[ship] < this.rules[ship].count;
    }

    setPoint (point, type) {
        this.layout[point.y][point.x] = type;
    }

    getPoint (point) {
        return this.layout[point.y][point.x];
    }

}

module.exports = Board;
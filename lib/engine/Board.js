const mathjs = require('mathjs');
const Point = require('./point');
const GameError = require('./exceptions/GameError');
const constants = require('./constants');
const calculator = require('./calculator');
const helpers = require('../../support/helpers');

class Board {

    newGame (rules, rows = 10, columns = 10) {
        this.rows = rows;
        this.columns = columns;
        this.status = constants.STATUS_NEW;
        this.layout = mathjs.matrix().resize([this.rows, this.columns], constants.POINT_BLANK).toArray();

        this.rules = rules;
        this.history = [];

        this.ships = this.initShips();
    }

    loadGame (game) {
        this.layout = game.layout;
        [this.rows, this.columns] = mathjs.size(this.layout);

        this.history = game.data.history;
        this.rules = game.rules;
        this.ships = this.initShips();
        this.status = this.checkStatus();
    }

    /**
     * Place a ship on the board
     * @param {string} ship // cruiser|...
     * @param {object} startPoint // x:int, y:int
     * @param {string} direction // up|down|left|right
     * @returns {void}
     */
    placeShip (ship, startPoint, direction) {

        if (! this.canPlaceShip(ship)) {
            throw new GameError(`You have already placed all ships of type "${ship}".`);
        }

        const layoutBackup = mathjs.matrix(this.layout).clone().toArray();

        let lastPoint = { ...startPoint };

        for (let i = 0; i < this.rules[ship].size; i++) {
            const point = calculator(startPoint, i, direction);

            if (this.isOutOfRange(point)) {
                this.layout = layoutBackup;
                throw new GameError('Coordinates are out of range.');
            }

            if (this.hasConflicts(point, lastPoint)) {
                this.layout = layoutBackup;
                throw new GameError('Ships should have at least one square between them in all directions.');
            }

            this.setLayout(point, {
                type: ship,
                hit: false,
                id: [startPoint.x, startPoint.y].join(':')
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

        if (this.status === constants.STATUS_FINISHED) {
            throw new GameError('The game is already finished.');
        }

        if (this.status !== constants.STATUS_READY) {
            throw new GameError('The game is not ready yet. Place your ships first.');
        }

        if (this.isOutOfRange(point)) {
            throw new GameError('Out of range.');
        }

        this.history.push({
            timestamp: new Date().getTime(),
            hit: { ...point }
        });

        if (this.isShip(point)) {

            const ship = this.getLayout(point);

            ship.hit = true;

            this.setLayout(point, ship);

            if (this.isShipSunk(ship)) {

                if (this.isGameFinished()) {
                    this.status = constants.STATUS_FINISHED;

                    return `You just sank a ${ship.type}. You won in ${this.history.length} moves!`;
                }

                return `You just sank a ${ship.type}!`;
            }

            return 'Hit!';
        }

        this.setLayout(point, constants.POINT_MISS);

        return 'Miss!';
    }

    initShips () {

        const ships = {};

        mathjs.matrix(this.layout).forEach(function (value) {
            if (helpers.isObject(value)) {

                if (! ships[value.type]) {
                    ships[value.type] = {};
                }

                ships[value.type][value.id] = true;
            }
        });

        for (const ship in ships) {
            ships[ship] = Object.keys(ships[ship]).length;
        }

        return ships;
    }

    checkStatus () {
        let status = constants.STATUS_NEW;

        if (this.isGameReady()) {

            status = constants.STATUS_READY;

            if (this.isGameFinished()) {
                status = constants.STATUS_FINISHED;
            }

        }

        return status;
    }

    draw (formatter, reveal) {
        return formatter(this.layout, reveal);
    }

    hasConflicts (cur, last) {
        if (! this.isBlank(cur)) {
            return true;
        }

        for (let i = Math.max(cur.x - 1, 0); i <= Math.min(cur.x + 1, this.rows - 1); i++) {
            for (let j = Math.max(cur.y - 1, 0); j <= Math.min(cur.y + 1, this.columns - 1); j++) {

                const point = new Point(i, j);

                if (! point.isEqual(cur) && ! point.isEqual(last) && this.isShip(point)) {
                    return true;
                }
            }
        }

        return false;
    }

    isOutOfRange (point) {
        const value = this.getLayout(point)

        return typeof value === 'undefined' || value === false;
    }

    isShip (point) {
        return helpers.isObject(this.getLayout(point));
    }

    isShipSunk (ship) {

        let hits = 0;

        mathjs.matrix(this.layout).forEach(function (value) {
            if (helpers.isObject(value) && value.id === ship.id) {
                hits += value.hit;
            }
        });

        return this.rules[ship.type].size === hits;
    }

    isBlank (point) {
        return this.getLayout(point) === constants.POINT_BLANK;
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
        for (let i = 0; i <= this.rows - 1; i++) {
            for (let j = 0; j <= this.columns - 1; j++) {
                const point = this.getLayout(new Point(i, j));

                if (helpers.isObject(point) && ! point.hit) {
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

    setLayout (point, type) {
        this.layout[point.y][point.x] = type;
    }

    getLayout (point) {
        try {
            return this.layout[point.y][point.x];
        } catch (e) {
            return false;
        }
    }

}

module.exports = Board;
const math = require('mathjs');
const rules = require('./rules');

class Board {

    static get POINT_BLANK () {
        return 'empty';
    }

    static get POINT_SHIP () {
        return 'ship';
    }

    static get POINT_MISS () {
        return 'miss';
    }

    static get POINT_HIT () {
        return 'hit';
    }

    static get STATUS_NEW () {
        return 'new';
    }

    static get STATUS_READY () {
        return 'ready';
    }

    static get STATUS_FINISHED () {
        return 'finished';
    }

    constructor (rows = 10, columns = 10) {
        this.rows = rows;
        this.columns = columns;
        this.status = this.STATUS_NEW;
        this.ships = this.initShips();
    }

    init () {
        this.layout = math.zeros(this.rows, this.columns).toArray();
    }

    load (layout) {
        this.layout = layout;

        [this.rows, this.columns] = math.size(layout);

        this.initStatus();
    }

    /**
     * Place a ship on the board
     * @param {string} ship // cruiser|...
     * @param {int} startRow // 0+
     * @param {int} startColumn // 0+
     * @param {string} direction // up|down|left|right
     * @returns {void}
     */
    placeShip (ship, startRow, startColumn, direction) {

        if (! this.canPlaceShip(ship)) {
            throw new Error(`You have already placed all ships of type "${ship}".`);
        }

        var layoutBackup = math.matrix(this.layout).clone().toArray();

        for (let i = 0; i < rules.ships[ship].length; i++) {
            var [row, column] = this.calculate(startRow, startColumn, i, direction);

            if (this.outOfRange(row, column)) {
                this.layout = layoutBackup;
                throw new Error('Coordinates are out of range.');
            }

            if (this.hasConflicts(row, column)) {
                this.layout = layoutBackup;
                throw new Error('The ship doesn\'t fit here.');
            }

            this.setPoint(row, column, this.POINT_SHIP);
        }

    }

    hit (row, column) {

        if (this.outOfRange(row, column)) {
            throw new Error('Out of range.');
        }

        if (this.isOccupied(row, column)) {
            this.setPoint(row, column, this.POINT_HIT);

            if (this.checkSunk(row, column)) {

                if (this.isFinished()) {
                    this.status = this.STATUS_FINISHED;

                    return 'All ships sunk. You won!';
                }

                return `${this.getShip(row, column)} sunk.`;
            }

            return 'hit';
        }

        this.setPoint(row, column, this.POINT_MISS);

        return 'miss';
    }

    outOfRange (row, column) {
        return typeof this.length[row][column] === 'undefined';
    }

    isOccupied (row, column) {
        return this.length[row][column] === this.POINT_SHIP;
    }

    canPlaceShip (ship) {
        if (rules.ships[ship] === 'undefined') {
            throw new Error(`Unknown ship ${ship}.`);
        }

        return this.ships[ship].count < rules.ships[ship].count;
    }

    calculate (row, column, modificator, direction) {
        var coords = [row, column];

        switch (direction) {
        case 'up':
            coords[1] -= modificator;
            break;
        case 'down':
            coords[1] += modificator;
            break;
        case 'left':
            coords[0] -= modificator;
            break;
        case 'right':
            coords[0] += modificator;
            break;
        default: throw new Error(`Wrong direction ${direction}`);
        }

        return coords;
    }

    setPoint (row, column, type) {
        this.layout[row][column] = type;
    }

    initShips () {
        this.ships = {};

        for (const ship in rules.ships) {
            this.ships[ship] = {
                count: 0,
                sunk: 0
            };
        }
    }
}

module.exports = Board;
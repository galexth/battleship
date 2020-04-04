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
        this.status = this.constructor.STATUS_NEW;
        this.ships = this.initShips();

    }

    init () {
        this.layout = math.matrix().resize([this.rows, this.columns], this.constructor.POINT_BLANK).toArray();
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

        const layoutBackup = math.matrix(this.layout).clone().toArray();

        var lastPoint = { row: startRow, column: startColumn };

        for (let i = 0; i < rules.ships[ship].length; i++) {
            var { row, column } = this.calculate(startRow, startColumn, i, direction);

            if (this.outOfRange(row, column)) {
                this.layout = layoutBackup;
                throw new Error('Coordinates are out of range.');
            }

            if (this.hasConflicts({ row, column }, lastPoint)) {
                this.layout = layoutBackup;
                throw new Error('Conflicts.');
            }

            this.setPoint(row, column, this.constructor.POINT_SHIP);

            lastPoint = { row, column };
        }

        this.ships[ship].count++;
    }

    hasConflicts (current, last) {
        var { row, column } = current;

        if (! this.isBlank(row, column)) {
            return true;
        }

        for (var i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows); i++) {
            for (var j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns); j++) {

                if (current.row === i && current.column === j || last.row === i && last.column === j) {
                    continue;
                }

                if (this.isOccupied(i, j)) {
                    return true;
                }
            }
        }


    }

    hit (row, column) {

        if (this.outOfRange(row, column)) {
            throw new Error('Out of range.');
        }

        if (this.isOccupied(row, column)) {
            this.setPoint(row, column, this.constructor.POINT_HIT);

            if (this.checkSunk(row, column)) {

                if (this.isFinished()) {
                    this.status = this.constructor.STATUS_FINISHED;

                    return 'All ships sunk. You won!';
                }

                var ship = this.getShip(row, column);

                this.ships[ship].sunk++;

                return `${ship} sunk.`;
            }

            return 'hit';
        }

        this.setPoint(row, column, this.constructor.POINT_MISS);

        return 'miss';
    }

    outOfRange (row, column) {
        return typeof this.layout[row][column] === 'undefined';
    }

    isOccupied (row, column) {
        return this.layout[row][column] === this.constructor.POINT_SHIP;
    }

    isBlank (row, column) {
        return this.layout[row][column] === this.constructor.POINT_BLANK;
    }

    canPlaceShip (ship) {
        if (rules.ships[ship] === 'undefined') {
            throw new Error(`Unknown ship ${ship}.`);
        }

        return this.ships[ship].count < rules.ships[ship].count;
    }

    calculate (row, column, modificator, direction) {
        var coords = { row, column };

        switch (direction) {
        case 'up':
            coords.row -= modificator;
            break;
        case 'down':
            coords.row += modificator;
            break;
        case 'left':
            coords.column -= modificator;
            break;
        case 'right':
            coords.column += modificator;
            break;
        default: throw new Error(`Wrong direction ${direction}`);
        }

        return coords;
    }

    setPoint (row, column, type) {
        this.layout[row][column] = type;
    }

    initShips () {
        var ships = {};

        for (const ship in rules.ships) {
            ships[ship] = {
                count: 0,
                sunk: 0
            };
        }

        return ships;
    }
}

module.exports = Board;
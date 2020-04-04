const math = require('mathjs');
const Point = require('./point');

class Board {

    static get POINT_BLANK () {
        return String.fromCharCode(61);
    }

    static get POINT_MISS () {
        return String.fromCharCode(176);
    }

    static get POINT_HIT () {
        return String.fromCharCode(120);
    }

    static get POINT_SHIP () {
        return String.fromCharCode(35);
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

    newGame (rules, rows = 10, columns = 10) {
        this.rows = rows;
        this.columns = columns;
        this.status = this.constructor.STATUS_NEW;
        this.layout = math.matrix().resize([this.rows, this.columns], this.constructor.POINT_BLANK).toArray();
        this.status = this.constructor.STATUS_NEW;

        this.rules = rules;

        this.data = { ships: {}, history: [] };

        for (const ship in this.rules.ships) {
            this.data.ships[ship] = {
                count: 0,
                sunk: 0
            };
        }
    }

    loadGame (game) {
        this.layout = game.layout;
        this.data = game.data;
        this.rules = game.rules;

        [this.rows, this.columns] = math.size(game.layout);
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
            throw new Error(`You have already placed all ships of type "${ship}".`);
        }

        const layoutBackup = math.matrix(this.layout).clone().toArray();

        var lastPoint = { ...startPoint };

        for (let i = 0; i < this.rules.ships[ship].length; i++) {
            var point = this.calculate(startPoint, i, direction);

            if (this.outOfRange(point)) {
                this.layout = layoutBackup;
                throw new Error('Coordinates are out of range.');
            }

            if (this.hasConflicts(point, lastPoint)) {
                this.layout = layoutBackup;
                throw new Error('Conflicts.');
            }

            this.setPoint(point, ship);

            lastPoint = { ...point };
        }

        this.data.ships[ship].count++;

        if (this.isGameReady()) {
            this.status = this.constructor.STATUS_READY;
        }

    }

    iterateOverSurroundings (point, callback) {
        for (var i = Math.max(point.x - 1, 0); i <= Math.min(point.x + 1, this.rows - 1); i++) {
            for (var j = Math.max(point.y - 1, 0); j <= Math.min(point.y + 1, this.columns - 1); j++) {
                var res = callback(this, new Point(i, j));

                if (res === false) {
                    return res;
                }
            }
        }
    }

    hasConflicts (cur, last) {
        if (! this.isBlank(cur)) {
            return true;
        }

        for (var i = Math.max(cur.x - 1, 0); i <= Math.min(cur.x + 1, this.rows - 1); i++) {
            for (var j = Math.max(cur.y - 1, 0); j <= Math.min(cur.y + 1, this.columns - 1); j++) {

                var point = new Point(i, j);

                if (! point.isEqual(cur) && ! point.isEqual(last) && this.isShip(point)) {
                    return true;
                }
            }
        }

        return false;
    }

    isSunk (point) {
        for (var i = Math.max(point.x - 1, 0); i <= Math.min(point.x + 1, this.rows - 1); i++) {
            for (var j = Math.max(point.y - 1, 0); j <= Math.min(point.y + 1, this.columns - 1); j++) {
                if (this.isShip(new Point(i, j))) {
                    return false;
                }
            }
        }

        return true;
    }

    getShip (point) {
        return this.getPoint(point);
    }

    hit (point) {

        if (! this.isGameReady()) {
            throw new Error('Place your ships.');
        }

        if (this.outOfRange(point)) {
            throw new Error('Out of range.');
        }

        this.data.history.push({
            timestamp: new Date().getTime(),
            hit: { ...point }
        });

        if (this.isShip(point)) {

            var ship = this.getShip(point);

            this.setPoint(point, this.constructor.POINT_HIT);

            if (this.isSunk(point)) {

                this.data.ships[ship].sunk++;

                if (this.isGameFinished()) {
                    this.status = this.constructor.STATUS_FINISHED;

                    return `${ship} sunk. All ships sunk. You won!`;
                }

                return `${ship} sunk.`;
            }

            return 'hit';
        }

        this.setPoint(point, this.constructor.POINT_MISS);

        return 'miss';
    }

    outOfRange (point) {
        return typeof this.layout[point.y][point.x] === 'undefined';
    }

    isShip (point) {
        return ! this.isBlank(point) && ! this.isHit(point) && ! this.isMiss(point);
    }

    isBlank (point) {
        return this.layout[point.y][point.x] === this.constructor.POINT_BLANK;
    }

    isMiss (point) {
        return this.layout[point.y][point.x] === this.constructor.POINT_MISS;
    }

    isHit (point) {
        return this.layout[point.y][point.x] === this.constructor.POINT_HIT;
    }

    isGameReady () {
        for (const ship in this.rules.ships) {
            if (this.data.ships[ship].count !== this.rules.ships[ship].count) {
                return false;
            }
        }

        return true;
    }

    draw () {
        var pic = '';

        for (const row of this.layout) {
            for (const val of row) {
                pic += val.length > 1 ? this.constructor.POINT_SHIP : val;
            }
            pic += '\n';
        }

        return pic;
    }

    isGameFinished () {
        for (const ship in this.rules.ships) {
            if (this.data.ships[ship].sunk !== this.rules.ships[ship].count) {
                return false;
            }
        }

        return true;
    }

    canPlaceShip (ship) {
        if (this.rules.ships[ship] === 'undefined') {
            throw new Error(`Unknown ship ${ship}.`);
        }

        return this.data.ships[ship].count < this.rules.ships[ship].count;
    }

    calculate (point, modificator, direction) {
        var newPoint = { ...point };

        switch (direction) {
        case 'up':
            newPoint.y -= modificator;
            break;
        case 'down':
            newPoint.y += modificator;
            break;
        case 'left':
            newPoint.x -= modificator;
            break;
        case 'right':
            newPoint.x += modificator;
            break;
        default: throw new Error(`Wrong direction ${direction}`);
        }

        return newPoint;
    }

    setPoint (point, type) {
        this.layout[point.y][point.x] = type;
    }

    getPoint (point) {
        return this.layout[point.y][point.x];
    }

}

module.exports = Board;
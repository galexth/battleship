const { wrap } = require('../support/helpers');
const Paginator = require('../support/paginator');
const { check, validationResult } = require('express-validator')

const Game = require('../models/game');
const Board = require('../lib/engine/board');
const rules = require('../lib/engine/rules');

module.exports.index = wrap(async (req, res) => {
    const offset = req.params.offset || 0;
    const limit = req.params.limit || 10;

    const query = Game.find();

    const results = await new Paginator(query, offset, limit).paginate();

    return res.json(results);
});

module.exports.show = wrap(async (req, res) => {
    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: 'Game not found.'
        });
    }

    const board = new Board();

    board.load(model.layout);

    res.status(201).json(model);
});

module.exports.store = wrap(async (req, res) => {

    const { rows, columns } = req.body;

    await check('rows').isInt().isLength({ gt: 10 }).withMessage('the board should be at least 10 x 10.').run(req);
    await check('columns').isInt().isLength({ gt: 10 }).withMessage('the board should be at least 10 x 10.').run(req);

    const errors = validationResult(req);

    if (! errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.mapped()
        });
    }

    const board = new Board(rows, columns);

    board.init();

    const model = await Game.create({
        status: board.getStatus(),
        layout: board.compress()
    });

    res.status(201).json(model);
});

module.exports.placeShip = wrap(async (req, res) => {

    const { row, column, type, direction } = req.body;

    await check('row').notEmpty().withMessage('row is required.').run(req);
    await check('column').notEmpty().withMessage('column is required.').run(req);
    await check('type').isIn(Object.keys(rules.ships)).withMessage('unknown type.').run(req);
    await check('direction').isIn(['up', 'down', 'left', 'right']).withMessage('wrong direction.').run(req);

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: 'Game not found.'
        });
    }

    if (model.status !== Board.STATUS_NEW) {
        return res.status(422).json({
            errors: 'All ships are already placed.'
        });
    }

    const board = new Board();

    board.load(model.layout);

    if (! board.placeShip(type, row, column, direction)) {
        return res.status(422).json({
            errors: 'The ship can\'t be placed here.'
        });
    }

    model.layout = board.compress();
    model.status = board.status;

    await model.save();

    res.json(model);
});

module.exports.attack = wrap(async (req, res) => {

    const { row, column } = req.body;

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: 'Game not found.'
        });
    }

    if (model.status !== 'ready') {
        return res.status(422).json({
            errors: 'Game is either not ready or already been finished.'
        });
    }

    const board = new Board();

    board.load(model.layout);

    const message = board.hit(row, column);

    model.status = board.status;
    model.layout = board.compress();

    await model.save();

    res.json({ model, message });

});
const { wrap } = require('../support/helpers');
const Paginator = require('../support/paginator');
const { check, validationResult } = require('express-validator')

const Game = require('../models/game');
const Board = require('../lib/engine/board');
const Point = require('../lib/engine/point');
const rules = require('../lib/engine/rules');
const constants = require('../lib/engine/constants');

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

    board.loadGame(model);

    res.status(201).json({ model, layout: board.draw() });
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

    const board = new Board();

    board.newGame(rules.default, rows, columns);

    const model = await Game.create({
        status: board.status,
        layout: board.layout,
        data: { history: board.history },
        rules: board.rules
    });

    res.status(201).json(model);
});

module.exports.ship = wrap(async (req, res) => {

    const { x, y, type, direction } = req.body;

    await check('x').notEmpty().withMessage('column is required.').run(req);
    await check('y').notEmpty().withMessage('row is required.').run(req);
    await check('type').isIn(Object.keys(rules)).withMessage('unknown type.').run(req);
    await check('direction').isIn(['up', 'down', 'left', 'right']).withMessage('wrong direction.').run(req);

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: 'Game not found.'
        });
    }

    if (model.status !== constants.STATUS_NEW) {
        return res.status(422).json({
            errors: 'All ships are already placed.'
        });
    }

    const board = new Board();

    board.loadGame(model);

    if (! board.placeShip(type, new Point(x, y), direction)) {
        return res.status(422).json({
            errors: 'The ship can\'t be placed here.'
        });
    }

    model.status = board.status;
    model.layout = board.layout;
    model.data.history = board.history;

    var message = `A ${type} placed.`;

    if (board.status === constants.STATUS_READY) {
        message = 'The game is ready.';
    }

    model.markModified('layout');
    model.markModified('data');
    await model.save();

    res.json({ model, message });
});

module.exports.attack = wrap(async (req, res) => {

    const { x, y } = req.body;

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: 'Game not found.'
        });
    }

    const board = new Board();

    board.loadGame(model);

    const message = board.hit(new Point(x, y));

    model.status = board.status;
    model.layout = board.layout;
    model.data.history = board.history;
    model.markModified('layout');
    model.markModified('data');

    await model.save();

    res.json({ model, message });

});
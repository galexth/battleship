const { wrap } = require('../support/helpers');
const defaultTransform = require('../support/transformers/game/defaultTransform');
const Paginator = require('../support/paginator');
const { check, validationResult } = require('express-validator');

const Game = require('../models/game');
const Board = require('../lib/engine/Board');
const rules = require('../lib/engine/rules');
const constants = require('../lib/engine/constants');

module.exports.index = wrap(async (req, res) => {
    await check('offset').isInt({ min: 0 })
        .optional().withMessage('offset should be an integer greater or equals to 0.').run(req);
    await check('limit').isInt({ min: 1 })
        .optional().withMessage('limit should be an integer greater than 0.').run(req);

    const errors = validationResult(req);

    if (! errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.mapped()
        });
    }

    const offset = req.query.offset || 0;
    const limit = req.query.limit || 10;

    const query = Game.find();

    const results = await new Paginator(query, offset, limit).paginate();

    results.data = results.data.map((value) => value.toObject({ transform: defaultTransform }));

    return res.json(results);
});

module.exports.show = wrap(async (req, res) => {
    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            error: 'Game not found.'
        });
    }

    const board = new Board();

    board.loadGame(model);

    res.json(model.toObject({ transform: defaultTransform }));
});

module.exports.store = wrap(async (req, res) => {

    await check('rows').isInt({ min: 10 }).optional().withMessage('the board should be at least 10 x 10.').run(req);
    await check('columns').isInt({ min: 10 }).optional().withMessage('the board should be at least 10 x 10.').run(req);

    const { rows, columns } = req.body;

    const errors = validationResult(req);

    if (! errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.mapped()
        });
    }

    const board = new Board();

    board.newGame(rules.default, rows || 10, columns || 10);

    const model = await Game.create({
        status: board.status,
        layout: board.layout,
        data: { history: board.history },
        rules: board.rules
    });

    res.status(201).json(model.toObject({ transform: defaultTransform }));
});

module.exports.ship = wrap(async (req, res) => {

    await check('x').isInt({ min: 0 }).withMessage('coordinates required.').run(req);
    await check('y').isInt({ min: 0 }).withMessage('coordinates required.').run(req);
    await check('type').isIn(Object.keys(rules.default)).withMessage('unknown type.').run(req);
    await check('direction').isIn([
        constants.DIRECTION_UP,
        constants.DIRECTION_DOWN,
        constants.DIRECTION_LEFT,
        constants.DIRECTION_RIGHT
    ]).withMessage('wrong direction.').run(req);

    const errors = validationResult(req);

    if (! errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.mapped()
        });
    }

    const { x, y, type, direction } = req.body;

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: ['Game not found.']
        });
    }

    if (model.status !== constants.STATUS_NEW) {
        return res.status(422).json({
            errors: ['All ships are already placed.']
        });
    }

    const board = new Board();

    board.loadGame(model);

    try {
        board.placeShip(type, { x, y }, direction);
    } catch (e) {
        return res.status(422).json({ errors: [e.message] });
    }

    model.status = board.status;
    model.layout = board.layout;
    model.data.history = board.history;

    model.markModified('layout');
    model.markModified('data');
    await model.save();

    res.json(model.toObject({ transform: defaultTransform }));
});

module.exports.attack = wrap(async (req, res) => {

    await check('x').isInt({ min: 0 }).withMessage('coordinates required.').run(req);
    await check('y').isInt({ min: 0 }).withMessage('coordinates required.').run(req);

    const errors = validationResult(req);

    if (! errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.mapped()
        });
    }

    const { x, y } = req.body;

    const model = await Game.findById(req.params.id);

    if (! model) {
        return res.status(404).json({
            errors: ['Game not found.']
        });
    }

    const board = new Board();

    board.loadGame(model);

    let message = '';

    try {
        message = board.hit({ x, y });
    } catch (e) {
        return res.status(422).json({ errors: [e.message] });
    }

    model.status = board.status;
    model.layout = board.layout;
    model.data.history = board.history;
    model.markModified('layout');
    model.markModified('data');

    await model.save();

    res.json({ model: model.toObject({ transform: defaultTransform }), message });
});
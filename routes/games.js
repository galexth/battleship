const express = require('express');
const router = express.Router();
const controller = require('../controllers/GameController');

router.route('/')
    .get(controller.index)
    .post(controller.store);

router.route('/:id')
    .get(controller.show)
    .put(controller.attack)

module.exports = router;
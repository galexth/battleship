const express = require('express');
const router = express.Router();
const controller = require('../controllers/GameController');

router.route('/')
    .get(controller.index)
    .post(controller.store);

router.route('/:id').get(controller.show);
router.put('/:id/attack', controller.attack)
    .put('/:id/ship', controller.ship);

module.exports = router;
const request = require('supertest');
const app = require('../app');
const db = require('../database/db');
const constants = require('../lib/engine/constants');

beforeAll(async () => {
    await db.connection.dropCollection('games');
});

afterAll(async (done) => {
    await db.connection.close();
    done();
});

// = - blank
// # - ship
// ##==#=#==#
// ====#=#==#
// ###=#=#===
// ====#=#===
// ###=======
// =====#====
// ###==#====
// =====#====
// =====#===#
// ##===#===#

describe('Full game session', () => {

    test('It should create a new game, place all ships and won the game.', async () => {
        const res = await request(app)
            .post('/games')
            .send({ rows: 10, columns: 10 });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');

        const id = res.body._id;

        await ship(id, 'submarine', 0, 0, 'right');
        await ship(id, 'submarine', 0, 9, 'right');
        await ship(id, 'submarine', 9, 0, 'down');
        await ship(id, 'submarine', 9, 9, 'up');
        await ship(id, 'destroyer', 0, 2, 'right');
        await ship(id, 'destroyer', 0, 4, 'right');
        await ship(id, 'destroyer', 0, 6, 'right');
        await ship(id, 'cruiser', 4, 0, 'down');
        await ship(id, 'cruiser', 6, 0, 'down');
        const battleship = await ship(id, 'battleship', 5, 5, 'down');

        expect(battleship.body.status).toEqual(constants.STATUS_READY);

        await hit(id, 0, 0, 'hit!');
        await hit(id, 1, 0, 'submarine sunk!');
        await hit(id, 0, 9, 'hit!');
        await hit(id, 6, 2, 'hit!');
        await hit(id, 6, 0, 'hit!');
        await hit(id, 1, 9, 'submarine sunk!');
        await hit(id, 6, 1, 'hit!');
        await hit(id, 6, 3, 'cruiser sunk!');
        await hit(id, 4, 0, 'hit!');
        await hit(id, 4, 1, 'hit!');
        await hit(id, 4, 2, 'hit!');
        await hit(id, 4, 3, 'cruiser sunk!');
        await hit(id, 4, 4, 'miss!');
        await hit(id, 0, 2, 'hit!');
        await hit(id, 1, 2, 'hit!');
        await hit(id, 2, 2, 'destroyer sunk!');
        await hit(id, 9, 0, 'hit!');
        await hit(id, 9, 1, 'submarine sunk!');
        await hit(id, 9, 8, 'hit!');
        await hit(id, 9, 9, 'submarine sunk!');
        await hit(id, 0, 6, 'hit!');
        await hit(id, 1, 6, 'hit!');
        await hit(id, 2, 6, 'destroyer sunk!');
        await hit(id, 0, 4, 'hit!');
        await hit(id, 1, 4, 'hit!');
        await hit(id, 2, 4, 'destroyer sunk!');
        await hit(id, 0, 8, 'miss!');
        await hit(id, 1, 8, 'miss!');
        await hit(id, 2, 8, 'miss!');
        await hit(id, 5, 9, 'hit!');
        await hit(id, 5, 8, 'hit!');
        await hit(id, 5, 7, 'hit!');
        await hit(id, 5, 6, 'hit!');
        const lastResponse = await hit(id, 5, 5, 'battleship sunk. You won!');

        expect(lastResponse.body.model.status).toEqual(constants.STATUS_FINISHED);
    });
});

async function hit (gameId, x, y, result) {
    const res = await request(app)
        .put(`/games/${gameId}/attack`)
        .send({ x, y });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual(result);

    return res;
}

async function ship (gameId, type, x, y, direction) {
    const res = await request(app)
        .put(`/games/${gameId}/ship`)
        .send({ x, y, type, direction });

    expect(res.statusCode).toEqual(200);

    return res;
}
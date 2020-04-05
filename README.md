<h1 align="left">Battleship Game</h1>

<p align="left">
    Hi! This is Battleship game, at least its API =).
</p>

<h2 align="left">Notes</h2>
<p align="left">
    The game layout is always revealed in the response. Its a test after all.
</p>

```bash
npm install
```

<h2 align="left">Testing</h2>

```bash
DEBUG=battleship:* npm test
```

<h2 align="left">Http</h2>

```bash
DEBUG=battleship:* node bin/www
```
or
```bash
DEBUG=battleship:* nodemon bin/www
```

<h2 align="left">API</h2>

<h4 align="left">Get all games:</h4>
```bash
GET /games?offset=0&limit=10
```

<h4 align="left">Get a specific game:</h4>
```bash
GET /games/:id
```

<h4 align="left">Create a game:</h4>
```bash
POST /games
{
    rows: 10,
    columns: 10
}
```

<h4 align="left">Place a ship:</h4>
```bash
PUT /games/:id/ship
{
    x: 1,
    y: 2,
    type: submarine,
    direction: right
}
```

<h4 align="left">Hit the board:</h4>
```bash
PUT /games/:id/attack
{
    x: 1,
    y: 2
}
```
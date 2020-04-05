<h1 align="left">Battleship Game</h1>

<p align="left">
    Hi! This is Battleship game, at least its API =).
</p>

<h2 align="left">Notes</h2>
<p align="left">
    The game layout is always revealed in the response. Its a test after all.
</p>

<h2 align="left">Install on MacOS</h2>

<p align="left">
    In order to run this game on your os you need to install mongoDB and actully NodeJS.
</p>

```bash
npm install
npm install -g migrate-mongo
migrate-mongo up
```

<h2 align="left">Install with Vagrant</h2>

<p align="left">
    You need to install Vagrant and Virtual Box here. After run this code:
</p>

```bash
vagrant up
vagrant ssh
cd /vagrant
```

<p align="left">
    Inside Vagrant environment:
</p>

```bash
npm install
sudo npm install -g migrate-mongo
migrate-mongo up
```

<h2 align="left">Testing</h2>

```bash
DEBUG=battleship:* npm test
```

<h2 align="left">Http</h2>

<p align="left">
    The default host is:
</p>

```bash
localhost:3000
```

```bash
DEBUG=battleship:* node bin/www
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
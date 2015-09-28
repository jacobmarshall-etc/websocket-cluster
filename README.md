## How to?

```
brew install redis
redis-server
```

```
PORT=25501 REDIS_DB=1 node src/websocket.js
PORT=25502 REDIS_DB=1 node src/websocket.js
PORT=25503 REDIS_DB=1 node src/websocket.js
PORT=25504 REDIS_DB=1 node src/websocket.js
PORT=25600 node src/web.js
PORT=25700 REDIS_DB=1 node src/api.js
```

Open `http://localhost:25600/` and enter a user id. Open more than one tab, and do the same.

Open `http://localhost:25700/notify/:userId` (where `:userId` is the user id).

## Port ranges

- `255xx` Websocket servers
- `256xx` Web servers
- `257xx` API servers
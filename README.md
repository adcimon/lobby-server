# Lobby Server

General-purpose WebSocket-based lobby server. The project is built with [Node.js](https://nodejs.org/) and [Nest.js](https://nestjs.com/).

**Features**
- Authorization using [JSON Web Tokens](https://jwt.io/).
- Create and join rooms.
- Kick users.
- Send text messages via room chats.

The [API documentation](https://adcimon.github.io/lobby-server/api/) can be found inside the `api` folder.

The `.env` files have the environment variables used by the server.

| Variables |
| ----- |
| NODE_ENV |
| PORT |
| ENABLE_HTTPS |
| KEY_PATH |
| CERT_PATH |
| ENABLE_CORS |
| TOKEN_SECRET_KEY |
| DATABASE_TYPE |
| DATABASE_HOST |
| DATABASE_PORT |
| DATABASE_USERNAME |
| DATABASE_PASSWORD |
| DATABASE_NAME |
| DATABASE_ENTITIES |

## Installation

```
cd lobby-server
npm install
```

## Run

Run the server for development, debug or production.
```
cd lobby-server
npm run start:dev
npm run start:debug
npm run start:prod
```

## Build and Deploy

Build the project, compiling it to JavaScript.
```
cd lobby-server
npm run build
```

Once the `dist` folder is created start the application.
```
node dist/main.js
```
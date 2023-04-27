# Lobby Server

General-purpose WebSocket-based lobby server. Built with [Node.js](https://nodejs.org/) and [Nest.js](https://nestjs.com/).

**Features**
- Authorization using [JSON Web Tokens](https://jwt.io/).
- Create and join rooms.
- Kick users.
- Send text messages via room chats.
- API [documentation](https://adcimon.github.io/lobby-server/api/) available.

## Install

1. Configure the `.env` file.

2. Install `Node 16`.

3. Install packages.
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

## Build

Build the project, compiling it to JavaScript.
```
cd lobby-server
npm run build
```

Once the `dist` folder is created start the application.
```
node dist/main.js
```

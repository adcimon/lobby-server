import { WebSocket } from 'ws';

export class Session {
	username: string;
	socket: WebSocket;

	sendMessage(message: any) {
		this.socket?.send(JSON.stringify(message));
	}

	close() {
		this.socket?.close();
	}

	terminate() {
		this.socket?.terminate();
	}
}

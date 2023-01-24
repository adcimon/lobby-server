const LOG_STYLE = 'background: rgb(33, 33, 33); color: rgb(51, 255, 0)';
const PING_PERIOD = 5 * 1000;

export const LobbyEvent =
{
	ClientConnected:        "client_connected",
	ClientDisconnected:     "client_disconnected",
	ClientAuthorized:       "client_authorized",
	Error:                  "error",
	UserOnline:             "user_online",
	UserOffline:            "user_offline",
	RoomCreated:            "room_created",
	RoomDeleted:            "room_deleted",
	GuestJoinedRoom:        "guest_joined_room",
	GuestLeftRoom:          "guest_left_room",
	UserRejoined:           "user_rejoined",
	UserKicked:             "user_kicked",
	ChatText:               "chat_text"
};

export function LobbyClient()
{
	let connectPromises = { };
	let disconnectPromises = { };
	let messagePromises = { };
	let events = { };

	let token = null;
	let socket = null;
	let keepAliveTimeout = null;

	/**
	 * Add a function that will be called whenever the specified event is emitted.
	 */
	const on = function( event, listener )
	{
		if( Object.values(LobbyEvent).indexOf(event) === -1 )
		{
			return false;
		}

		if( !(listener instanceof Function) )
		{
			return false;
		}

		if( typeof events[event] !== "object" )
		{
			events[event] = [];
		}

		events[event].push(listener);

		return true;
	};
 
	/**
	 * Remove the function previously added to be called whenever the specified event is emitted.
	 */
	const off = function( event, listener )
	{
		if( Object.values(LobbyEvent).indexOf(event) === -1 )
		{
			return false;
		}

		if( !(listener instanceof Function) )
		{
			return false;
		}

		if( typeof events[event] === "object" )
		{
			let index = events[event].indexOf(listener);
			if( index > -1 )
			{
				events[event].splice(index, 1);
				return true;
			}
		}

		return false;
	};
 
	/**
	 * Emit the specified event.
	 */
	const emit = function( event )
	{
		if( Object.values(LobbyEvent).indexOf(event) === -1 )
		{
			return false;
		}

		let args = [].slice.call(arguments, 1);

		if( typeof events[event] === "object" )
		{
			let listeners = events[event].slice();
			for( let i = 0; i < listeners.length; i++ )
			{
				listeners[i].apply(this, args);
			}
		}

		return true;
	};

	/**
	 * Connect to the server.
	 */
	const connect = async function( url, accessToken )
	{
		if( socket && socket.readyState !== WebSocket.CLOSED )
		{
			return Promise.reject();
		}

		resetPromises();

		token = accessToken;
		socket = new WebSocket(url + '?token=' + token);

		socket.onopen = onOpen;
		socket.onclose = onClose;
		socket.onmessage = onMessage;

		const promise = new Promise(async(resolve, reject) =>
		{
			connectPromises[token] = { resolve, reject };
		});

		return promise;
	};

	/**
	 * Disconnect from the server.
	 */
	const disconnect = async function()
	{
		if( !socket || socket.readyState !== WebSocket.OPEN )
		{
			return Promise.reject();
		}

		socket?.close();

		const promise = new Promise(async(resolve, reject) =>
		{
			disconnectPromises[token] = { resolve, reject };
		});

		return promise;
	};

	/**
	 * Event handler called when the connection is opened.
	 */
	const onOpen = function()
	{
		console.log('%cconnected%o', LOG_STYLE, socket.url);

		startKeepAlive();

		const token = getTokenFromURL(socket.url);
		const event = { event: LobbyEvent.ClientConnected, data: { url: socket.url } };

		// Resolve the connect promise.
		const promise = connectPromises[token];
		if( promise )
		{
			promise.resolve(event);
			delete connectPromises[token];
		}

		// Emit the client connected event.
		emit(LobbyEvent.ClientConnected, event);
	};

	/**
	 * Event handler called when the connection is closed.
	 */
	const onClose = function()
	{
		console.log('%cdisconnected%o', LOG_STYLE, socket.url);

		stopKeepAlive();

		const token = getTokenFromURL(socket.url);
		const event = { event: LobbyEvent.ClientDisconnected, data: { url: socket.url } };

		// Resolve the disconnect promise.
		const disconnectPromise = disconnectPromises[token];
		if( disconnectPromise )
		{
			disconnectPromise.resolve(event);
			delete disconnectPromises[token];
		}

		// Reject the connect promise.
		const connectPromise = connectPromises[token];
		if( connectPromise )
		{
			connectPromise.reject(event);
			delete connectPromises[token];
		}

		// Emit the client disconnected event.
		emit(LobbyEvent.ClientDisconnected, event);
	};

	/**
	 * Event handler called when a message is received from the server.
	 */
	const onMessage = function( msg )
	{
		let message = JSON.parse(msg.data);
		if( message.event !== "pong" )
		{
			console.log('%c%s%o', LOG_STYLE, message.event, message.data);
		}

		const uuid = message.data.uuid;

		delete message.data.token;
		delete message.data.uuid;

		// Resolve the message promise.
		const promise = messagePromises[uuid];
		if( promise )
		{
			delete messagePromises[uuid];

			if( message.event !== 'error' )
			{
				promise.resolve(message);
			}
			else
			{
				promise.reject(message);
			}
		}

		// Emit the event if it is possible.
		emit(message.event, message);
	};

	/**
	 * Send a message to the server.
	 */
	const sendMessage = async function( message )
	{
		if( !socket || socket.readyState !== WebSocket.OPEN )
		{
			return Promise.reject();
		}

		message.data.token = token;
		message.data.uuid = uuid();

		const promise = new Promise(async(resolve, reject) =>
		{
			messagePromises[message.data.uuid] = { resolve, reject };
		});

		// Send the message.
		let msg = JSON.stringify(message);
		socket.send(msg);
		if( message.event !== "ping" )
		{
			console.log('%c%s%o', LOG_STYLE, message.event, msg);
		}

		return promise;
	};

	/**
	 * Start a keep alive timeout.
	 */
	const startKeepAlive = function()
	{
		if( !socket || socket.readyState !== WebSocket.OPEN )
		{
			return;
		}

		ping();

		keepAliveTimeout = window.setTimeout(startKeepAlive, PING_PERIOD);
	};
 
	/**
	 * Stop the keep alive timeout.
	 */
	const stopKeepAlive = function()
	{
		window.clearTimeout(keepAliveTimeout);
	};

	/**
	 * Send a ping to the server.
	 */
	const ping = async function()
	{
		const msg =
		{
			event: "ping",
			data: { }
		};
		return sendMessage(msg);
	};

	/**
	 * Get the user's room.
	 */
	const getRoom = async function()
	{
		const msg =
		{
			event: "get_room",
			data: { }
		};
		return sendMessage(msg);
	};

	/**
	 * Get the lobby rooms.
	 */
	const getRooms = async function()
	{
		const msg =
		{
			event: "get_rooms",
			data: { }
		};
		return sendMessage(msg);
	};

	/**
	 * Create a room.
	 * @param {Object} options - Optional parameters: password, hidden, size, icon.
	 */
	const createRoom = async function( name, options = {} )
	{
		const msg =
		{
			event: "create_room",
			data:
			{
				name: name,
				password: options?.password,
				hidden: options?.hidden,
				size: options?.size,
				icon: options?.icon
			}
		};
		return sendMessage(msg);
	};

	/**
	 * Join a room.
	 * @param {Object} options - Optional parameters: password.
	 */
	const joinRoom = async function( name, options = {} )
	{
		const msg =
		{
			event: "join_room",
			data:
			{
				name: name,
				password: options?.password
			}
		};
		return sendMessage(msg);
	};

	/**
	 * Leave a room.
	 */
	const leaveRoom = async function()
	{
		const msg =
		{
			event: "leave_room",
			data: { }
		};
		return sendMessage(msg);
	};

	/**
	 * Kick a user from the room.
	 */
	const kickUser = async function( target )
	{
		const msg =
		{
			event: "kick_user",
			data:
			{
				target: target
			}
		};
		return sendMessage(msg);
	};

	/**
	 * Send a text message to the room.
	 */
	const sendText = async function( text )
	{
		const msg =
		{
			event: "send_text",
			data:
			{
				text: text
			}
		};
		return sendMessage(msg);
	};

	/**
	 * Reset the socket promises.
	 */
	const resetPromises = function()
	{
		connectPromises = { };
		disconnectPromises = { };
		messagePromises = { };
	};

	/**
	 * Get the token parameter from a URL.
	 */
	const getTokenFromURL = function( url )
	{
		const searchParams = url.substring(url.indexOf('?'), url.length);
		const params = new URLSearchParams(searchParams);
		const token = params.get('token');
		return token;
	};

	/**
	 * Generate a universally unique identifier.
	 * Reference: RFC 4122 https://www.ietf.org/rfc/rfc4122.txt
	 */
	const uuid = function()
	{
		return uuidv4();
	};
 
	/**
	 * Generate a universally unique identifier v4.
	 * Reference: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
	 */
	const uuidv4 = function()
	{
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
	};

	return {
		on,
		off,
		connect,
		disconnect,
		ping,
		getRoom,
		getRooms,
		createRoom,
		joinRoom,
		leaveRoom,
		kickUser,
		sendText
	}
}
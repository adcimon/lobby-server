"use strict";

export const LobbyEvent =
{
	ClientConnected:        "client_connected",
	ClientDisconnected:     "client_disconnected",
    Error:                  "error",
    UserOnline:             "user_online",
    UserOffline:            "user_offline",
    RoomCreated:            "room_created",
    RoomDeleted:            "room_deleted",
    GuestJoinedRoom:        "guest_joined_room",
    GuestLeftRoom:          "guest_left_room",
    UserRejoined:           "user_rejoined"
};

export function LobbyClient( settings )
{
    let defaultSettings =
    {
        debug: false,
        debugStyle: "background: hsla(0, 0%, 13%, 1); color: hsla(180, 89%, 45%, 1)",
        pingPeriod: 5 * 1000
    };

    settings = (typeof settings !== "object") ? { } : settings;
    settings = Object.assign({ }, defaultSettings, settings);

    let console = (settings.debug) ? window.console : null;

    let responses = { };
    let events = { };

    let token = null;
    let socket = null;
    let keepAliveTimeout = null;

    /**
     * Add a function that will be called whenever the specified event is emitted.
     */
    let on = function( event, listener )
    {
        if( Object.values(LobbyEvent).indexOf(event) == -1 )
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
    let off = function( event, listener )
    {
        if( Object.values(LobbyEvent).indexOf(event) == -1 )
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
    let emit = function( event )
    {
        if( Object.values(LobbyEvent).indexOf(event) == -1 )
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
    let connect = function( url, accessToken )
    {
        token = accessToken;
        socket = new WebSocket(url + "?token=" + token);

        socket.onopen = onOpen;
        socket.onmessage = onMessage;
        socket.onclose = onClose;
    };

    /**
     * Disconnect from the server.
     */
    let disconnect = function()
    {
        socket?.close();
    };

    /**
     * Event handler called when the connection is opened.
     */
    let onOpen = function( event )
    {
        console?.log("%c" + "connected" + "%o", settings.debugStyle, socket.url);

        startKeepAlive();

        emit(LobbyEvent.ClientConnected, { url: socket.url });
    };

    /**
     * Event handler called when the connection is closed.
     */
    let onClose = function( event )
    {
        console?.log("%c" + "disconnected" + "%o", settings.debugStyle, socket.url);

        stopKeepAlive();

        emit(LobbyEvent.ClientDisconnected, { url: socket.url });
    };

    /**
     * Event handler called when a message is received from the server.
     */
    let onMessage = function( msg )
    {
        let message = JSON.parse(msg.data);
        if( message.event === "pong" )
        {
            return;
        }

        console?.log(" %c%s" + "%o", settings.debugStyle, message.event, message.data);

        // Check whether the message has a response listener.
        if( message.data.uuid in responses )
        {
            let response = responses[message.data.uuid];
            delete responses[message.data.uuid];
            delete message.data.uuid;
            response(message);
            return;
        }

        // Check whether the message has an event.
        emit(message.event, message);
    };

    /**
     * Send a message to the server.
     */
    let sendMessage = function( message, response )
    {
        if( !socket || socket.readyState !== WebSocket.OPEN )
        {
            return false;
        }

        // Set the token.
        message.data.token = token;

        // Generate a UUID.
        message.data.uuid = uuid();

        // Add the response listener.
        if( response instanceof Function )
        {
            responses[message.data.uuid] = response;
        }

        // Send the message.
        let msg = JSON.stringify(message);
        socket.send(msg);
        if( message.event !== "ping" )
        {
            console?.log(" %c%s" + "%o", settings.debugStyle, message.event, msg);
        }

        return true;
    };

    /**
     * Start a keep alive timeout.
     */
    let startKeepAlive = function()
    {
        if( !socket || socket.readyState !== WebSocket.OPEN )
        {
            return;
        }

        ping();

        keepAliveTimeout = window.setTimeout(startKeepAlive, settings.pingPeriod);
    };

    /**
     * Stop the keep alive timeout.
     */
    let stopKeepAlive = function()
    {
        window.clearTimeout(keepAliveTimeout);
    };

    /**
     * Send a ping to the server.
     */
    let ping = function()
    {
        let message =
        {
            event: "ping",
            data: { }
        };
        return sendMessage(message);
    };

    /**
     * Get the user's room.
     */
    let getRoom = function( response )
    {
        let message =
        {
            event: "get_room",
            data: { }
        };
        return sendMessage(message, response);
    };

    /**
     * Get the lobby rooms.
     */
    let getRooms = function( response )
    {
        let message =
        {
            event: "get_rooms",
            data: { }
        };
        return sendMessage(message, response);
    };

    /**
     * Create a room.
     */
    let createRoom = function( name, password, hidden, icon, response )
    {
        let message =
        {
            event: "create_room",
            data:
            {
                name: name,
                password: password,
                hidden: hidden,
                icon: icon
            }
        };
        return sendMessage(message, response);
    };

    /**
     * Join a room.
     */
    let joinRoom = function( name, password, response )
    {
        let message =
        {
            event: "join_room",
            data:
            {
                name: name,
                password: password
            }
        };
        return sendMessage(message, response);
    };

    /**
     * Leave a room.
     */
    let leaveRoom = function( response )
    {
        let message =
        {
            event: "leave_room",
            data: { }
        };
        return sendMessage(message, response);
    };

    /**
     * Generate a universally unique identifier.
     * Reference: RFC 4122 https://www.ietf.org/rfc/rfc4122.txt
     */
    let uuid = function()
    {
        return uuidv4();
    };

    /**
     * Generate a universally unique identifier v4.
     * Reference: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
     */
    let uuidv4 = function()
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
        getRoom,
        getRooms,
        createRoom,
        joinRoom,
        leaveRoom
    };
}
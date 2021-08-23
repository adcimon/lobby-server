"use strict";

export function LobbyClient( settings )
{
//#region PRIVATE

    let defaultSettings =
    {
        // Debug messages to console?
        debug: false,

        // Style used to debug messages.
        debugStyle: "background: hsla(0, 0%, 13%, 1); color: hsla(180, 89%, 45%, 1)",

        // Period to send ping messages in ms.
        pingPeriod: 5 * 1000
    };

    settings = (typeof settings !== "object") ? { } : settings;
    settings = Object.assign(defaultSettings, settings);

    let console = (settings.debug) ? window.console : null;

    let onconnect = null;
    let ondisconnect = null;
    let onerror = null;
    let listeners = { };

    let token = null;
    let socket = null;
    let keepAliveTimeout = null;

    /**
     * Event handler called when the client is connected.
     * @param {Function} listener - The listener.
     */
    let onConnect = function( listener )
    {
        if( listener instanceof Function )
        {
            onconnect = listener;
        }
    };

    /**
     * Event handler called when the client is disconnected.
     * @param {Function} listener - The listener.
     */
    let onDisconnect = function( listener )
    {
        if( listener instanceof Function )
        {
            ondisconnect = listener;
        }
    }

    /**
     * Event handler called when the client receives an error.
     * @param {Function} listener - The listener.
     */
    let onError = function( listener )
    {
        if( listener instanceof Function )
        {
            onerror = listener;
        }
    }

    /**
     * Connect to the server.
     * @param {String} url - The URL of the server.
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
     * @param {EventListener} event - The dispatched event.
     */
    let onOpen = function( event )
    {
        console?.log("%c" + "connected" + "%o", settings.debugStyle, socket.url);

        // startKeepAlive();
        if( onconnect )
        {
            onconnect({ url: socket.url });
        }
    };

    /**
     * Event handler called when the connection is closed.
     * @param {EventListener} event - The dispatched event.
     */
    let onClose = function( event )
    {
        console?.log("%c" + "disconnected" + "%o", settings.debugStyle, socket.url);

        stopKeepAlive();
        if( ondisconnect )
        {
            ondisconnect({ url: socket.url });
        }
    };

    /**
     * Event handler called when a message is received from the server.
     * @param {EventListener} event - The event received.
     */
    let onMessage = function( event )
    {
        let message = JSON.parse(event.data);
        if( message.event !== "pong" )
        {
            console?.log(" %c%s" + "%o", settings.debugStyle, message.event, message.data);
        }

        // Check whether the message has a listener.
        if( message.data.uuid in listeners )
        {
            let listener = listeners[message.data.uuid];
            delete listeners[message.data.uuid];
            delete message.data.uuid;
            listener(message.data);
        }
        else if( message.event === "error" )
        {
            if( onerror )
            {
                onerror(message.data);
            }
        }
    };

    /**
     * Send a message to the server.
     * @param {Object} message - The message to send.
     * @param {Function} listener - The response listener.
     */
    let sendMessage = function( message, listener )
    {
        // Generate a UUID.
        message.data.uuid = uuid();

        // Add the listener.
        if( listener instanceof Function )
        {
            listeners[message.data.uuid] = listener;
        }

        // Send the message.
        let msg = JSON.stringify(message);
        socket.send(msg);
        if( message.event !== "ping" )
        {
            console?.log(" %c%s" + "%o", settings.debugStyle, message.event, msg);
        }
    };

    /**
     * Start a keep alive timeout.
     */
    let startKeepAlive = function()
    {
        if( !socket || socket.readyState !== 1 )
        {
            console?.error("Connection not openned, ready state " + socket.readyState);
            return false;
        }

        ping();

        keepAliveTimeout = window.setTimeout(startKeepAlive, settings.pingPeriod);

        return true;
    };

    /**
     * Stop the keep alive timeout.
     */
    let stopKeepAlive = function()
    {
        window.clearTimeout(keepAliveTimeout);
    }

    /**
     * Send a ping to the server.
     */
    let ping = function()
    {
        let message = { event: "ping", data: { token: token } };
        sendMessage(message);
    };

    /**
     * Get the user's room.
     * @param {Function} listener - The response listener.
     */
    let getRoom = function( listener )
    {
        let message = { event: "get_room", data: { token: token } };
        sendMessage(message, listener);
    };

    /**
     * Create a room.
     * @param {String} name - The room name.
     * @param {String} password - The room password.
     * @param {Function} listener - The response listener.
     */
    let createRoom = function( name, password, listener )
    {
        let message = { event: "create_room", data: { token: token, name: name, password: password } };
        sendMessage(message, listener);
    };

    /**
     * Join a room.
     * @param {String} name - The room name.
     * @param {String} password - The room password.
     * @param {Function} listener - The response listener.
     */
    let joinRoom = function( name, password, listener )
    {
        let message = { event: "join_room", data: { token: token, name: name, password: password } };
        sendMessage(message, listener);
    };

    /**
     * Leave a room.
     * @param {Function} listener - The response listener.
     */
    let leaveRoom = function( listener )
    {
        let message = { event: "leave_room", data: { token: token } };
        sendMessage(message, listener);
    };

    /**
     * Generate a universally unique identifier.
     * Reference: RFC 4122 https://www.ietf.org/rfc/rfc4122.txt
     * @return {String} The universally unique identifier.
     */
    let uuid = function()
    {
        return uuidv4();
    }

    /**
     * Generate a universally unique identifier v4.
     * Reference: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
     * @return {String} The universally unique identifier v4.
     */
    let uuidv4 = function()
    {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

//#endregion

//#region PUBLIC

    return {
        onConnect,
        onDisconnect,
        onError,
        connect,
        disconnect,
        getRoom,
        createRoom,
        joinRoom,
        leaveRoom
    };

//#endregion
}
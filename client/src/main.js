"use strict";

import { LobbyEvent, LobbyClient } from "./lobbyClient.js";

//var url = "wss://" + window.location.host;
var url = "ws://localhost:9003";
var lobbyClient;

var tokenSelect, connectButton, disconnectButton;
var roomInput, passwordInput, hiddenInput, sizeInput, iconInput, createRoomButton, joinRoomButton, leaveRoomButton;
var kickInput, kickButton;
var chat, chatInput, responseLog, eventLog;

window.addEventListener("load", main);
window.addEventListener("beforeunload", exit);

function main()
{
    initializeInterface();
    initializeClient();
}

function exit()
{
    lobbyClient?.disconnect();
}

function initializeInterface()
{
    // Connection.
    tokenSelect = document.querySelector("#tokenSelect");
    connectButton = document.querySelector("#connectButton");
    connectButton.addEventListener("click", handleClickConnectButton);
    disconnectButton = document.querySelector("#disconnectButton");
    disconnectButton.disabled = true;
    disconnectButton.addEventListener("click", handleClickDisconnectButton);

    // Lobby.
    roomInput = document.querySelector("#roomInput");
    passwordInput = document.querySelector("#passwordInput");
    hiddenInput = document.querySelector("#hiddenInput");
    sizeInput = document.querySelector("#sizeInput");
    iconInput = document.querySelector("#iconInput");
    createRoomButton = document.querySelector("#createRoomButton");
    createRoomButton.addEventListener("click", handleClickCreateRoomButton);
    joinRoomButton = document.querySelector("#joinRoomButton");
    joinRoomButton.addEventListener("click", handleClickJoinRoomButton);
    leaveRoomButton = document.querySelector("#leaveRoomButton");
    leaveRoomButton.addEventListener("click", handleClickLeaveRoomButton);

    kickInput = document.querySelector("#kickInput");
    kickButton = document.querySelector("#kickButton");
    kickButton.addEventListener("click", handleClickKickButton);

    chat = document.querySelector("#chat");
    chatInput = document.querySelector("#chatInput");
    chatInput.addEventListener("keyup", handleClickChat);
    responseLog = document.querySelector("#responseLog");
    responseLog.value = "";
    eventLog = document.querySelector("#eventLog");
    eventLog.value = "";
}

function initializeClient()
{
    lobbyClient = new LobbyClient({ debug: true });
    lobbyClient.on(LobbyEvent.ClientConnected, handleClientConnected);
    lobbyClient.on(LobbyEvent.ClientDisconnected, handleClientDisconnected);
    lobbyClient.on(LobbyEvent.Error, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.UserOnline, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.UserOffline, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.RoomCreated, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.RoomDeleted, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.GuestJoinedRoom, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.GuestLeftRoom, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.UserRejoined, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.UserKicked, handleLobbyEvent);
    lobbyClient.on(LobbyEvent.ChatText, handleChatText);
}

//#region InterfaceEventHandlers
function handleClickConnectButton()
{
    tokenSelect.disabled = true;
    connectButton.disabled = true;

    let token = tokenSelect.options[tokenSelect.selectedIndex].value;
    lobbyClient.connect(url, token);
}

function handleClickDisconnectButton()
{
    lobbyClient.disconnect();

    tokenSelect.disabled = false;
    connectButton.disabled = false;
}

function handleClickCreateRoomButton()
{
    let name = roomInput.value;
    let password = passwordInput.value;
    let hidden = hiddenInput.checked;
    let size = sizeInput.value;
    let icon = iconInput.value;
    lobbyClient.createRoom(name,
    {
        password: password,
        hidden: hidden,
        size: size,
        icon: icon,
        response: function( event )
        {
            responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
        }
    });
}

function handleClickJoinRoomButton()
{
    let name = roomInput.value;
    let password = passwordInput.value;
    lobbyClient.joinRoom(name,
    {
        password: password,
        response: function( event )
        {
            responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
        }
    });
}

function handleClickLeaveRoomButton()
{
    lobbyClient.leaveRoom(
    {
        response: function( event )
        {
            chat.value = "";
            responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
        }
    });
}

function handleClickKickButton()
{
    let user = kickInput.value;
    lobbyClient.kickUser(user,
    {
        response: function( event )
        {
            responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
        }
    });
}

function handleClickChat( event )
{
    if( event.keyCode === 13 )
    {
        event.preventDefault();
        let value = chatInput.value;
        lobbyClient.sendText(value,
        {
            response: function( event )
            {
                responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
            }
        });
        chatInput.value = "";
    }
}
//#endregion

//#region LobbyEventHandlers
function handleClientConnected()
{
    disconnectButton.disabled = false;

    lobbyClient.getRooms(function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClientDisconnected()
{
    tokenSelect.disabled = false;
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    chat.value = "";
}

function handleChatText( event )
{
    chat.value += event.data.username + ": " + event.data.text + "\n";
}

function handleLobbyEvent( event )
{
    eventLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
}
//#endregion
"use strict";

import { LobbyEvent, LobbyClient } from "./js/lobbyClient.js";

//var url = "wss://" + window.location.host;
var url = "ws://localhost:9010";
var lobbyClient;

var tokenSelect, connectButton, disconnectButton;
var lobby, roomInput, passwordInput, hiddenInput, iconInput, createRoomButton, joinRoomButton, leaveRoomButton;
var kickInput, kickButton;
var chat, chatInput, responseLog, eventLog;

window.addEventListener("load", main);
window.addEventListener("beforeunload", exit);

function main()
{
    initUI();
    initClient();
}

function exit()
{
    lobbyClient?.disconnect();
}

function initUI()
{
    // Connection.
    tokenSelect = document.body.query("#tokenSelect");
    connectButton = document.body.query("#connectButton");
    connectButton.on("click", handleClickConnectButton);
    disconnectButton = document.body.query("#disconnectButton");
    disconnectButton.disable();
    disconnectButton.on("click", handleClickDisconnectButton);

    // Lobby.
    lobby = document.body.query("#lobby");
    lobby.disable(true);

    roomInput = document.body.query("#roomInput");
    passwordInput = document.body.query("#passwordInput");
    hiddenInput = document.body.query("#hiddenInput");
    iconInput = document.body.query("#iconInput");
    createRoomButton = document.body.query("#createRoomButton");
    createRoomButton.on("click", handleClickCreateRoomButton);
    joinRoomButton = document.body.query("#joinRoomButton");
    joinRoomButton.on("click", handleClickJoinRoomButton);
    leaveRoomButton = document.body.query("#leaveRoomButton");
    leaveRoomButton.on("click", handleClickLeaveRoomButton);

    kickInput = document.body.query("#kickInput");
    kickButton = document.body.query("#kickButton");
    kickButton.on("click", handleClickKickButton);

    chat = document.body.query("#chat");
    chatInput = document.body.query("#chatInput");
    chatInput.on("keyup", handleClickChat);
    responseLog = document.body.query("#responseLog");
    responseLog.value = "";
    eventLog = document.body.query("#eventLog");
    eventLog.value = "";

    document.body.show();
}

function initClient()
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

//#region UIEventHandlers
function handleClickConnectButton()
{
    tokenSelect.disable();
    connectButton.disable();

    let token = tokenSelect.options[tokenSelect.selectedIndex].value;
    lobbyClient.connect(url, token);
}

function handleClickDisconnectButton()
{
    lobbyClient.disconnect();

    tokenSelect.enable();
    connectButton.enable();

    lobby.disable(true);
}

function handleClickCreateRoomButton()
{
    let name = roomInput.value;
    let password = passwordInput.value;
    let hidden = hiddenInput.checked;
    let icon = iconInput.value;
    lobbyClient.createRoom(name, password, hidden, icon, function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClickJoinRoomButton()
{
    let name = roomInput.value;
    let password = passwordInput.value;
    lobbyClient.joinRoom(name, password, function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClickLeaveRoomButton()
{
    lobbyClient.leaveRoom(function( event )
    {
        chat.value = "";
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClickKickButton()
{
    let user = kickInput.value;
    lobbyClient.kickUser(user, function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClickChat( event )
{
    if( event.keyCode === 13 )
    {
        event.preventDefault();
        let value = chatInput.value;
        lobbyClient.sendText(value, function( event )
        {
            responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
        });
        chatInput.value = "";
    }
}
//#endregion

//#region LobbyEventHandlers
function handleClientConnected()
{
    disconnectButton.enable();
    lobby.enable(true);

    lobbyClient.getRooms(function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function handleClientDisconnected()
{
    tokenSelect.enable();
    connectButton.enable();
    disconnectButton.disable();
    lobby.disable(true);
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
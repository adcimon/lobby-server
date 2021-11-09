"use strict";

import { LobbyEvent, LobbyClient } from "./js/lobbyClient.js";

//var lobbyUrl = "wss://" + window.location.host;
var lobbyUrl = "ws://localhost:9000";
var lobbyClient;

var tokenSelect, connectButton, disconnectButton;
var lobby, roomInput, passwordInput, hiddenInput, iconInput, createRoomButton, joinRoomButton, leaveRoomButton;
var responseLog, eventLog;

window.addEventListener("load", main);
window.addEventListener("beforeunload", exit);

function main()
{
    initUI();
    initLobbyClient();
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
    connectButton.on("click", onClickConnectButton);
    disconnectButton = document.body.query("#disconnectButton");
    disconnectButton.disable();
    disconnectButton.on("click", onClickDisconnectButton);

    // Lobby.
    lobby = document.body.query("#lobby");
    lobby.disable(true);

    // Room.
    roomInput = document.body.query("#roomInput");
    passwordInput = document.body.query("#passwordInput");
    hiddenInput = document.body.query("#hiddenInput");
    iconInput = document.body.query("#iconInput");
    createRoomButton = document.body.query("#createRoomButton");
    createRoomButton.on("click", onClickCreateRoomButton);
    joinRoomButton = document.body.query("#joinRoomButton");
    joinRoomButton.on("click", onClickJoinRoomButton);
    leaveRoomButton = document.body.query("#leaveRoomButton");
    leaveRoomButton.on("click", onClickLeaveRoomButton);

    responseLog = document.body.query("#responseLog");
    responseLog.value = "";
    eventLog = document.body.query("#eventLog");
    eventLog.value = "";

    document.body.show();
}

function initLobbyClient()
{
    lobbyClient = new LobbyClient({ debug: true });
    lobbyClient.on(LobbyEvent.ClientConnected, onClientConnected);
    lobbyClient.on(LobbyEvent.ClientDisconnected, onClientDisconnected);
    lobbyClient.on(LobbyEvent.Error, onLobbyEvent);
    lobbyClient.on(LobbyEvent.UserOnline, onLobbyEvent);
    lobbyClient.on(LobbyEvent.UserOffline, onLobbyEvent);
    lobbyClient.on(LobbyEvent.RoomCreated, onLobbyEvent);
    lobbyClient.on(LobbyEvent.RoomDeleted, onLobbyEvent);
    lobbyClient.on(LobbyEvent.GuestJoinedRoom, onLobbyEvent);
    lobbyClient.on(LobbyEvent.GuestLeftRoom, onLobbyEvent);
    lobbyClient.on(LobbyEvent.UserRejoined, onLobbyEvent);
}

//#region UIEventHandlers
function onClickConnectButton()
{
    tokenSelect.disable();
    connectButton.disable();

    let token = tokenSelect.options[tokenSelect.selectedIndex].value;
    lobbyClient.connect(lobbyUrl, token);
}

function onClickDisconnectButton()
{
    lobbyClient.disconnect();

    tokenSelect.enable();
    connectButton.enable();

    lobby.disable(true);
}

function onClickCreateRoomButton()
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

function onClickJoinRoomButton()
{
    let name = roomInput.value;
    let password = passwordInput.value;
    lobbyClient.joinRoom(name, password, function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function onClickLeaveRoomButton()
{
    lobbyClient.leaveRoom(function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}
//#endregion

//#region LobbyEventHandlers
function onClientConnected()
{
    disconnectButton.enable();
    lobby.enable(true);

    lobbyClient.getRooms(function( event )
    {
        responseLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
    });
}

function onClientDisconnected()
{
    tokenSelect.enable();
    connectButton.enable();
    disconnectButton.disable();
    lobby.disable(true);
}

function onLobbyEvent( event )
{
    eventLog.value = event.event.toUpperCase() + "\n" + JSON.stringify(event, undefined, 4);
}
//#endregion
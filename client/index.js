import { LobbyEvent, LobbyClient } from './lobbyClient.js';

const url = 'ws://localhost:9000';
var lobbyClient;

var tokenSelect = null;
var connectButton = null;
var disconnectButton = null;

var lobby = null;

var getRoomButton = null;
var getRoomsButton = null;

var nameInput = null;
var passwordInput = null;
var hiddenInput = null;
var sizeInput = null;
var iconInput = null;

var createRoomButton = null;
var joinRoomButton = null;
var leaveRoomButton = null;

var kickInput = null;
var kickButton = null;

var chat = null;
var chatInput = null;
var sendButton = null;

var log = null;

window.addEventListener('load', main);

function main()
{
	initializeClient();
	initializeInterface();
}

function initializeClient()
{
	lobbyClient = new LobbyClient();
	lobbyClient.on(LobbyEvent.ClientDisconnected, onClientDisconnected);
	lobbyClient.on(LobbyEvent.ClientAuthorized, onEvent);
	lobbyClient.on(LobbyEvent.Error, onEvent);
	lobbyClient.on(LobbyEvent.UserOnline, onEvent);
	lobbyClient.on(LobbyEvent.UserOffline, onEvent);
	lobbyClient.on(LobbyEvent.RoomCreated, onEvent);
	lobbyClient.on(LobbyEvent.RoomDeleted, onEvent);
	lobbyClient.on(LobbyEvent.GuestJoinedRoom, onEvent);
	lobbyClient.on(LobbyEvent.GuestLeftRoom, onEvent);
	lobbyClient.on(LobbyEvent.UserRejoined, onEvent);
	lobbyClient.on(LobbyEvent.UserKicked, onEvent);
	lobbyClient.on(LobbyEvent.ChatText, onChatText);
}

function initializeInterface()
{
	tokenSelect = document.querySelector('#tokenSelect');

	connectButton = document.querySelector('#connectButton');
	connectButton.addEventListener('click', handleConnect);

	disconnectButton = document.querySelector('#disconnectButton');
	disconnectButton.addEventListener('click', handleDisconnect);

	lobby = document.querySelector('#lobby');
	disable(lobby);

	getRoomButton = document.querySelector('#getRoomButton');
	getRoomButton.addEventListener('click', handleGetRoom);

	getRoomsButton = document.querySelector('#getRoomsButton');
	getRoomsButton.addEventListener('click', handleGetRooms);

	nameInput = document.querySelector('#nameInput');
	passwordInput = document.querySelector('#passwordInput');
	hiddenInput = document.querySelector('#hiddenInput');
	sizeInput = document.querySelector('#sizeInput');
	iconInput = document.querySelector('#iconInput');

	createRoomButton = document.querySelector('#createRoomButton');
	createRoomButton.addEventListener('click', handleCreateRoom);

	joinRoomButton = document.querySelector('#joinRoomButton');
	joinRoomButton.addEventListener('click', handleJoinRoom);

	leaveRoomButton = document.querySelector('#leaveRoomButton');
	leaveRoomButton.addEventListener('click', handleLeaveRoom);

	kickInput = document.querySelector('#kickInput');
	kickButton = document.querySelector('#kickButton');
	kickButton.addEventListener('click', handleKickButton);

	chat = document.querySelector('#chat');
	chat.value = '';
	chatInput = document.querySelector('#chatInput');
	chatInput.value = '';
	sendButton = document.querySelector('#sendButton');
	sendButton.addEventListener('click', handleSendButton);

	log = document.querySelector('#log');
	log.value = '';
}

function onClientDisconnected()
{
	tokenSelect.disabled = false;
	connectButton.disabled = false;
	disconnectButton.disabled = true;
	disable(lobby);
}

function onChatText( event )
{
	addText(event.data.username, event.data.text);
}

function onEvent( event )
{
	setLog(event);
}

function handleConnect()
{
	tokenSelect.disabled = true;
	connectButton.disabled = true;

	const token = tokenSelect.options[tokenSelect.selectedIndex].value;

	lobbyClient.connect(url, token)
		.then(() =>
		{
			disconnectButton.disabled = false;
			enable(lobby);
		})
		.catch(() =>
		{
			tokenSelect.disabled = false;
			connectButton.disabled = false;
		});
}

function handleDisconnect()
{
	disconnectButton.disabled = true;

	lobbyClient.disconnect()
		.then(() =>
		{
			tokenSelect.disabled = false;
			connectButton.disabled = false;
			disable(lobby);
		})
		.catch(() =>
		{
			disconnectButton.disabled = false;
		});
}

function handleGetRoom()
{
	lobbyClient.getRoom()
		.then((event) =>
		{
			setLog(event);
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleGetRooms()
{
	lobbyClient.getRooms()
		.then((event) =>
		{
			setLog(event);
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleCreateRoom()
{
	const name = nameInput.value;
	const password = passwordInput.value;
	const hidden = hiddenInput.checked;
	const size = sizeInput.value;
	const icon = iconInput.value;

	lobbyClient.createRoom(name, { password: password, hidden: hidden, size: size, icon: icon })
		.then((event) =>
		{
			setLog(event);
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleJoinRoom()
{
	const name = nameInput.value;
	const password = passwordInput.value;

	lobbyClient.joinRoom(name, { password: password })
		.then((event) =>
		{
			setLog(event);
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleLeaveRoom()
{
	lobbyClient.leaveRoom()
		.then((event) =>
		{
			setLog(event);
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleKickButton()
{
	const user = kickInput.value;
	kickInput.value = '';

	lobbyClient.kickUser(user)
		.then(() =>
		{
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function handleSendButton()
{
	const text = chatInput.value;
	chatInput.value = '';

	lobbyClient.sendText(text)
		.then(() =>
		{
		})
		.catch((error) =>
		{
			setLog(error);
		});
}

function addText( user, text )
{
	chat.value += user + ': ' + text + '\n';
}

function setLog( data )
{
	log.value = JSON.stringify(data, null, '\t');
}

function enable( element )
{
	element.disabled = false;

	for( let i = 0; i < element.children.length; i++ )
	{
		let child = element.children[i];
		enable(child);
	}
}

function disable( element )
{
	element.disabled = true;

	for( let i = 0; i < element.children.length; i++ )
	{
		let child = element.children[i];
		disable(child);
	}
}
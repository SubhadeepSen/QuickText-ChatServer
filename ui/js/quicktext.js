var userPhoneNumber = "";
var userName = "";
var socket = null;
var wsurl = "ws://127.0.0.1:8080/chatServer";
var prevSelectedFriendNode = null;
var selectedFriendPhoneNumber = "";
var currentEventTarget = null;
var phoneNumberToMessageList = new Map();
window.onload = function() {
    document.getElementById('chatWindowDiv').style.display = 'none';
    document.getElementById('messageAreaContainer').style.display = "none";
    document.getElementById('sendMessageDiv').style.display = "none"

    document.getElementById('connectButton').onclick = function(event) {
        if (!isValidConnetInputs()) {
            return;
        }
        socket = new WebSocket(wsurl);
        socket.onopen = initialize;
        socket.onmessage = onResponseReceived;
    }

    document.getElementById('friendList').onclick = function(event) {
        currentEventTarget = event.target;
        if (currentEventTarget.tagName === 'P') {
            selectedFriendPhoneNumber = currentEventTarget.getAttribute("id");
            if (prevSelectedFriendNode) {
                prevSelectedFriendNode.classList.remove('-selectedFriend');
            }
            prevSelectedFriendNode = currentEventTarget;
            currentEventTarget.classList.add('-selectedFriend');
            if (currentEventTarget.firstElementChild) {
                currentEventTarget.removeChild(currentEventTarget.firstElementChild)
            }
            if (document.getElementById('messageAreaContainer').style.display === "none") {
                document.getElementById('messageAreaContainer').style.display = "flex";
            }
            if (document.getElementById('sendMessageDiv').style.display === "none") {
                document.getElementById('sendMessageDiv').style.display = "flex";
            }
            if (phoneNumberToMessageList.size != 0) {
                let messageList = document.getElementById('messageList');
                if (null != messageList) {
                    document.getElementById('messageAreaContainer').removeChild(messageList);
                }
                if (phoneNumberToMessageList.get(selectedFriendPhoneNumber) != null) {
                    document.getElementById('messageAreaContainer').appendChild(phoneNumberToMessageList.get(selectedFriendPhoneNumber));
                }
            }
        }
    }

    document.getElementById('addContactButton').onclick = function(event) {
        let addContactInput = document.getElementById('addContactInput');
        let newContact = addContactInput.value;
        if (!socket || !newContact.match(/^\d{10}$/)) {
            return;
        }
        var payload = {};
        payload.operation = "addFriend";
        payload.senderPhoneNumber = userPhoneNumber;
        payload.recieverPhoneNumber = newContact;
        socket.send(JSON.stringify(payload));
        addContactInput.value = '';
    }

    document.getElementById('sendButton').onclick = function(event) {
        let messageInput = document.getElementById('messageInput');
        if (messageInput.value.length == 0) {
            return;
        }
        var payload = {};
        payload.operation = "send";
        payload.senderPhoneNumber = userPhoneNumber;
        payload.recieverPhoneNumber = selectedFriendPhoneNumber;
        payload.message = messageInput.value;
        socket.send(JSON.stringify(payload));
        messageInput.value = '';
        appendNewTextMessage(payload.recieverPhoneNumber, payload.message, payload.senderPhoneNumber)
    }
}

window.onbeforeunload = function() {
    var payload = {};
    payload.operation = "close";
    payload.senderPhoneNumber = userPhoneNumber;
    sock.send(JSON.stringify(payload));
    sock.close();
    return null;
}

function isValidConnetInputs() {
    let phoneNumberRegex = /^\d{10}$/;
    let usernameRegex = /[a-z A-Z]/g;
    let username = document.getElementById('usernameInput').value;
    let phoneNumber = document.getElementById('phoneNumberInput').value;
    if (!phoneNumber.match(phoneNumberRegex) || !username.match(usernameRegex)) {
        return false;
    }
    userName = username;
    userPhoneNumber = phoneNumber;
    return true;
}

function initialize(e) {
    let payload = {};
    payload.operation = "connect";
    payload.senderPhoneNumber = userPhoneNumber;
    socket.send(JSON.stringify(payload));
    document.getElementById('connectFormDiv').style.display = 'none';
    document.getElementById('chatWindowDiv').style.display = 'flex';
    document.getElementById('connectedUser').innerHTML = userName;
}

function onResponseReceived(responseEvent) {
    responsePayload = JSON.parse(responseEvent.data)
    console.log(responsePayload);
    let data = null;
    switch (responsePayload.operation) {
        case "connect":
            data = JSON.parse(responsePayload.data);
            let friendList = data.friendList;
            let cachedMessages = data.cachedMessages;
            let messages = data.messages;
            if (friendList) {
                friendList.forEach(frnd => {
                    addFriendNode(frnd);
                });
            }
            populatePhoneNumberToMessageList(messages, cachedMessages);
            break;
        case "addFriend":
            addFriendNode(responsePayload.data);
            break;
        case "received":
            data = JSON.parse(responsePayload.data);
            appendNewTextMessage(data.phoneNumber, data.message, null);
            break;
        case "error":
            data = JSON.parse(responsePayload.data);
            alert(data);
            break;
        default:
            break;
    }
}

function addFriendNode(phoneNumber) {
    let friendList = document.getElementById('friendList');
    let pNode = document.createElement("p");
    pNode.setAttribute('id', phoneNumber);
    pNode.appendChild(document.createTextNode(phoneNumber));
    friendList.appendChild(pNode);
}

function populatePhoneNumberToMessageList(messages, cachedMessages) {
    populateMessage(messages);
    populateMessage(cachedMessages);
}

function populateMessage(messages) {
    if (!messages) {
        return;
    }
    let messageList = null;
    messages.forEach(msg => {
        if (msg.to != userPhoneNumber && !phoneNumberToMessageList.get(msg.to)) {
            messageList = document.createElement("div");
            messageList.setAttribute('id', 'messageList');
            phoneNumberToMessageList.set(msg.to, messageList)
        }
        if (msg.from != userPhoneNumber && !phoneNumberToMessageList.get(msg.from)) {
            messageList = document.createElement("div");
            messageList.setAttribute('id', 'messageList');
            phoneNumberToMessageList.set(msg.from, messageList)
        }

        if (msg.from == userPhoneNumber) {
            phoneNumberToMessageList.get(msg.to).appendChild(getTextNode(null, msg.text, msg.from));
        } else if (msg.to == userPhoneNumber) {
            phoneNumberToMessageList.get(msg.from).appendChild(getTextNode(msg.from, msg.text, null));
        }
    });
}

function getTextNode(phoneNumber, textMessage, sender) {
    let pNode = document.createElement("p");
    let text = '';
    if (null != sender) {
        pNode.setAttribute('id', sender);
        text = sender + ' > ' + textMessage;
        pNode.setAttribute('class', 'sent');
    } else {
        text = textMessage + ' < ' + phoneNumber;
        pNode.setAttribute('class', 'received');
        pNode.setAttribute('id', phoneNumber);
    }
    pNode.appendChild(document.createTextNode(text));
    return pNode;
}

function appendNewTextMessage(phoneNumber, textMessage, sender) {
    let messageList = null;
    if (!phoneNumberToMessageList.get(phoneNumber)) {
        messageList = document.createElement("div");
        messageList.setAttribute('id', 'messageList');
        phoneNumberToMessageList.set(phoneNumber, messageList)
    }
    phoneNumberToMessageList.get(phoneNumber).appendChild(getTextNode(phoneNumber, textMessage, sender));
    messageList = document.getElementById('messageList');
    if (null == messageList) {
        messageList = document.createElement("div");
        messageList.setAttribute('id', 'messageList');
    }
    messageList.appendChild(getTextNode(phoneNumber, textMessage, sender));
    document.getElementById('messageAreaContainer').appendChild(messageList);
}
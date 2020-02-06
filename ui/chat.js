var sock = null;
var wsuri = "ws://127.0.0.1:8080/chatServer";
var selfPhnNo = null;
var responsePayload = {};
var selectedFriendPhnNo = "";
var prevSelectedFrndP = null;
var frndToMsgMap = new Map();

window.onload = function () {
    document.getElementById('messagingPanel').style.display = "none";
    document.getElementById('chatPanel').style.display = "none";
};

window.onbeforeunload = function(){
    console.log('unload');
    var payload = {};
    payload.operation = "close";
    payload.senderPhoneNumber = selfPhnNo;
    sock.send(JSON.stringify(payload));
    sock.close();
    return null;
}

function connect() {
    selfPhnNo = document.getElementById('selfPhnNo').value;
    sock = new WebSocket(wsuri);
    var payload = {};
    payload.operation = "connect";
    payload.senderPhoneNumber = selfPhnNo;
    sock.onopen = function () {
        sock.send(JSON.stringify(payload));
        sock.onmessage = onResponseReceived;
        document.getElementById('connectPanel').style.display = "none";
        document.getElementById('chatPanel').style.display = "inline";
        document.getElementById('connectedAs').innerHTML = selfPhnNo;
        document.getElementById('friendListDiv').addEventListener('click', function (e) {
            if (e.target.tagName === 'P' && e.target.className === 'friend') {
                if (document.getElementById('messagingPanel').style.display === "none") {
                    document.getElementById('messagingPanel').style.display = "inline";
                }
                selectedFriendPhnNo = e.target.innerHTML;
                if (null != prevSelectedFrndP) {
                    prevSelectedFrndP.classList.remove('selectedFriend');
                }
                prevSelectedFrndP = e.target;
                e.target.classList.add('selectedFriend');
                if (frndToMsgMap.size != 0) {
                    let messageContent = document.getElementById('messageContent');
                    if (null != messageContent) {
                        document.getElementById('messageContainer').removeChild(messageContent);
                    }
                    document.getElementById('messageContainer').appendChild(frndToMsgMap.get(selectedFriendPhnNo));
                }
            }
        }, false);
    }
}

function add() {
    if (!sock) return;
    var payload = {};
    let frndPhnNo = document.getElementById('frndPhnNo').value;
    payload.operation = "addFriend";
    payload.senderPhoneNumber = selfPhnNo;
    payload.recieverPhoneNumber = frndPhnNo;
    sock.send(JSON.stringify(payload));
    document.getElementById('frndPhnNo').value = '';
}

function sendMessage() {
    let messageInput = document.getElementById('message');
    var payload = {};
    payload.operation = "send";
    payload.senderPhoneNumber = selfPhnNo;
    payload.recieverPhoneNumber = selectedFriendPhnNo;
    payload.message = messageInput.value;
    sock.send(JSON.stringify(payload));
    messageInput.value = '';
    appendNewTextMessage(payload.recieverPhoneNumber, payload.message, payload.senderPhoneNumber)
};

function onResponseReceived(e) {
    responsePayload = JSON.parse(e.data)
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
            populateFrndToMsgMap(messages, cachedMessages);
            break;
        case "addFriend":
            addFriendNode(responsePayload.data);
            break;
        case "received":
            data = JSON.parse(responsePayload.data);
            appendNewTextMessage(data.phoneNumber, data.message, null);
            break;
        default:
            break;
    }
}

function addFriendNode(frndPhnNo) {
    let friendListDiv = document.getElementById('friendListDiv');
    let pNode = document.createElement("p");
    pNode.setAttribute('class', 'friend');
    pNode.appendChild(document.createTextNode(frndPhnNo));
    friendListDiv.appendChild(pNode);
}

function populateFrndToMsgMap(messages, cachedMessages) {
    populate(messages);
    populate(cachedMessages);
}

function populate(messages) {
    if (!messages) {
        return;
    }
    let messageContentNode = null;
    messages.forEach(msg => {
        if (!frndToMsgMap.get(msg.to)) {
            messageContentNode = document.createElement("div");
            messageContentNode.setAttribute('id', 'messageContent');
            frndToMsgMap.set(msg.to, messageContentNode)
        }
        console.log(msg.from +' - '+ msg.text);
        if(msg.from == selectedFriendPhnNo){
            frndToMsgMap.get(msg.to).appendChild(getTextNode(msg.from, msg.text, null));
            console.log('if');
        }else{
            frndToMsgMap.get(msg.to).appendChild(getTextNode(msg.to, msg.text, null));
            console.log('else');
        }
    });
}

function getTextNode(phnNo, textMessage, sender) {
    let pNode = document.createElement("p");
    let text = '';
    if(null != sender){
        text = sender + ' > ' + textMessage;
    }else{
        text = phnNo + ' > ' + textMessage;
    }
    pNode.appendChild(document.createTextNode(text));
    return pNode;
}

function appendNewTextMessage(phnNo, textMessage, sender) {
    if (!frndToMsgMap.get(phnNo)) {
        messageContentNode = document.createElement("div");
        messageContentNode.setAttribute('id', 'messageContent');
        frndToMsgMap.set(phnNo, messageContentNode)
    }
    frndToMsgMap.get(phnNo).appendChild(getTextNode(phnNo, textMessage, sender));
    messageContentNode = document.getElementById('messageContent');
    if (null == messageContentNode) {
        messageContentNode = document.createElement("div");
        messageContentNode.setAttribute('id', 'messageContent');
    }
    messageContentNode.appendChild(getTextNode(phnNo, textMessage, sender));
    document.getElementById('messageContainer').appendChild(messageContentNode);
}
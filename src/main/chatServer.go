package main

import (
	"communicationService"
	"connectionCacheService"
	"encoding/json"
	"fmt"
	"friendListService"
	"log"
	"messageCacheService"
	"messageDatabaseService"

	"golang.org/x/net/websocket"
	"model"
	"net/http"
)

type Payload struct {
	Operation           string `json:"operation"`
	SenderPhoneNumber   string `json:"senderPhoneNumber"`
	RecieverPhoneNumber string `json:"recieverPhoneNumber"`
	Message             string `json:"message"`
}

type ConnectionResponse struct {
	FriendList     []string             `json:"friendList"`
	CachedMessages []model.Conversation `json:"cachedMessages"`
	Messages       []model.Conversation `json:"messages"`
}

func operationHandler(ws *websocket.Conn) {
	var err error
	for {
		var payloadString string

		// recieve the incoming payload
		if err = websocket.Message.Receive(ws, &payloadString); err != nil {
			fmt.Println("Can't receive payload!", err)
			break
		}

		// Unmarshal payload string to payload object
		var payload Payload
		err = json.Unmarshal([]byte(payloadString), &payload)
		if err != nil {
			fmt.Println("unable to unmarshal", err)
			break
		}

		switch payload.Operation {
		case "connect":
			connectionCacheService.AddConnectionToCache(payload.SenderPhoneNumber, ws)
			friendList := friendListService.ListFriends(payload.SenderPhoneNumber)
			cachedMessage := messageCacheService.ListMessages(payload.SenderPhoneNumber)
			messages := messageDatabaseService.ListConversations(payload.SenderPhoneNumber)
			response := ConnectionResponse{friendList, cachedMessage, messages}
			responseData, _ := json.Marshal(response)
			responsePayload, _ := json.Marshal(model.ResponsePayload{"connect", string(responseData)})
			websocket.Message.Send(ws, string(responsePayload))
		case "addFriend":
			response := friendListService.AddFriend(payload.SenderPhoneNumber, payload.RecieverPhoneNumber)
			responsePayload, _ := json.Marshal(model.ResponsePayload{"addFriend", response})
			websocket.Message.Send(ws, string(responsePayload))
		case "listMessages":
			response := messageDatabaseService.ListConversations(payload.SenderPhoneNumber)
			responseData, _ := json.Marshal(response)
			responsePayload, _ := json.Marshal(model.ResponsePayload{"listMessages", string(responseData)})
			websocket.Message.Send(ws, string(responsePayload))
		case "listMessageByContactNo":
			response := messageDatabaseService.ListConversationByContactNo(payload.SenderPhoneNumber, payload.RecieverPhoneNumber)
			responseData, _ := json.Marshal(response)
			responsePayload, _ := json.Marshal(model.ResponsePayload{"listMessageByContactNo", string(responseData)})
			websocket.Message.Send(ws, string(responsePayload))
		case "send":
			communicationService.SendMessage(payload.SenderPhoneNumber, payload.RecieverPhoneNumber, payload.Message)
		default:
			websocket.Message.Send(ws, "Unsupported operation...")
		}
	}
}

func main() {
	connectionCacheService.InitCache()
	friendListService.InitFriendList()
	messageCacheService.InitMessageCache()
	messageDatabaseService.InitMessageDatabase()

	http.Handle("/", http.FileServer(http.Dir("./ui")))
	http.Handle("/chatServer", websocket.Handler(operationHandler))

	fmt.Println("chat server started...")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

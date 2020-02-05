package communicationService

import (
	"connectionCacheService"
	"encoding/json"
	"golang.org/x/net/websocket"
	"log"
	"messageCacheService"
	"messageDatabaseService"
	"model"
)

type TextMessage struct {
	PhoneNumber string `json:"phoneNumber"`
	Message     string `json:"message"`
}

func SendMessage(selfPhnNo string, frndPhnNo string, message string) bool {
	var err error
	conn := connectionCacheService.GetConnection(frndPhnNo)
	if conn == nil {
		log.Println("Reciever not connected!")
		messageCacheService.AddMessageToCache(selfPhnNo, frndPhnNo, message)
		return false
	}

	responseData, _ := json.Marshal(TextMessage{selfPhnNo, message})
	responsePayload, _ := json.Marshal(model.ResponsePayload{"received", string(responseData)})

	if err = websocket.Message.Send(conn, string(responsePayload)); err != nil {
		log.Println("Can't send!", err)
		messageCacheService.AddMessageToCache(selfPhnNo, frndPhnNo, message)
		return false
	}

	messageDatabaseService.AddMessage(selfPhnNo, frndPhnNo, message)
	return true
}

package messageCacheService

import (
	"log"
	"messageDatabaseService"
	"model"
	"time"
)

var messageCache map[string][]model.Conversation

func InitMessageCache() {
	if messageCache == nil {
		messageCache = make(map[string][]model.Conversation)
		log.Println("Initializing message cache....")
	}
}

func AddMessageToCache(from string, to string, text string) {
	if messageCache != nil {
		messageCache[to] = append(messageCache[to], model.Conversation{from, to, time.Now().String(), text})
	}
}

func ListMessages(selfPhnNo string) []model.Conversation {
	if messageCache != nil {
		conversations := messageCache[selfPhnNo]
		for i := 0; i < len(conversations); i++ {
			messageDatabaseService.AddMessage(conversations[i].From, conversations[i].To, conversations[i].Text)
		}
		return conversations
	}
	return nil
}

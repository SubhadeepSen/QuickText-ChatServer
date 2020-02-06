package messageDatabaseService

import (
	"log"
	"model"
	"time"
)

var messageDatabase map[string][]model.Conversation

func InitMessageDatabase() {
	if messageDatabase == nil {
		messageDatabase = make(map[string][]model.Conversation)
		log.Println("Initializing messageDatabase....")
	}
}

func AddMessage(from string, to string, text string) {
	timeFormat := "Mon, Jan 2, 2006 at 3:04:00.00000pm"
	if messageDatabase != nil {
		currTime := time.Now().Format(timeFormat)
		messageDatabase[from] = append(messageDatabase[from], model.Conversation{to, from, currTime, text})
		messageDatabase[to] = append(messageDatabase[to], model.Conversation{to, from, currTime, text})
	}
}

func ListConversations(selfPhnNo string) []model.Conversation {
	if messageDatabase != nil {
		return messageDatabase[selfPhnNo]
	}
	return nil
}

func ListConversationByContactNo(selfPhnNo string, frndPhnNo string) []model.Conversation {
	conversations := messageDatabase[selfPhnNo]
	list := make([]model.Conversation, len(conversations))
	if messageDatabase != nil {
		for i := 0; i < len(conversations); i++ {
			if isValidConversation(conversations[i], selfPhnNo, frndPhnNo) {
				list = append(list, conversations[i])
			}
		}
	}
	return list
}

func isValidConversation(conversation model.Conversation, from string, to string) bool {
	if (conversation.From == from && conversation.To == to) || (conversation.From == to && conversation.To == from) {
		return true
	}
	return false
}

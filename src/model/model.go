package model

import ()

type Message struct {
	FriendPhoneNumber string `json:"friendPhoneNumber"`
	DateTime          string `json:"dateTime"`
	Message           string `json:"message"`
}

type ResponsePayload struct {
	Operation string `json:"operation"`
	Data      string `json:"data"`
}

type Conversation struct {
	To       string `json:"to"`
	From     string `json:"from"`
	DateTime string `json:"dateTime"`
	Text     string `json:"text"`
}

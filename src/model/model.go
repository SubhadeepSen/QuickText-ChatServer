package model

import ()

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

type User struct {
	Name        string `json:"name"`
	PhoneNumber string `json:"phoneNumber"`
}

type Payload struct {
	Operation string `json:"operation"`
	From      string `json:"from"`
	To        string `json:"to"`
	Message   string `json:"message"`
	Username  string `json:"username"`
}

type ConnectionResponse struct {
	Username       string         `json:"username"`
	FriendList     []User         `json:"friendList"`
	CachedMessages []Conversation `json:"cachedMessages"`
	Messages       []Conversation `json:"messages"`
}

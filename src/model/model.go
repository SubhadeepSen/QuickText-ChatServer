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

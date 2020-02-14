package userDatabaseService

import (
	"log"
	"model"
)

var users map[string]model.User

func InitUsers() {
	if users == nil {
		users = make(map[string]model.User)
		log.Println("Initializing users....")
	}
}

func AddNewUser(name string, phoneNumber string) string {
	if users != nil {
		user, isPresent := users[phoneNumber]
		if !isPresent {
			users[phoneNumber] = model.User{name, phoneNumber}
			return name
		} else {
			return user.Name
		}
	}
	return string("")
}

func GetUser(phoneNumber string) model.User {
	return users[phoneNumber]
}

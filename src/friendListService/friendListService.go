package friendListService

import (
	"log"
	"model"
	"userDatabaseService"
)

var friendList map[string][]model.User

func InitFriendList() {
	if friendList == nil {
		friendList = make(map[string][]model.User)
		log.Println("Initializing friendList....")
	}
}

func AddFriend(selfPhnNo string, frndPhnNo string) model.User {
	if friendList != nil {
		user := userDatabaseService.GetUser(frndPhnNo)
		newFriend := model.User{user.Name, frndPhnNo}
		friendList[selfPhnNo] = append(friendList[selfPhnNo], newFriend)
		log.Println(frndPhnNo, "added to list.")
		return newFriend
	}
	return model.User{}
}

func ListFriends(selfPhnNo string) []model.User {
	if friendList != nil {
		for _, friend := range friendList[selfPhnNo] {
			if friend.Name == "" {
				log.Println("updating name", friend.PhoneNumber)
				friend.Name = userDatabaseService.GetUser(friend.PhoneNumber).Name
			}
		}
		return friendList[selfPhnNo]
	}
	return nil
}

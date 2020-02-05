package friendListService

import (
	"log"
)

var friendList map[string][]string

func InitFriendList() {
	if friendList == nil {
		friendList = make(map[string][]string)
		log.Println("Initializing friendList....")
	}
}

func AddFriend(selfPhnNo string, frndPhnNo string) string {
	if friendList != nil {
		friendList[selfPhnNo] = append(friendList[selfPhnNo], frndPhnNo)
		log.Println(frndPhnNo, "added to list.")
		return frndPhnNo
	}
	return string("")
}

func ListFriends(selfPhnNo string) []string {
	if friendList != nil {
		return friendList[selfPhnNo]
	}
	return nil
}

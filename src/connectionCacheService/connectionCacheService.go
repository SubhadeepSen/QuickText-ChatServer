package connectionCacheService

import (
	"golang.org/x/net/websocket"
	"log"
)

var connectionCache map[string]*websocket.Conn

func InitCache() {
	if connectionCache == nil {
		connectionCache = make(map[string]*websocket.Conn)
		log.Println("Initializing connection cache....")
	}
}

func AddConnectionToCache(phoneNumber string, conn *websocket.Conn) {
	if connectionCache[phoneNumber] == nil {
		connectionCache[phoneNumber] = conn
		log.Println(phoneNumber, "connected!")
	}
}

func GetConnection(phoneNumber string) *websocket.Conn {
	if connectionCache[phoneNumber] == nil {
		log.Println(phoneNumber, "not connected!")
		return nil
	}
	return connectionCache[phoneNumber]
}

func RemoveConnection(phoneNumber string) {
	connectionCache[phoneNumber] = nil
}

"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react"
import { getDatabase, ref, push, set, onValue, update, remove, get } from "firebase/database"
import { useAuth } from "./auth-context"

interface Message {
  id: string
  text: string
  senderUid: string
  receiverUid: string
  timestamp: number
  status: string
  sender: "user" | "contact"
  isTemp?: boolean
  fileUrl?: string
  fileType?: string
  fileName?: string
  replyToId?: string
  replyToText?: string
  read?: boolean
  reactions?: { [emoji: string]: { users: string[]; userNames: { [uid: string]: string } } }
  isDeleted?: boolean
  deletedAt?: number
  deletedBy?: string
  originalText?: string
  originalFileUrl?: string
  originalFileType?: string
  originalFileName?: string
}

interface Contact {
  id: string
  name: string
  profilePic: string
  lastMessage: string
  time: string
  unread: number
}

interface ChatContextType {
  selectedContact: Contact | null
  setSelectedContact: (contact: Contact | null) => void
  messages: { [contactId: string]: Message[] }
  sendMessage: (
    text: string,
    replyToId?: string,
    fileUrl?: string,
    fileType?: string,
    fileName?: string,
  ) => Promise<void>
  addReaction: (messageId: string, emoji: string, contactId: string) => Promise<void>
  deleteMessage: (messageId: string, contactId: string) => Promise<void>
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  error: string | null
  setError: (error: string | null) => void
  pendingMessages: Message[]
  setPendingMessages: React.Dispatch<React.SetStateAction<Message[]>>
  typingUsers: { [contactId: string]: boolean }
  setTyping: (contactId: string, isTyping: boolean) => void
  startTyping: (contactId: string) => void
  stopTyping: (contactId: string) => void
  setMessages: React.Dispatch<React.SetStateAction<{ [contactId: string]: Message[] }>>
  loadMoreMessages: (contactId: string) => Promise<void>
  isLoadingMore: { [contactId: string]: boolean }
  hasMoreMessages: { [contactId: string]: boolean }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<{ [contactId: string]: Message[] }>({})
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<{ [contactId: string]: boolean }>({})
  const lastMessageTimestampRef = useRef<{ [contactId: string]: number }>({})
  const [isLoadingMore, setIsLoadingMore] = useState<{ [contactId: string]: boolean }>({})
  const [hasMoreMessages, setHasMoreMessages] = useState<{ [contactId: string]: boolean }>({})
  const oldestMessageTimestampRef = useRef<{ [contactId: string]: number }>({})

  const database = getDatabase()
  const typingTimeoutRef = useRef<{ [contactId: string]: NodeJS.Timeout }>({})

  const getChatId = (uid1: string, uid2: string): string => {
    return uid1 > uid2 ? `${uid1}-${uid2}` : `${uid2}-${uid1}`
  }

  useEffect(() => {
    if (!currentUser) return

    const typingRef = ref(database, `typing`)
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (!snapshot.exists()) {
        setTypingUsers({})
        return
      }

      const typingData = snapshot.val()
      const newTypingUsers: { [contactId: string]: boolean } = {}

      Object.keys(typingData).forEach((chatId) => {
        const chatTyping = typingData[chatId]
        if (chatTyping) {
          Object.keys(chatTyping).forEach((userId) => {
            if (userId !== currentUser.uid && chatTyping[userId]) {
              const contact = contacts.find((c) => c.id === userId)
              if (contact) {
                newTypingUsers[contact.id] = true
              }
            }
          })
        }
      })

      setTypingUsers(newTypingUsers)
    })

    return () => unsubscribe()
  }, [currentUser, database, contacts])

  const setTyping = useCallback(
    (contactId: string, isTyping: boolean) => {
      if (!currentUser) return

      const chatId = getChatId(currentUser.uid, contactId)
      const typingRef = ref(database, `typing/${chatId}/${currentUser.uid}`)

      if (isTyping) {
        set(typingRef, true)
      } else {
        remove(typingRef)
      }
    },
    [currentUser, database],
  )

  const startTyping = useCallback(
    (contactId: string) => {
      setTyping(contactId, true)

      if (typingTimeoutRef.current[contactId]) {
        clearTimeout(typingTimeoutRef.current[contactId])
      }

      typingTimeoutRef.current[contactId] = setTimeout(() => {
        setTyping(contactId, false)
        delete typingTimeoutRef.current[contactId]
      }, 3000)
    },
    [setTyping],
  )

  const stopTyping = useCallback(
    (contactId: string) => {
      setTyping(contactId, false)

      if (typingTimeoutRef.current[contactId]) {
        clearTimeout(typingTimeoutRef.current[contactId])
        delete typingTimeoutRef.current[contactId]
      }
    },
    [setTyping],
  )

  useEffect(() => {
    if (!currentUser || !selectedContact) return

    const chatId = getChatId(currentUser.uid, selectedContact.id)
    const messagesRef = ref(database, `messages/${chatId}`)

    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setMessages((prev) => ({ ...prev, [selectedContact.id]: [] }))
        setHasMoreMessages((prev) => ({ ...prev, [selectedContact.id]: false }))
        return
      }

      try {
        const messagesData = snapshot.val()
        let messagesList = Object.keys(messagesData).map((key) => {
          const msgData = messagesData[key]
          return {
            id: key,
            ...msgData,
            sender: msgData.senderUid === currentUser.uid ? "user" : "contact",
            timestamp: typeof msgData.timestamp === "number" ? msgData.timestamp : msgData.clientTimestamp || 0,
            reactions: msgData.reactions || {},
            isDeleted: msgData.isDeleted || false,
          }
        })

        messagesList.sort((a, b) => a.timestamp - b.timestamp)

        const INITIAL_LOAD_COUNT = 50
        const totalMessages = messagesList.length
        const hasMore = totalMessages > INITIAL_LOAD_COUNT

        if (hasMore) {
          const oldestMessage = messagesList[0]
          oldestMessageTimestampRef.current[selectedContact.id] = oldestMessage.timestamp
          messagesList = messagesList.slice(-INITIAL_LOAD_COUNT)
        }

        setMessages((prev) => ({ ...prev, [selectedContact.id]: messagesList }))
        setHasMoreMessages((prev) => ({ ...prev, [selectedContact.id]: hasMore }))

        const unreadMessages = messagesList.filter((msg) => msg.senderUid !== currentUser.uid && !msg.read)

        if (unreadMessages.length > 0) {
          const updates: { [key: string]: any } = {}
          unreadMessages.forEach((msg) => {
            updates[`messages/${chatId}/${msg.id}/read`] = true
            updates[`messages/${chatId}/${msg.id}/readAt`] = Date.now()
          })

          await update(ref(database), updates)

          const contactRef = ref(database, `contacts/${currentUser.uid}/${selectedContact.id}`)
          await update(contactRef, { unread: 0 })
        }

        const senderMessages = messagesList.filter((msg) => msg.senderUid !== currentUser.uid && msg.status === "sent")
        if (senderMessages.length > 0) {
          const deliveryUpdates: { [key: string]: any } = {}
          senderMessages.forEach((msg) => {
            deliveryUpdates[`messages/${chatId}/${msg.id}/status`] = "delivered"
          })
          await update(ref(database), deliveryUpdates)
        }
      } catch (err) {
        console.error("Error loading messages:", err)
        setError("Failed to load messages")
      }
    })

    return () => unsubscribe()
  }, [currentUser, selectedContact, database])

  const loadMoreMessages = useCallback(
    async (contactId: string): Promise<void> => {
      if (!currentUser || isLoadingMore[contactId]) return

      setIsLoadingMore((prev) => ({ ...prev, [contactId]: true }))

      try {
        const chatId = getChatId(currentUser.uid, contactId)
        const messagesRef = ref(database, `messages/${chatId}`)
        const snapshot = await get(messagesRef)

        if (!snapshot.exists()) {
          setIsLoadingMore((prev) => ({ ...prev, [contactId]: false }))
          return
        }

        const messagesData = snapshot.val()
        const allMessages = Object.keys(messagesData).map((key) => {
          const msgData = messagesData[key]
          return {
            id: key,
            ...msgData,
            sender: msgData.senderUid === currentUser.uid ? "user" : "contact",
            timestamp: typeof msgData.timestamp === "number" ? msgData.timestamp : msgData.clientTimestamp || 0,
            reactions: msgData.reactions || {},
            isDeleted: msgData.isDeleted || false,
          }
        })

        allMessages.sort((a, b) => a.timestamp - b.timestamp)

        const oldestTimestamp = oldestMessageTimestampRef.current[contactId] || Date.now()
        const LOAD_BATCH_SIZE = 30

        const olderMessages = allMessages.filter((m) => m.timestamp < oldestTimestamp)

        if (olderMessages.length > 0) {
          const newBatch = olderMessages.slice(-LOAD_BATCH_SIZE)
          const newOldestTimestamp = newBatch[0].timestamp

          oldestMessageTimestampRef.current[contactId] = newOldestTimestamp

          setMessages((prev) => ({
            ...prev,
            [contactId]: [...newBatch, ...(prev[contactId] || [])],
          }))

          const hasMore = olderMessages.length > LOAD_BATCH_SIZE
          setHasMoreMessages((prev) => ({ ...prev, [contactId]: hasMore }))
        } else {
          setHasMoreMessages((prev) => ({ ...prev, [contactId]: false }))
        }
      } catch (error) {
        console.error("Failed to load more messages:", error)
        setError("Failed to load more messages")
      } finally {
        setIsLoadingMore((prev) => ({ ...prev, [contactId]: false }))
      }
    },
    [currentUser, database],
  )

  const sendMessage = useCallback(
    async (text: string, replyToId?: string, fileUrl?: string, fileType?: string, fileName?: string): Promise<void> => {
      if (!currentUser || !selectedContact) return

      const chatId = getChatId(currentUser.uid, selectedContact.id)
      const messagesRef = ref(database, `messages/${chatId}`)
      const newMessageRef = push(messagesRef)

      try {
        const message = {
          text,
          senderUid: currentUser.uid,
          receiverUid: selectedContact.id,
          timestamp: {
            ".sv": "timestamp",
          },
          clientTimestamp: Date.now(),
          status: "sent",
          fileUrl: fileUrl || null,
          fileType: fileType || null,
          fileName: fileName || null,
          replyToId: replyToId || null,
          replyToText: replyToId ? messages[selectedContact.id]?.find((m) => m.id === replyToId)?.text || null : null,
          reactions: {},
          read: false,
        }

        await set(newMessageRef, message)

        const deliveryRef = ref(database, `messageDelivery/${chatId}/${newMessageRef.key}`)

        const deliveryListener = onValue(deliveryRef, (snapshot) => {
          if (snapshot.exists() && snapshot.val().delivered) {
            const messageRef = ref(database, `messages/${chatId}/${newMessageRef.key}`)
            update(messageRef, { status: "delivered" })
          }
        })

        setTimeout(() => deliveryListener(), 30000)

        const messageText = text || (fileName ? `📎 ${fileName}` : "File")
        const timestamp = Date.now()

        const senderContactRef = ref(database, `contacts/${currentUser.uid}/${selectedContact.id}`)
        await update(senderContactRef, {
          lastMessage: messageText,
          timestamp,
        })

        const receiverContactRef = ref(database, `contacts/${selectedContact.id}/${currentUser.uid}`)
        const receiverContactSnapshot = await get(receiverContactRef)
        const currentUnread = receiverContactSnapshot.exists() ? receiverContactSnapshot.val().unread || 0 : 0

        await update(receiverContactRef, {
          lastMessage: messageText,
          timestamp,
          unread: currentUnread + 1,
        })
      } catch (error) {
        console.error("Failed to send message:", error)
        setError("Failed to send message")
        throw error
      }
    },
    [currentUser, selectedContact, database, messages],
  )

  const addReaction = useCallback(
    async (messageId: string, emoji: string, contactId: string): Promise<void> => {
      if (!currentUser) return

      try {
        const chatId = getChatId(currentUser.uid, contactId)
        const messageRef = ref(database, `messages/${chatId}/${messageId}`)
        const messageSnapshot = await get(messageRef)

        if (!messageSnapshot.exists()) return

        const messageData = messageSnapshot.val()
        const reactions = messageData.reactions || {}

        if (!reactions[emoji]) {
          reactions[emoji] = {
            users: [],
            userNames: {},
          }
        }

        const userIndex = reactions[emoji].users.indexOf(currentUser.uid)

        if (userIndex > -1) {
          reactions[emoji].users.splice(userIndex, 1)
          delete reactions[emoji].userNames[currentUser.uid]

          if (reactions[emoji].users.length === 0) {
            delete reactions[emoji]
          }
        } else {
          reactions[emoji].users.push(currentUser.uid)
          reactions[emoji].userNames[currentUser.uid] = userProfile?.name || "Unknown"
        }

        await update(messageRef, { reactions })
      } catch (error) {
        console.error("Failed to add reaction:", error)
        setError("Failed to add reaction")
      }
    },
    [currentUser, database, userProfile],
  )

  const deleteMessage = useCallback(
    async (messageId: string, contactId: string): Promise<void> => {
      if (!currentUser) return

      try {
        const chatId = getChatId(currentUser.uid, contactId)
        const messageRef = ref(database, `messages/${chatId}/${messageId}`)

        const messageSnapshot = await get(messageRef)
        if (!messageSnapshot.exists()) return

        const messageData = messageSnapshot.val()

        await update(messageRef, {
          text: "",
          fileUrl: "",
          fileType: "",
          fileName: "",
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: currentUser.uid,
          originalText: messageData.text || "",
          originalFileUrl: messageData.fileUrl || "",
          originalFileType: messageData.fileType || "",
          originalFileName: messageData.fileName || "",
        })
      } catch (error) {
        console.error("Failed to delete message:", error)
        setError("Failed to delete message")
      }
    },
    [currentUser, database],
  )

  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
    }
  }, [])

  const value: ChatContextType = {
    selectedContact,
    setSelectedContact,
    messages,
    sendMessage,
    addReaction,
    deleteMessage,
    contacts,
    setContacts,
    error,
    setError,
    pendingMessages,
    setPendingMessages,
    typingUsers,
    setTyping,
    startTyping,
    stopTyping,
    setMessages,
    loadMoreMessages,
    isLoadingMore,
    hasMoreMessages,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

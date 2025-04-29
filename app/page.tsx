"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"
import WebForm from "@/components/web-form"

interface Message {
  from: "user" | "ai"
  id: string
  message: string
  extra?: {
    showWebform: boolean
  }
}

interface Session {
  threadId: string
  exp: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/tailbot")
        const data = await response.json()

        if (data.status === 200) {
          setMessages(data.data.chat)
          setSession(data.data.session)
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initChat()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || !session) return

    // Add user message to UI immediately
    const userMessage: Message = {
      from: "user",
      id: String(messages.length + 1),
      message: message,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/tailbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: session.threadId,
          message: message,
        }),
      })

      const data = await response.json()

      if (data.status === 200) {
        setMessages((prev) => [...prev, ...data.data.chat])
        setSession(data.data.session)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitWebform = async (formData: {
    name: string
    phone_number: string
    email: string
  }) => {
    if (!session) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/tailbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: session.threadId,
          message: "Here are my details!",
          extra: {
            webformPayload: formData,
          },
        }),
      })

      const data = await response.json()

      if (data.status === 200) {
        // Add a user message showing form submission
        const userMessage: Message = {
          from: "user",
          id: String(messages.length + 1),
          message: `Here are my details!\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone_number}`,
        }

        setMessages((prev) => [...prev, userMessage, ...data.data.chat])
        setSession(data.data.session)
      }
    } catch (error) {
      console.error("Failed to submit form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="bg-primary p-4 text-white font-bold rounded-t-lg">TailBot Chat</div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.from === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.message}</div>

                {/* Show webform if needed */}
                {msg.from === "ai" && msg.extra?.showWebform && (
                  <div className="mt-4">
                    <WebForm onSubmit={handleSubmitWebform} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(inputMessage)
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => sendMessage(inputMessage)} disabled={isLoading || !inputMessage.trim()} size="icon">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}

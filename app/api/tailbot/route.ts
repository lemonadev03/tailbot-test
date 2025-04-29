import { type NextRequest, NextResponse } from "next/server"

// Mock data for initial chat
const initialChat = {
  chat: [
    {
      from: "ai",
      id: "1",
      message: "Hi! I'm TailBot, check me out! Trust me, I'm cooooool 😎",
      extra: { showWebform: false },
    },
  ],
  session: {
    threadId: "thread_" + Math.random().toString(36).substring(2, 15),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  },
}

// Store chat history in memory (for demo purposes)
const chatHistory: Record<string, any[]> = {}

export async function GET(request: NextRequest) {
  // Get threadId from query params
  const url = new URL(request.url)
  const threadId = url.searchParams.get("threadId")

  if (!threadId) {
    // Create a new thread
    const newThreadId = "thread_" + Math.random().toString(36).substring(2, 15)
    chatHistory[newThreadId] = [...initialChat.chat]

    return NextResponse.json({
      message: "New AI thread created",
      status: 200,
      data: {
        chat: initialChat.chat,
        session: {
          threadId: newThreadId,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
      },
    })
  } else {
    // Return existing chat history
    return NextResponse.json({
      message: "Fetched chat history",
      status: 200,
      data: {
        chat: chatHistory[threadId] || [],
        session: {
          threadId,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
      },
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { threadId, message, extra } = body

  // Add user message to chat history
  if (!chatHistory[threadId]) {
    chatHistory[threadId] = []
  }

  chatHistory[threadId].push({
    from: "user",
    id: String(chatHistory[threadId].length + 1),
    message,
  })

  // Check if this is a webform submission
  if (extra?.webformPayload) {
    // Process webform data (in a real app, you'd save this to a database)
    console.log("Webform submitted:", extra.webformPayload)

    // Add AI response
    const aiResponse = {
      from: "ai",
      id: String(chatHistory[threadId].length + 1),
      message: "Thank you for your details! Our team will contact you shortly.",
      extra: { showWebform: false },
    }

    chatHistory[threadId].push(aiResponse)

    return NextResponse.json({
      message: "Form submitted successfully",
      status: 200,
      data: {
        chat: [aiResponse],
        session: {
          threadId,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
      },
    })
  }

  // Determine if we should show the webform based on keywords in the message
  // In a real app, this would use the detect_sign_up_intent function from your API
  const showWebform =
    message.toLowerCase().includes("sign") ||
    message.toLowerCase().includes("book") ||
    message.toLowerCase().includes("demo") ||
    message.toLowerCase().includes("register") ||
    message.toLowerCase().includes("interested")

  // Generate AI response
  const aiResponse = {
    from: "ai",
    id: String(chatHistory[threadId].length + 1),
    message: showWebform
      ? "I'd be happy to help you sign up! Please fill out this form with your details:"
      : "Thanks for your message! How else can I assist you today?",
    extra: { showWebform },
  }

  chatHistory[threadId].push(aiResponse)

  return NextResponse.json({
    message: "Message generated successfully",
    status: 200,
    data: {
      chat: [aiResponse],
      session: {
        threadId,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
    },
  })
}

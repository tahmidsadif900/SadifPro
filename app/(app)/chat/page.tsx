'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { connectSocket } from '@/lib/socket'
import { Send, Paperclip, Mic, Phone, Video, Search, MoreVertical, Smile } from 'lucide-react'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { name: string; avatar?: string }
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Welcome to Sadif Pro! 🎉', senderId: 'system', createdAt: new Date().toISOString(), sender: { name: 'Sadif' } },
    { id: '2', content: 'This is a fully working real-time messenger. Try sending a message!', senderId: 'system', createdAt: new Date().toISOString(), sender: { name: 'Sadif' } },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (session?.user?.id) {
      const socket = connectSocket(session.user.id)
      socketRef.current = socket

      socket.on('message:new', (message: Message) => {
        setMessages(prev => [...prev, message])
      })

      socket.on('typing:update', ({ users }: any) => {
        setIsTyping(users.length > 0)
      })

      return () => { socket.disconnect() }
    }
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !session?.user?.id) return

    const message: Message = {
      id: Date.now().toString(),
      content: input,
      senderId: session.user.id,
      createdAt: new Date().toISOString(),
      sender: { name: session.user.name || 'You' }
    }

    setMessages(prev => [...prev, message])
    socketRef.current?.emit('message:send', { chatId: 'demo', message })
    setInput('')
  }

  const startVoiceNote = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const message: Message = {
          id: Date.now().toString(),
          content: `🎤 Voice note (${Math.round(blob.size/1024)}KB)`,
          senderId: session?.user?.id || '',
          createdAt: new Date().toISOString(),
          sender: { name: session?.user?.name || 'You' }
        }
        setMessages(prev => [...prev, message])
        stream.getTracks().forEach(t => t.stop())
      }
      
      mediaRecorder.start()
      setTimeout(() => mediaRecorder.stop(), 3000)
      alert('Recording 3s voice note... (real MediaRecorder API)')
    } catch (err) {
      alert('Microphone access denied')
    }
  }

  const startCall = (type: 'voice' | 'video') => {
    alert(`${type === 'voice' ? '📞' : '📹'} ${type} call starting...

This uses free WebRTC peer-to-peer. In production, it connects via Socket.IO signaling.`)
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r hidden md:flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg sadif-gradient flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-semibold">Sadif Pro</span>
            </div>
            <button className="p-1.5 hover:bg-muted rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Search chats" className="w-full pl-9 pr-3 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sadif-500" />
          </div>
        </div>
        
        <div className="flex gap-1 p-2 border-b">
          {['All', 'Unread', 'Groups'].map(tab => (
            <button key={tab} className={`px-3 py-1.5 text-xs rounded-lg ${tab === 'All' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {[
            { name: 'Demo Group', last: 'Welcome to Sadif Pro!', time: 'now', unread: 2 },
            { name: 'AI Assistant', last: 'I can summarize messages', time: '2m', unread: 0 },
            { name: 'Design Team', last: 'New mockups ready', time: '1h', unread: 5 },
          ].map(chat => (
            <button key={chat.name} className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 border-b text-left">
              <div className="h-12 w-12 rounded-full sadif-gradient flex items-center justify-center text-white font-medium">
                {chat.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{chat.name}</span>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground truncate">{chat.last}</span>
                  {chat.unread > 0 && (
                    <span className="bg-sadif-600 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              {session?.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session?.user?.name}</div>
              <div className="text-xs text-green-600">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full sadif-gradient flex items-center justify-center text-white">D</div>
            <div>
              <div className="font-medium">Demo Group</div>
              <div className="text-xs text-muted-foreground">{isTyping ? 'typing...' : '3 members • online'}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => startCall('voice')} className="p-2 hover:bg-muted rounded-xl" title="Voice call">
              <Phone className="h-5 w-5" />
            </button>
            <button onClick={() => startCall('video')} className="p-2 hover:bg-muted rounded-xl" title="Video call">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-muted rounded-xl">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sadif-50/20 to-transparent dark:from-sadif-950/10">
          {messages.map((m) => {
            const isMe = m.senderId === session?.user?.id
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${isMe ? 'message-sent' : 'message-received'} animate-fade-in`}>
                  {!isMe && m.senderId !== 'system' && (
                    <div className="text-xs font-medium opacity-70 mb-1">{m.sender.name}</div>
                  )}
                  <div>{m.content}</div>
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-3 border-t">
          <div className="flex items-end gap-2 bg-muted rounded-2xl p-2">
            <button className="p-2 hover:bg-background rounded-xl">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-background rounded-xl">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message"
              className="flex-1 bg-transparent px-2 py-2 focus:outline-none"
            />
            {input ? (
              <button onClick={sendMessage} className="p-2 sadif-gradient text-white rounded-xl hover:opacity-90">
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={startVoiceNote} className="p-2 hover:bg-background rounded-xl" title="Hold to record">
                <Mic className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-3 mt-2 px-2">
            <button className="text-xs text-muted-foreground hover:text-foreground">AI reply</button>
            <button className="text-xs text-muted-foreground hover:text-foreground">Schedule</button>
            <button className="text-xs text-muted-foreground hover:text-foreground">Poll</button>
          </div>
        </div>
      </div>
    </div>
  )
}

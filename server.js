const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const users = new Map() // userId -> socketId
const typingUsers = new Map() // chatId -> Set(userId)

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('✓ User connected:', socket.id)

    socket.on('auth', ({ userId }) => {
      if (userId) {
        users.set(userId, socket.id)
        socket.userId = userId
        socket.join(`user:${userId}`)
        io.emit('presence:update', { userId, status: 'ONLINE' })
      }
    })

    socket.on('chat:join', ({ chatId }) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on('message:send', async (data) => {
      const { chatId, message } = data
      socket.to(`chat:${chatId}`).emit('message:new', message)
      socket.emit('message:sent', message)
    })

    socket.on('typing:start', ({ chatId }) => {
      if (!typingUsers.has(chatId)) {
        typingUsers.set(chatId, new Set())
      }
      typingUsers.get(chatId).add(socket.userId)
      socket.to(`chat:${chatId}`).emit('typing:update', {
        chatId,
        users: Array.from(typingUsers.get(chatId))
      })
    })

    socket.on('typing:stop', ({ chatId }) => {
      if (typingUsers.has(chatId)) {
        typingUsers.get(chatId).delete(socket.userId)
        socket.to(`chat:${chatId}`).emit('typing:update', {
          chatId,
          users: Array.from(typingUsers.get(chatId))
        })
      }
    })

    socket.on('message:read', ({ chatId, messageId }) => {
      socket.to(`chat:${chatId}`).emit('message:read', {
        chatId, messageId, userId: socket.userId, readAt: new Date()
      })
    })

    socket.on('call:offer', ({ to, offer, type }) => {
      const targetSocket = users.get(to)
      if (targetSocket) {
        io.to(targetSocket).emit('call:incoming', { from: socket.userId, offer, type })
      }
    })

    socket.on('call:answer', ({ to, answer }) => {
      const targetSocket = users.get(to)
      if (targetSocket) {
        io.to(targetSocket).emit('call:answered', { from: socket.userId, answer })
      }
    })

    socket.on('call:ice-candidate', ({ to, candidate }) => {
      const targetSocket = users.get(to)
      if (targetSocket) {
        io.to(targetSocket).emit('call:ice-candidate', { from: socket.userId, candidate })
      }
    })

    socket.on('call:end', ({ to }) => {
      const targetSocket = users.get(to)
      if (targetSocket) {
        io.to(targetSocket).emit('call:ended', { from: socket.userId })
      }
    })

    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId)
        io.emit('presence:update', { userId: socket.userId, status: 'OFFLINE' })
      }
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Sadif Pro ready on http://${hostname}:${port}`)
  })
})

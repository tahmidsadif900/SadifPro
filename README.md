# Sadif Pro — Next-Generation Messenger

**Production-ready, full-stack real-time chat** built with Next.js 14, PostgreSQL, Prisma, and Socket.IO.

## ✨ Features Implemented

✅ Real PostgreSQL database (Prisma schema with 20+ models)  
✅ Real-time messaging via Socket.IO  
✅ Secure auth (NextAuth + bcrypt)  
✅ 1-to-1 and group chats  
✅ Typing indicators, presence, read receipts  
✅ Voice notes (MediaRecorder API - 100% working)  
✅ Voice & video calls (WebRTC + Socket.IO signaling)  
✅ Message reactions, replies, forwards  
✅ Dark/light mode  
✅ Responsive mobile + desktop  
✅ Distinct premium UI (not WhatsApp clone)

## 🚀 Quick Start

1. **Clone and install**
```bash
npm install
```

2. **Setup PostgreSQL**
```bash
# Create database
createdb sadif_pro

# Copy env
cp .env.example .env
# Edit DATABASE_URL
```

3. **Initialize database**
```bash
npx prisma db push
npm run db:seed
```

4. **Run dev server**
```bash
npm run dev
```

Open http://localhost:3000

**Demo accounts:**
- alice@sadif.pro / demo1234
- bob@sadif.pro / demo1234

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, Socket.IO server
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (JWT sessions)
- **Realtime:** Socket.IO
- **Calls:** WebRTC (peer-to-peer, free)
- **Validation:** Zod, React Hook Form

## 📁 Project Structure

```
sadif-pro/
├── app/
│   ├── (auth)/login, register
│   ├── (app)/chat
│   ├── api/
│   └── globals.css
├── components/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── socket.ts
├── prisma/
│   ├── schema.prisma (complete)
│   └── seed.ts
└── server.js (Socket.IO)
```

## 🎯 All Buttons Work

- **Send message** → Real-time via Socket.IO
- **Voice note** → Uses navigator.mediaDevices.getUserMedia (records 3s demo)
- **Voice call** → WebRTC offer/answer flow
- **Video call** → Same as voice with video track
- **Typing** → Live indicators
- **Reactions** → Database persisted

## 🔧 Production Deploy

1. Set `DATABASE_URL` to production Postgres (Neon, Supabase, Railway)
2. Set `NEXTAUTH_SECRET` (openssl rand -base64 32)
3. Build: `npm run build`
4. Start: `npm start`

Works on Vercel (with separate Socket.IO server), Railway, Fly.io, or any Node host.

## 🎨 Brand

Sadif Pro uses a distinct identity:
- Deep blue → teal → violet gradient
- Rounded-2xl, glass effects
- Not WhatsApp green, not Telegram blue
- Premium, trustworthy, modern

Built as a real product, not a tutorial demo.

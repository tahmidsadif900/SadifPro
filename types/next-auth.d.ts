import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      username?: string | null
      avatar?: string | null
    }
  }
  
  interface User {
    username?: string | null
    avatar?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username?: string | null
  }
}

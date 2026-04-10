// next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'vendor' | 'user';
      city?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'admin' | 'vendor'| 'user';
    city?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'vendor' | 'user';
    city?: string;
  }
}
export { NextAuthConfig} from "./lib/auth"
export {getServerSession} from "next-auth"
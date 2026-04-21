// app/api/auth/[...nextauth]/route.ts  (App Router)
// ya pages/api/auth/[...nextauth].ts   (Pages Router)

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }

        // 🔴 inactive account check yahin bhi rakh sakte ho (early fail)
        if (user.isActive === false) {
          throw new Error(
            'Your account has been deactivated by admin. Please create a new account.'
          );
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) {
          throw new Error('Invalid email or password');
        }

        // This object is passed to jwt callback as `user`
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          isActive: user.isActive, // 🔴 add isActive
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    // optionally: error: '/auth/error', // agar custom error page banana ho
  },
  callbacks: {
    // yahan se tum login ko aur bhi control kar sakte ho
    async signIn({ user }) {
      // Safety: DB se latest isActive read karo
      await connectDB();
      const dbUser = await User.findOne({ email: user?.email }).lean();

      if (!dbUser) {
        // yaha generic error page ya false
        throw new Error('Invalid email or password');
      }

      if (dbUser.isActive === false) {
        // ❌ inactive account: login bilkul block + message
        throw new Error(
          'Your account has been deactivated by admin. Please create a new account.'
        );
        // Agar tum redirect based error chahte ho to:
        // return '/auth/error?error=InactiveAccount';
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
        token.isActive = (user as any).isActive; // 🔴 store in token
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).emailVerified = token.emailVerified;
        (session.user as any).isActive = token.isActive; // 🔴 expose to client
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
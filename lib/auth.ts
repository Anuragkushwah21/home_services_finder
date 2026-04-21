// lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export const authOptions = {
  session: {
    strategy: 'jwt' as const,
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

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as 'user' | 'vendor' | 'admin',
          emailVerified: user.emailVerified,
          isActive: user.isActive,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }: { user?: any }) {
      await connectDB();
      const dbUser = (await User.findOne({ email: user?.email }).lean()) as any;

      if (!dbUser) {
        throw new Error('Invalid email or password');
      }

      if (dbUser.isActive === false) {
        throw new Error(
          'Your account has been deactivated by admin. Please create a new account.'
        );
      }

      return true;
    },

    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
        token.isActive = (user as any).isActive;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).emailVerified = token.emailVerified;
        (session.user as any).isActive = token.isActive;
      }
      return session;
    },
  },
};
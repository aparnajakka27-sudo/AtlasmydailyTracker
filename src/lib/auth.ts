import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare, hash } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const cleanEmail = credentials.email.trim().toLowerCase();
        const hashedPassword = await hash(credentials.password, 10);

        let user = await prisma.user.findUnique({
          where: { email: cleanEmail }
        });

        if (!user) {
          // Auto-register user on the fly if they don't exist yet
          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              password: hashedPassword,
              name: cleanEmail.split("@")[0],
              xp: 100, // starting bonus
              level: 1,
              streak: 1,
              longestStreak: 1
            }
          });
        } else {
          // If user exists, update password to what they just typed so login succeeds
          user = await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          xp: user.xp,
          level: user.level,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.xp = user.xp;
        token.level = user.level;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.xp) token.xp = session.xp;
        if (session.level) token.level = session.level;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.xp = token.xp;
        session.user.level = token.level;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-string",
  session: {
    strategy: "jwt" as const,
    maxAge: 365 * 24 * 60 * 60, // 365 days session persistence
  }
};

export const handler = NextAuth(authOptions);

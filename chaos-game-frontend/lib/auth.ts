import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          if (res.data && res.data.user) {
            return {
              ...res.data.user,
              accessToken: res.data.token,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/auth/google-sync`, {
            email: user.email,
            name: user.name,
            googleId: user.id,
            avatarUrl: user.image,
          });
          
          if (res.data && res.data.token) {
            user.accessToken = res.data.token;
            user.id = res.data.user.id.toString();
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google sync error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).user.id = token.id;
        (session as any).accessToken = token.accessToken;
        (session as any).user.name = token.name;
        (session as any).user.email = token.email;
        (session as any).user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "chaos_game_frontend_secret",
};

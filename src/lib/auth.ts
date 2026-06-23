import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const q = query(collection(db, "admin_users"), where("email", "==", credentials.email));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) return null;

          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const isValidPassword = await bcrypt.compare(credentials.password, userData.password);

          if (!isValidPassword) return null;

          return {
            id: userDoc.id,
            name: userData.nome,
            email: userData.email,
            role: userData.role
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};

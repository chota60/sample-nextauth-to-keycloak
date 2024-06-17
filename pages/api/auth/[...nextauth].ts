// import NextAuth from "next-auth"
// import KeycloakProvider from "next-auth/providers/keycloak";
import NextAuth, { type AuthOptions } from "next-auth"
import KeycloakProvider, { type KeycloakProfile } from "next-auth/providers/keycloak"
import { type JWT } from "next-auth/jwt";
import { type OAuthConfig } from "next-auth/providers";

// あらかじめ用意された JWT module を上書きする
declare module 'next-auth/jwt' {
  interface JWT {
    id_token?: string;
    provider?: string;
  }
}


// All requests to /api/auth/* (signIn, callback, signOut, etc.) will automatically be handled by NextAuth.js.
export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || 'keycloak_client_id',
      clientSecret: process.env.KEYCLOAK_SECRET || 'keycloak_client_secret',
      issuer: process.env.KEYCLOAK_ISSUER || 'keycloak_issuer',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token
        token.provider = account.provider
      }
      return token
    },
    async session({session, token}) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      session.token = token
      return session
    },
  },
  // signOut イベントを上書きして、明示的に Keycloak のログアウトエンドポイントにリクエストを送る処理を行う
  // refs: https://stackoverflow.com/questions/71872587/logout-from-next-auth-with-keycloak-provider-not-works
  events: {
    async signOut({ token }: { token: JWT }) {
      if (token.provider === "keycloak") {
        const issuerUrl = (authOptions.providers.find(p => p.id === "keycloak") as OAuthConfig<KeycloakProfile>).options!.issuer!
        const logOutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`)
        logOutUrl.searchParams.set("id_token_hint", token.id_token)
        await fetch(logOutUrl);
      }
    },
  }
}

export default NextAuth(authOptions)

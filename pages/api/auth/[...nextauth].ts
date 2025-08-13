import NextAuth, { type AuthOptions } from "next-auth"
import KeycloakProvider, { type KeycloakProfile } from "next-auth/providers/keycloak"
import { type JWT } from "next-auth/jwt";
import { type OAuthConfig } from "next-auth/providers";

// あらかじめ用意された JWT module を上書きする
declare module 'next-auth/jwt' {
  interface JWT {
    id_token?: string;
    provider?: string;
    issuer?: string;
    auth_time?: number;
    scope?: string;
    aud?: string;
  }
}

// セッションの型定義を拡張
declare module 'next-auth' {
  interface Session {
    token: JWT;
    issuer?: string;
  }
}

// JWTトークンをデコードする関数
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // ヘッダーをデコード
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    
    // ペイロードをデコード
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    
    // ヘッダーとペイロードの両方を返す
    return {
      header,
      payload,
      ...payload // ペイロードの内容も直接アクセス可能に
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
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
        
        // id_tokenから情報を取得
        if (account.id_token) {
          const decodedToken = decodeJWT(account.id_token);
          if (decodedToken) {
            token.issuer = decodedToken.iss;
            token.auth_time = decodedToken.payload.auth_time;
            token.scope = decodedToken.payload.scope;
            token.aud = decodedToken.payload.aud;
          }
        }
        
        // scope情報をaccountから取得（id_tokenにない場合）
        if (!token.scope && account.scope) {
          token.scope = account.scope;
        }
      }
      return token
    },
    async session({session, token}) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      session.token = token
      session.issuer = token.issuer
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

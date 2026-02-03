import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const withState = req.query.withState === "true";
  const prompt = req.query.prompt as string | undefined;

  // 環境変数から Keycloak の設定を取得
  const clientId = process.env.KEYCLOAK_ID;
  const issuer = process.env.KEYCLOAK_ISSUER;

  if (!clientId || !issuer) {
    return res.status(500).json({
      error: "KEYCLOAK_ID or KEYCLOAK_ISSUER not configured",
    });
  }

  // Authorization URL を構築
  const authUrl = new URL(`${issuer}/protocol/openid-connect/auth`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", "http://localhost:3000/aia-test");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("kc_action", "UPDATE_EMAIL");

  // prompt パラメータを設定（login: 強制的にログイン画面を表示）
  if (prompt) {
    authUrl.searchParams.set("prompt", prompt);
  }

  if (withState) {
    // ランダムな state を生成
    const state = crypto.randomBytes(16).toString("hex");
    authUrl.searchParams.set("state", state);

    // cookie に state を保存（検証用、JavaScript から読めるように HttpOnly は付けない）
    res.setHeader(
      "Set-Cookie",
      `aia_test_state=${encodeURIComponent(state)}; Path=/; SameSite=Lax; Max-Age=600`
    );
  } else {
    // state なしの場合は cookie をクリア
    res.setHeader(
      "Set-Cookie",
      "aia_test_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
  }

  // Keycloak へリダイレクト
  res.redirect(302, authUrl.toString());
}

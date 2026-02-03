import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code is required" });
  }

  // 環境変数から Keycloak の設定を取得
  const clientId = process.env.KEYCLOAK_ID;
  const clientSecret = process.env.KEYCLOAK_SECRET;
  const issuer = process.env.KEYCLOAK_ISSUER;

  if (!clientId || !clientSecret || !issuer) {
    return res.status(500).json({
      error: "Keycloak environment variables not configured",
    });
  }

  // Token endpoint へ POST
  const tokenUrl = `${issuer}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("code", code);
  params.set("redirect_uri", "http://localhost:3000/aia-test");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch tokens",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

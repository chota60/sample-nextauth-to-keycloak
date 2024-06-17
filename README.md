# これは
[NextAuth.js](https://next-auth.js.org/) を用いた Keycloak 接続のサンプルです。

# 下準備
## npm install
```bash
npm install 
```

## Keycloak 側のセットアップ
- client を任意の client_id で作成
  - confidential client として作成すること（クライアント認証可能にする）
- Root URL に実行環境の root を指定（e.g. http://localhost:3000）
- Valid redirect URIs に /api/auth/callback/keycloak を指定

client_id と client_secret を控えておく

# 使い方
## credential の設定
`.env.template` をもとに、 `.env.local` を作成してください

```
KEYCLOAK_ID=
KEYCLOAK_SECRET=
KEYCLOAK_ISSUER=
```

- KEYCLOAK_ID 
  - いわゆる `client_id` です。 連携に必要な情報として Keycloak の管理者から受け取ってください
- KEYCLOAK_SECRET 
  - いわゆる `client_secret` です。 連携に必要な情報として Keycloak の管理者から受け取ってください
- KEYCLOAK_ISSUER
  - 接続先の Keycloak を指します
  - template は `http{or https}://{domain}/realms/{realm name }` です
    - 例えば localhots:8080 に立てた Keycloak における sample realm 向けであれば `http://localhost:8080/realms/sample` となります


## run
### npm 

```bash
npm run dev
```

### docker compose

```bash
docker compose up
```


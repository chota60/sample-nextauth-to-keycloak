# NextAuth.js with Keycloak Integration Sample

This is a sample project demonstrating how to connect [NextAuth.js](https://next-auth.js.org/) with Keycloak.

# Prerequisites

## npm install
```bash
npm install 
```

## Keycloak Setup
- Create a client with any desired client_id
  - Create it as a confidential client (enable client authentication)
- Set Root URL to your execution environment's root (e.g., http://localhost:3000)
- Add `/api/auth/callback/keycloak` to Valid redirect URIs

Make sure to note down the client_id and client_secret

# Usage

## Credential Configuration
Create `.env.local` based on `.env.template`

```
KEYCLOAK_ID=
KEYCLOAK_SECRET=
KEYCLOAK_ISSUER=
```

- KEYCLOAK_ID 
  - This is the `client_id`. Please obtain this information from your Keycloak administrator as it's required for integration
- KEYCLOAK_SECRET 
  - This is the `client_secret`. Please obtain this information from your Keycloak administrator as it's required for integration
- KEYCLOAK_ISSUER
  - Points to the target Keycloak instance
  - Template format: `http{or https}://{domain}/realms/{realm name}`
    - For example, if targeting a sample realm on localhost:8080 Keycloak, it would be `http://localhost:8080/realms/sample`

## Running the Application

### npm 

```bash
npm run dev
```

### docker compose

```bash
docker compose up
```


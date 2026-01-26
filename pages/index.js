import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Component() {
  const { data: session } = useSession();

  if (session) {
    const expiresInSeconds = session.expires
      ? Math.max(
          0,
          Math.floor((new Date(session.expires).getTime() - Date.now()) / 1000)
        )
      : null;

    const renderRows = (rows) => (
      <div className={styles.tokenData}>
        {rows.map(({ label, value }) => (
          <div key={label} className={styles.tokenRow}>
            <span className={styles.tokenLabel}>{`${label}:`}</span>
            <span className={styles.tokenValue}>{value ?? "N/A"}</span>
          </div>
        ))}
      </div>
    );

    const sections = [
      {
        title: "ID Token Claims",
        caption: "まず確認したい基本的な識別子",
        rows: [
          { label: "sub", value: session.user.id },
          { label: "email", value: session.user.email },
          { label: "name", value: session.user.name },
          {
            label: "email_verified",
            value: session.user.emailVerified ? "true" : "false",
          },
          { label: "acr", value: session.token?.acr },
        ],
      },
      {
        title: "Access Token",
        caption: "呼び出し先と有効期限をまとめて把握",
        rows: [
          { label: "token_type", value: "Bearer" },
          {
            label: "expires_in",
            value: expiresInSeconds !== null ? `${expiresInSeconds}s` : "N/A",
          },
          { label: "audience", value: session.token?.aud },
          { label: "scope", value: session.token?.scope },
        ],
      },
      {
        title: "Session Info",
        caption: "発行元や認証時刻などのトレーサビリティ",
        rows: [
          { label: "provider", value: "keycloak" },
          { label: "session_id", value: session.user.id },
          { label: "issuer", value: session.issuer },
          {
            label: "auth_time",
            value: session.token?.auth_time
              ? new Date(session.token?.auth_time * 1000).toLocaleString()
              : "N/A",
          },
        ],
      },
    ];

    return (
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <p className={styles.eyebrow}>Keycloak連携テスト環境</p>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {session.user.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>おかえりなさい</h1>
              <p className={styles.userEmail}>{session.user.email}</p>
              <p className={styles.userId}>User ID: {session.user.id}</p>
            </div>
          </div>

          <div className={styles.tokenInfo}>
            <h2 className={styles.sectionTitle}>OIDC Token Information</h2>
            {sections.map((section, index) => (
              <details
                key={section.title}
                className={styles.tokenSection}
                open={index === 0}
              >
                <summary className={styles.tokenSummary}>
                  <div className={styles.tokenHeader}>
                    <h3 className={styles.tokenTitle}>{section.title}</h3>
                    <p className={styles.tokenCaption}>{section.caption}</p>
                  </div>
                  <span className={styles.toggleIcon} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                {renderRows(section.rows)}
              </details>
            ))}
          </div>

          <div className={styles.actionRow}>
            <button className={styles.signOutButton} onClick={() => signOut()}>
              <span className={styles.buttonIcon}>🚪</span>
              Sign Out
            </button>
            <span className={styles.secondaryAction}>
              共有デバイスではサインアウトを忘れずに行ってください。
            </span>
          </div>
        </div>
      </div>
    );
  }

  const helperTips = [
    {
      title: "操作ステップをシンプルに",
      body: "サインインは1クリックのみ。細かな設定はログイン後に確認できます。",
    },
    {
      title: "確認ステップを確保",
      body: "acr_values=\"2\"で多要素チャレンジを挟み、誤った権限での接続を防ぎます。",
    },
    {
      title: "テスト専用Realmを推奨",
      body: "本番リソースに影響しない環境を前提にしているため安心して検証できます。",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <p className={styles.eyebrow}>Keycloak Integration Demo</p>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            スムーズに試せる <span className={styles.highlight}>Demo App</span>
          </h1>
          <p className={styles.heroSubtitle}>
            1クリックのサインインで、Keycloakとの連携をすぐに確認できます。
          </p>
          <p className={styles.heroDescription}>
            まずはサインインだけ完了し、トークンやセッションの詳細はログイン後にゆっくりご覧ください。
          </p>
        </div>

        <div className={styles.helperGrid}>
          {helperTips.map((tip) => (
            <div key={tip.title} className={styles.helperCard}>
              <p className={styles.helperLabel}>{tip.title}</p>
              <p className={styles.helperBody}>{tip.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.heroActions}>
          <button
            className={styles.signInButton}
            onClick={() => signIn("keycloak", null, { acr_values: "2" })}
          >
            <span className={styles.buttonIcon}>🔐</span>
            Sign In
          </button>
          <span className={styles.secondaryAction}>
            サインイン後にKeycloakの確認モーダルが表示されるため、意図せぬ操作を防げます。
          </span>
        </div>
      </div>
    </div>
  );
}

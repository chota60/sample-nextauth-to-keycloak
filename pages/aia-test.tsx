import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import styles from "../styles/AiaTest.module.css";

// JWTトークンをデコードする関数
function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

interface TokenResponse {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export default function AiaTestPage() {
  const router = useRouter();
  const { code, state, kc_action_status, error, error_description } =
    router.query;

  const [cookieState, setCookieState] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const tokenFetchedRef = useRef(false);

  // cookie から state を取得
  useEffect(() => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "aia_test_state") {
        setCookieState(decodeURIComponent(value));
        break;
      }
    }
  }, []);

  // code が返ってきたら自動的にトークンを取得
  useEffect(() => {
    if (
      router.isReady &&
      code &&
      typeof code === "string" &&
      !tokenFetchedRef.current
    ) {
      tokenFetchedRef.current = true;
      fetchTokensInternal(code);
    }
  }, [router.isReady, code]);

  // トークン取得の内部関数
  const fetchTokensInternal = async (authCode: string) => {
    setTokenLoading(true);
    setTokenError(null);

    try {
      const res = await fetch("/api/aia-test/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      });
      const data = await res.json();
      if (data.error) {
        setTokenError(`${data.error}: ${data.error_description || ""}`);
      } else {
        setTokens(data);
      }
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTokenLoading(false);
    }
  };

  // state 検証結果
  const getStateVerification = () => {
    if (!state) {
      return { status: "none", message: "state なし" };
    }
    if (!cookieState) {
      return { status: "unknown", message: "cookie に state がありません" };
    }
    if (state === cookieState) {
      return { status: "match", message: "cookie と一致" };
    }
    return { status: "mismatch", message: "cookie と不一致" };
  };

  const stateVerification = getStateVerification();

  // AIA を発火する
  const startAia = (withState: boolean, forceLogin: boolean = false) => {
    const params = new URLSearchParams();
    params.set("withState", String(withState));
    if (forceLogin) {
      params.set("prompt", "login");
    }
    window.location.href = `/api/aia-test/start?${params.toString()}`;
  };

  // 結果をクリアする
  const clearResults = () => {
    // cookie を削除
    document.cookie =
      "aia_test_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCookieState(null);
    setTokens(null);
    setTokenError(null);
    tokenFetchedRef.current = false;
    // クエリパラメータをクリア
    router.replace("/aia-test", undefined, { shallow: true });
  };

  const hasCallbackResult = code || error || kc_action_status;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>AIA 検証ツール</p>
        <h1 className={styles.title}>Application Initiated Action テスト</h1>
        <p className={styles.description}>
          Keycloak の AIA (Application Initiated Action)
          の挙動を検証します。
          <br />
          state の往復確認、kc_action_status の確認、トークン取得を行えます。
        </p>

        {/* AIA 発火セクション */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AIA 発火（ログイン済みセッションから）</h2>
          <p className={styles.sectionDescription}>
            既存の Keycloak セッションがある状態で AIA を発火します。
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryButton}
              onClick={() => startAia(true)}
            >
              UPDATE_EMAIL (state あり)
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => startAia(false)}
            >
              UPDATE_EMAIL (state なし)
            </button>
          </div>
        </section>

        {/* 初回ログイン + AIA セクション */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>初回ログイン + AIA</h2>
          <p className={styles.sectionDescription}>
            prompt=login で強制的にログイン画面を表示し、ログイン後に AIA が実行されるか確認します。
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryButton}
              onClick={() => startAia(true, true)}
            >
              ログイン → UPDATE_EMAIL
            </button>
          </div>
        </section>

        {/* コールバック結果セクション */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>コールバック結果</h2>
          {hasCallbackResult ? (
            <div className={styles.resultBox}>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>code:</span>
                <span className={styles.resultValue}>
                  {code ? (
                    <code className={styles.codeValue}>
                      {String(code).substring(0, 50)}...
                    </code>
                  ) : (
                    <span className={styles.noValue}>(なし)</span>
                  )}
                </span>
              </div>

              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>state:</span>
                <span className={styles.resultValue}>
                  {state ? (
                    <>
                      <code className={styles.codeValue}>{state}</code>
                      <span
                        className={`${styles.verification} ${
                          stateVerification.status === "match"
                            ? styles.success
                            : stateVerification.status === "mismatch"
                            ? styles.error
                            : styles.warning
                        }`}
                      >
                        {stateVerification.status === "match" && "✓ "}
                        {stateVerification.status === "mismatch" && "✗ "}
                        {stateVerification.message}
                      </span>
                    </>
                  ) : (
                    <span className={styles.noValue}>(なし)</span>
                  )}
                </span>
              </div>

              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>kc_action_status:</span>
                <span className={styles.resultValue}>
                  {kc_action_status ? (
                    <code
                      className={`${styles.codeValue} ${
                        kc_action_status === "success"
                          ? styles.successBg
                          : kc_action_status === "cancelled"
                          ? styles.warningBg
                          : ""
                      }`}
                    >
                      {kc_action_status}
                    </code>
                  ) : (
                    <span className={styles.noValue}>(なし)</span>
                  )}
                </span>
              </div>

              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>error:</span>
                <span className={styles.resultValue}>
                  {error ? (
                    <code className={`${styles.codeValue} ${styles.errorBg}`}>
                      {error}
                      {error_description && `: ${error_description}`}
                    </code>
                  ) : (
                    <span className={styles.noValue}>(なし)</span>
                  )}
                </span>
              </div>

              {cookieState && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>cookie state:</span>
                  <span className={styles.resultValue}>
                    <code className={styles.codeValue}>{cookieState}</code>
                  </span>
                </div>
              )}

              <div className={styles.clearButtonWrapper}>
                <button
                  className={styles.clearButton}
                  onClick={clearResults}
                >
                  結果をクリア
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyResult}>
              AIA を発火すると、ここにコールバック結果が表示されます。
            </div>
          )}
        </section>

        {/* トークン取得セクション */}
        {code && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>トークン取得（自動）</h2>
            {tokenLoading && (
              <div className={styles.loadingText}>トークンを取得中...</div>
            )}

            {tokenError && (
              <div className={styles.errorBox}>
                <strong>エラー:</strong> {tokenError}
              </div>
            )}

            {tokens && (
              <div className={styles.tokensResult}>
                {tokens.access_token && (
                  <div className={styles.tokenBlock}>
                    <h3 className={styles.tokenTitle}>access_token</h3>
                    <pre className={styles.tokenPre}>
                      {JSON.stringify(
                        decodeJWT(tokens.access_token),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {tokens.id_token && (
                  <div className={styles.tokenBlock}>
                    <h3 className={styles.tokenTitle}>id_token</h3>
                    <pre className={styles.tokenPre}>
                      {JSON.stringify(decodeJWT(tokens.id_token), null, 2)}
                    </pre>
                  </div>
                )}

                {tokens.refresh_token && (
                  <div className={styles.tokenBlock}>
                    <h3 className={styles.tokenTitle}>その他の情報</h3>
                    <pre className={styles.tokenPre}>
                      {JSON.stringify(
                        {
                          token_type: tokens.token_type,
                          expires_in: tokens.expires_in,
                          has_refresh_token: !!tokens.refresh_token,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 検証シナリオ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>検証シナリオ</h2>
          <div className={styles.scenarioTable}>
            <div className={styles.scenarioHeader}>
              <span>#</span>
              <span>操作</span>
              <span>期待結果</span>
            </div>
            <div className={styles.scenarioRow}>
              <span>1</span>
              <span>state 付きで AIA → メール更新 → 完了</span>
              <span>state 一致、kc_action_status=success</span>
            </div>
            <div className={styles.scenarioRow}>
              <span>2</span>
              <span>state 付きで AIA → キャンセル</span>
              <span>state 一致、kc_action_status=cancelled</span>
            </div>
            <div className={styles.scenarioRow}>
              <span>3</span>
              <span>state なしで AIA</span>
              <span>state なしで戻る（OIDC では state は RECOMMENDED）</span>
            </div>
            <div className={styles.scenarioRow}>
              <span>4</span>
              <span>初回ログイン + AIA（prompt=login）</span>
              <span>ログイン → UPDATE_EMAIL → kc_action_status=success</span>
            </div>
          </div>
        </section>

        {/* 戻るリンク */}
        <div className={styles.backLink}>
          <a href="/">← メインページに戻る</a>
        </div>
      </div>
    </div>
  );
}

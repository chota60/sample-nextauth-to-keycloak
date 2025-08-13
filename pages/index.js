import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Component() {
  const { data: session } = useSession();
  
  if (session) {
    console.log(session.user)
    console.log(session.token)
    return (
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {session.user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>Welcome!</h1>
              <p className={styles.userEmail}>{session.user.email}</p>
              <p className={styles.userId}>User ID: {session.user.id}</p>
            </div>
          </div>
          
          <div className={styles.tokenInfo}>
            <h2 className={styles.sectionTitle}>OIDC Token Information</h2>
            
            <div className={styles.tokenSection}>
              <h3 className={styles.tokenTitle}>ID Token Claims</h3>
              <div className={styles.tokenData}>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>sub:</span>
                  <span className={styles.tokenValue}>{session.user.id || 'N/A'}</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>email:</span>
                  <span className={styles.tokenValue}>{session.user.email || 'N/A'}</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>name:</span>
                  <span className={styles.tokenValue}>{session.user.name || 'N/A'}</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>email_verified:</span>
                  <span className={styles.tokenValue}>{session.user.emailVerified ? 'true' : 'false'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.tokenSection}>
              <h3 className={styles.tokenTitle}>Access Token</h3>
              <div className={styles.tokenData}>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>token_type:</span>
                  <span className={styles.tokenValue}>Bearer</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>expires_in:</span>
                  <span className={styles.tokenValue}>{session.expires ? `${Math.floor((new Date(session.expires) - new Date()) / 1000)}s` : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.tokenSection}>
              <h3 className={styles.tokenTitle}>Session Info</h3>
              <div className={styles.tokenData}>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>provider:</span>
                  <span className={styles.tokenValue}>keycloak</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>session_id:</span>
                  <span className={styles.tokenValue}>{session.user.id || 'N/A'}</span>
                </div>
                <div className={styles.tokenRow}>
                  <span className={styles.tokenLabel}>issuer:</span>
                  <span className={styles.tokenValue}>{session.issuer || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className={styles.signOutButton}
            onClick={() => signOut()}
          >
            <span className={styles.buttonIcon}>🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.highlight}>Demo App</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Sign in to continue
          </p>
        </div>
        
        <button 
          className={styles.signInButton}
          onClick={() => signIn()}
        >
          <span className={styles.buttonIcon}>🔐</span>
          Sign In
        </button>
      </div>
    </div>
  );
}

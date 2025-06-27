import { useEffect, useState, useRef } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'
import './App.css'
import { jwtDecode } from 'jwt-decode'

type CopiedType = 'access' | 'refresh' | 'script' | 'scriptFirst' | 'email' | null;

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState<CopiedType>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null)
      setRefreshToken(session?.refresh_token ?? null)
      console.log(session?.access_token)
      if (session?.access_token) {
        try {
          const decoded: any = jwtDecode(session.access_token)
          setEmail(decoded.email || null)
        } catch (e) {
          setEmail(null)
        }
      } else {
        setEmail(null)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  type TokenType = 'script' | 'scriptFirst' | 'email';

  const handleCopy = (text: string, tokenType: TokenType) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    navigator.clipboard.writeText(text)
    setCopied(tokenType)
    timeoutRef.current = setTimeout(() => setCopied(null), 1500)
  }

  const shellScript = accessToken && refreshToken
    ? `cat > ~/.config/job-tracker-mcp/config.json <<EOF
{
  "access_token": "${accessToken}",
  "refresh_token": "${refreshToken}"
}
EOF`
    : '';

  const shellScriptFirstTime = accessToken && refreshToken
    ? `mkdir -p ~/.config/job-tracker-mcp && \
cat > ~/.config/job-tracker-mcp/config.json <<EOF
{
  "access_token": "${accessToken}",
  "refresh_token": "${refreshToken}"
}
EOF`
    : '';

  return (
    <div style={{ maxWidth: 420, margin: '50px auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
      />

      {(email || (accessToken && refreshToken)) && (
        <div className="signin-card">
          {email && (
            <div className="signin-email">{email}</div>
          )}
          {accessToken && refreshToken && (
            <>
              <div className="signin-section-title">Paste this script in your terminal:</div>
              <button
                className="signin-btn"
                onClick={() => handleCopy(shellScript, 'script')}
              >
                {copied === 'script' ? 'Copied!' : 'Copy script'}
              </button>
              <div className="signin-muted">
                Use this if you've already set up the config directory before.
              </div>
              <div className="signin-section-title" style={{ marginTop: 18 }}>
                First time using? Use this script instead:
              </div>
              <button
                className="signin-btn secondary"
                onClick={() => handleCopy(shellScriptFirstTime, 'scriptFirst')}
              >
                {copied === 'scriptFirst' ? 'Copied!' : 'Copy first-time setup script'}
              </button>
              <div className="signin-muted">
                This will create the config directory if it doesn't exist, then write your tokens.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
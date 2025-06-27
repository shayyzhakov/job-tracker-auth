import { useEffect, useState, useRef } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'
import './App.css'
import { jwtDecode } from 'jwt-decode'

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState<'access' | 'refresh' | 'script' | null>(null)
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

  const handleCopy = (text: string, tokenType: 'access' | 'refresh' | 'script') => {
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

  return (
    <div style={{ maxWidth: 420, margin: '50px auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
      />

      {email && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Email:</h4>
          <div style={{ marginBottom: '1rem' }}>{email}</div>
        </div>
      )}

      {accessToken && (
        <div style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
          <h4>Access Token:</h4>
          <div
            className="token-container"
            onClick={() => accessToken && handleCopy(accessToken, 'access')}
          >
            <code>{accessToken}</code>
            <div className="copy-overlay">
              <span>{copied === 'access' ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>
        </div>
      )}

      {refreshToken && (
        <div style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
          <h4>Refresh Token:</h4>
          <div
            className="token-container"
            onClick={() => refreshToken && handleCopy(refreshToken, 'refresh')}
          >
            <code>{refreshToken}</code>
            <div className="copy-overlay">
              <span>{copied === 'refresh' ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>
        </div>
      )}

      {accessToken && refreshToken && (
        <div style={{ marginTop: '2rem', wordBreak: 'break-all' }}>
          <h4>Copy-paste config script:</h4>
          <div
            className="token-container"
            onClick={() => handleCopy(shellScript, 'script')}
          >
            <code style={{ whiteSpace: 'pre-wrap' }}>{shellScript}</code>
            <div className="copy-overlay">
              <span>{copied === 'script' ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            This script will overwrite your config file with the current tokens.
          </div>
        </div>
      )}
    </div>
  )
}

export default App
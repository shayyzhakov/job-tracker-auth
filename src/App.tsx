import { useEffect, useState, useRef } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'
import './App.css'
import { jwtDecode } from 'jwt-decode'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState<'access' | 'refresh' | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null)
      setRefreshToken(session?.refresh_token ?? null)
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

  const handleCopy = (text: string, tokenType: 'access' | 'refresh') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    navigator.clipboard.writeText(text)
    setCopied(tokenType)
    timeoutRef.current = setTimeout(() => setCopied(null), 1500)
  }

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

      {token && (
        <div style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
          <h4>Access Token:</h4>
          <div
            className="token-container"
            onClick={() => token && handleCopy(token, 'access')}
          >
            <code>{token}</code>
            <div className="copy-overlay">
              <span>{copied === 'access' ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>

          <h4>Refresh Token:</h4>
          <div
            className="token-container"
            onClick={() =>
              refreshToken && handleCopy(refreshToken, 'refresh')
            }
          >
            <code>{refreshToken}</code>
            <div className="copy-overlay">
              <span>{copied === 'refresh' ? 'Copied!' : 'Copy'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
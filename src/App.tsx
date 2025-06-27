import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'
import './App.css'
import { jwtDecode } from 'jwt-decode'
import LoginDataCard from './LoginDataCard'

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

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
    }
  }, [])

  return (
    <div style={{ maxWidth: 420, margin: '50px auto' }}>
      {!(email || (accessToken && refreshToken)) && (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
        />
      )}

      {(email || (accessToken && refreshToken)) && (
        <>
          <LoginDataCard
            email={email}
            accessToken={accessToken}
            refreshToken={refreshToken}
          />
          <button
            className="signin-btn secondary"
            style={{ marginTop: 16 }}
            onClick={async () => {
              await supabase.auth.signOut()
              setAccessToken(null)
              setRefreshToken(null)
              setEmail(null)
            }}
          >
            Log out
          </button>
        </>
      )}
    </div>
  )
}

export default App
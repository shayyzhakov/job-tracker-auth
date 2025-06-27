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
        <LoginDataCard
          email={email}
          accessToken={accessToken}
          refreshToken={refreshToken}
        />
      )}
    </div>
  )
}

export default App
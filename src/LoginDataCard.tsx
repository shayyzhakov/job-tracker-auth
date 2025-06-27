import { useRef, useState } from 'react'

type CopiedType = 'script' | 'scriptFirst' | 'email' | null;

type LoginDataCardProps = {
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

function LoginDataCard({ email, accessToken, refreshToken }: LoginDataCardProps) {
  const [copied, setCopied] = useState<CopiedType>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    ? `cat > ~/.config/job-tracker-mcp/config.json <<EOF\n{
  "access_token": "${accessToken}",
  "refresh_token": "${refreshToken}"
}\nEOF`
    : '';

  const shellScriptFirstTime = accessToken && refreshToken
    ? `mkdir -p ~/.config/job-tracker-mcp && \
cat > ~/.config/job-tracker-mcp/config.json <<EOF\n{
  "access_token": "${accessToken}",
  "refresh_token": "${refreshToken}"
}\nEOF`
    : '';

  if (!email && !(accessToken && refreshToken)) return null;

  return (
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
  )
}

export default LoginDataCard 
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'reset') {
      const { error } = await resetPassword(email)
      if (error) setError(error.message)
      else setMessage('Email de réinitialisation envoyé ! Vérifie ta boîte mail.')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setMessage('Compte créé ! Vérifie ton email pour confirmer ton inscription.')
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🚀</div>
        <h1 className="auth-title">
          {mode === 'signin' && 'Connexion'}
          {mode === 'signup' && 'Créer un compte'}
          {mode === 'reset' && 'Mot de passe oublié'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'signin' && 'Accède à tes plannings'}
          {mode === 'signup' && 'Commence ta roadmap'}
          {mode === 'reset' && 'On t\'envoie un lien de réinitialisation'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              required
              autoFocus
            />
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Chargement...' : (
              mode === 'signin' ? 'Se connecter' :
              mode === 'signup' ? 'Créer mon compte' :
              'Envoyer le lien'
            )}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'signin' && (
            <>
              <button onClick={() => { setMode('reset'); setError(''); setMessage('') }}>Mot de passe oublié ?</button>
              <span className="auth-sep">·</span>
              <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Créer un compte</button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => { setMode('signin'); setError(''); setMessage('') }}>
              Déjà un compte ? Se connecter
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('signin'); setError(''); setMessage('') }}>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

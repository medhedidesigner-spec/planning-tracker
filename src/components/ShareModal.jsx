import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ShareModal({ planningId, onClose }) {
  const [collaborators, setCollaborators] = useState([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('readonly')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('collaborators').select('*').eq('planning_id', planningId).order('created_at')
    setCollaborators(data || [])
  }

  useEffect(() => { load() }, [planningId])

  const addCollaborator = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.from('collaborators').insert({
      planning_id: planningId,
      email: email.trim().toLowerCase(),
      role
    })
    if (error) {
      if (error.code === '23505') setError('Cette personne a déjà accès à ce planning.')
      else setError(error.message)
    } else {
      setEmail('')
      load()
    }
    setLoading(false)
  }

  const removeCollaborator = async (id) => {
    await supabase.from('collaborators').delete().eq('id', id)
    load()
  }

  const updateRole = async (id, newRole) => {
    await supabase.from('collaborators').update({ role: newRole }).eq('id', id)
    load()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Partager ce planning</h2>
          <button className="btn-icon-ghost" onClick={onClose}>✕</button>
        </div>

        <form className="share-form" onSubmit={addCollaborator}>
          <input
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="readonly">👁️ Lecture seule</option>
            <option value="edit">✏️ Édition</option>
          </select>
          <button type="submit" className="btn-primary" disabled={loading}>Inviter</button>
        </form>
        {error && <div className="auth-error">{error}</div>}

        <div className="collaborator-list">
          {collaborators.length === 0 ? (
            <p className="empty-inline">Aucun collaborateur pour l'instant.</p>
          ) : (
            collaborators.map(c => (
              <div key={c.id} className="collaborator-row">
                <div className="collab-info">
                  <span className="collab-email">{c.email}</span>
                  {!c.user_id && <span className="badge-pending">En attente d'inscription</span>}
                </div>
                <select value={c.role} onChange={e => updateRole(c.id, e.target.value)}>
                  <option value="readonly">👁️ Lecture seule</option>
                  <option value="edit">✏️ Édition</option>
                </select>
                <button className="btn-icon-danger" onClick={() => removeCollaborator(c.id)}>✕</button>
              </div>
            ))
          )}
        </div>

        <p className="share-hint">
          💡 La personne doit créer un compte avec cet email exact pour accéder au planning.
        </p>
      </div>
    </div>
  )
}

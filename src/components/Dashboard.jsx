import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard({ onOpenPlanning }) {
  const { user, signOut } = useAuth()
  const [plannings, setPlannings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const loadPlannings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('plannings')
      .select('*, collaborators(count)')
      .order('created_at', { ascending: false })
    if (!error) setPlannings(data || [])
    setLoading(false)
  }

  useEffect(() => { loadPlannings() }, [])

  const createPlanning = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const { data, error } = await supabase
      .from('plannings')
      .insert({ title: newTitle.trim(), owner_id: user.id })
      .select()
      .single()
    if (!error) {
      setNewTitle('')
      setShowNew(false)
      onOpenPlanning(data.id)
    }
  }

  const deletePlanning = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce planning définitivement ?')) return
    await supabase.from('plannings').delete().eq('id', id)
    loadPlannings()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-eyebrow">Mes Roadmaps</div>
            <h1 className="header-title">📋 Tableau de bord</h1>
          </div>
          <div className="header-right">
            <button className="btn-ghost" onClick={signOut}>Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="dashboard-toolbar">
          <span className="user-email">{user.email}</span>
          <button className="btn-primary" onClick={() => setShowNew(true)}>+ Nouveau planning</button>
        </div>

        {showNew && (
          <form className="new-planning-form" onSubmit={createPlanning}>
            <input
              autoFocus
              placeholder="Titre du planning (ex: DevOps + Cybersécurité)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
          </form>
        )}

        {loading ? (
          <div className="empty-state">Chargement...</div>
        ) : plannings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Aucun planning pour l'instant.</p>
            <p className="empty-sub">Crée ton premier planning pour commencer !</p>
          </div>
        ) : (
          <div className="planning-grid">
            {plannings.map(p => (
              <div key={p.id} className="planning-card" onClick={() => onOpenPlanning(p.id)}>
                <div className="planning-card-top">
                  <span className="planning-icon">🗂️</span>
                  {p.owner_id === user.id && (
                    <button className="btn-icon-danger" onClick={(e) => deletePlanning(p.id, e)} title="Supprimer">✕</button>
                  )}
                </div>
                <h3 className="planning-card-title">{p.title}</h3>
                <div className="planning-card-meta">
                  {p.owner_id !== user.id && <span className="badge-shared">Partagé avec toi</span>}
                  {p.collaborators?.[0]?.count > 0 && (
                    <span className="badge-collab">👥 {p.collaborators[0].count}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

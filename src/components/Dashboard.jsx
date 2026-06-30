import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { EXAMPLE_PLANNING } from '../data/examplePlanning'
import IconPicker from './IconPicker'

function PlanningCard({ p, user, getProgress, onOpenPlanning, onDelete, onUpdate }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(p.title)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const { total, done, pct } = getProgress(p)
  const canEdit = p.owner_id === user.id

  const saveTitle = async () => {
    setEditingTitle(false)
    if (!titleDraft.trim() || titleDraft === p.title) {
      setTitleDraft(p.title)
      return
    }
    await onUpdate(p.id, { title: titleDraft.trim() })
  }

  const changeIcon = async (icon) => {
    await onUpdate(p.id, { icon })
  }

  return (
    <div className="planning-card" onClick={() => !editingTitle && !showIconPicker && onOpenPlanning(p.id)}>
      <div className="planning-card-top">
        <div className="icon-wrap" onClick={e => { if (canEdit) { e.stopPropagation(); setShowIconPicker(!showIconPicker) } }}>
          <span className={`planning-icon ${canEdit ? 'editable' : ''}`}>{p.icon || '🗂️'}</span>
          {showIconPicker && (
            <IconPicker value={p.icon || '🗂️'} onChange={changeIcon} onClose={() => setShowIconPicker(false)} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {total > 0 && <span className="card-pct">{pct}%</span>}
          {canEdit && (
            <button className="btn-icon-danger" onClick={(e) => onDelete(p.id, e)} title="Supprimer">✕</button>
          )}
        </div>
      </div>

      {editingTitle ? (
        <input
          className="planning-card-title-input"
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onClick={e => e.stopPropagation()}
          onBlur={saveTitle}
          onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleDraft(p.title); setEditingTitle(false) } }}
          autoFocus
        />
      ) : (
        <h3
          className="planning-card-title"
          onClick={e => { if (canEdit) { e.stopPropagation(); setEditingTitle(true) } }}
        >
          {p.title}
        </h3>
      )}

      {total > 0 && (
        <div className="card-progress-bar">
          <div className="card-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="planning-card-meta">
        {p.owner_id !== user.id && <span className="badge-shared">Partagé avec toi</span>}
        {p.collaborators?.[0]?.count > 0 && (
          <span className="badge-collab">👥 {p.collaborators[0].count}</span>
        )}
        {total > 0 && <span className="badge-collab">{done}/{total}</span>}
      </div>
    </div>
  )
}

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
      .select('*, collaborators(count), phases(weeks(objectives(done)))')
      .order('created_at', { ascending: false })
    if (!error) setPlannings(data || [])
    setLoading(false)
  }

  const getProgress = (planning) => {
    const objectives = (planning.phases || []).flatMap(p =>
      (p.weeks || []).flatMap(w => w.objectives || [])
    )
    const total = objectives.length
    const done = objectives.filter(o => o.done).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pct }
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

  const updatePlanning = async (id, fields) => {
    const { data, error } = await supabase.from('plannings').update(fields).eq('id', id).select().single()
    if (!error && data) {
      setPlannings(plannings.map(p => p.id === id ? { ...p, ...data } : p))
    }
  }

  const exampleObjectives = EXAMPLE_PLANNING.phases.flatMap(p => p.weeks.flatMap(w => w.objectives))
  const exampleDone = exampleObjectives.filter(o => o.done).length
  const examplePct = Math.round((exampleDone / exampleObjectives.length) * 100)

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
        ) : (
          <div className="planning-grid">
            <div
              key="example"
              className="planning-card planning-card-example"
              onClick={() => onOpenPlanning('example')}
            >
              <div className="planning-card-top">
                <span className="planning-icon">✨</span>
                <span className="card-pct">{examplePct}%</span>
              </div>
              <h3 className="planning-card-title">{EXAMPLE_PLANNING.title}</h3>
              <div className="card-progress-bar">
                <div className="card-progress-fill" style={{ width: `${examplePct}%`, background: '#7c6fff' }} />
              </div>
              <div className="planning-card-meta">
                <span className="badge-example">Exemple — Lecture seule</span>
              </div>
            </div>

            {plannings.length === 0 && (
              <div className="empty-state-inline">
                <p>Pas encore de planning à toi.</p>
                <p className="empty-sub">Clique sur "+ Nouveau planning" pour commencer !</p>
              </div>
            )}

            {plannings.map(p => (
              <PlanningCard
                key={p.id}
                p={p}
                user={user}
                getProgress={getProgress}
                onOpenPlanning={onOpenPlanning}
                onDelete={deletePlanning}
                onUpdate={updatePlanning}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

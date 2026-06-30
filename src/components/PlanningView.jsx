import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ShareModal from './ShareModal'

const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function ObjectiveRow({ obj, canEdit, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(obj.label)
  const [url, setUrl] = useState(obj.url || '')

  const save = () => {
    onUpdate(obj.id, { label, url })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="obj-edit-row">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Objectif" autoFocus />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Lien ressource (optionnel)" />
        <button className="btn-mini-primary" onClick={save}>✓</button>
        <button className="btn-mini-ghost" onClick={() => setEditing(false)}>✕</button>
      </div>
    )
  }

  return (
    <div className="task-item">
      <div
        className="checkbox"
        onClick={() => canEdit && onToggle(obj)}
        style={{
          borderColor: obj.done ? '#10b981' : '#334155',
          background: obj.done ? '#10b981' : 'transparent',
          cursor: canEdit ? 'pointer' : 'default'
        }}
      >
        {obj.done && <span>✓</span>}
      </div>
      <div className="task-content">
        <span className={`task-label ${obj.done ? 'done' : ''}`}>{obj.label}</span>
        <div className="task-meta">
          {obj.url && (
            <a href={obj.url} target="_blank" rel="noopener noreferrer" className="task-link">📚 Ressource →</a>
          )}
          {canEdit && (
            <>
              <button className="link-action" onClick={() => setEditing(true)}>Modifier</button>
              <button className="link-action danger" onClick={() => onDelete(obj.id)}>Supprimer</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function WeekCard({ week, phaseColor, canEdit, onUpdateWeek, onDeleteWeek, onObjectivesChange }) {
  const [expanded, setExpanded] = useState(false)
  const [objectives, setObjectives] = useState(week.objectives || [])
  const [newObjLabel, setNewObjLabel] = useState('')
  const [newObjUrl, setNewObjUrl] = useState('')
  const [showAddObj, setShowAddObj] = useState(false)
  const [editingDates, setEditingDates] = useState(false)
  const [startDate, setStartDate] = useState(week.start_date || '')
  const [endDate, setEndDate] = useState(week.end_date || '')

  const done = objectives.filter(o => o.done).length
  const pct = objectives.length ? Math.round((done / objectives.length) * 100) : 0
  const isComplete = objectives.length > 0 && done === objectives.length

  const toggleObj = async (obj) => {
    const { data } = await supabase.from('objectives').update({ done: !obj.done }).eq('id', obj.id).select().single()
    if (data) {
      const updated = objectives.map(o => o.id === obj.id ? data : o)
      setObjectives(updated)
      onObjectivesChange(week.id, updated)
    }
  }

  const updateObj = async (id, fields) => {
    const { data } = await supabase.from('objectives').update(fields).eq('id', id).select().single()
    if (data) {
      const updated = objectives.map(o => o.id === id ? data : o)
      setObjectives(updated)
      onObjectivesChange(week.id, updated)
    }
  }

  const deleteObj = async (id) => {
    await supabase.from('objectives').delete().eq('id', id)
    const updated = objectives.filter(o => o.id !== id)
    setObjectives(updated)
    onObjectivesChange(week.id, updated)
  }

  const addObj = async (e) => {
    e.preventDefault()
    if (!newObjLabel.trim()) return
    const { data } = await supabase.from('objectives').insert({
      week_id: week.id,
      label: newObjLabel.trim(),
      url: newObjUrl.trim() || null,
      position: objectives.length
    }).select().single()
    if (data) {
      const updated = [...objectives, data]
      setObjectives(updated)
      onObjectivesChange(week.id, updated)
      setNewObjLabel('')
      setNewObjUrl('')
      setShowAddObj(false)
    }
  }

  const saveDates = async () => {
    await onUpdateWeek(week.id, { start_date: startDate || null, end_date: endDate || null })
    setEditingDates(false)
  }

  return (
    <div className={`week-card ${isComplete ? 'complete' : ''}`} style={{ '--phase-color': phaseColor }}>
      <button className="week-header" onClick={() => setExpanded(!expanded)}>
        <div className="week-badge" style={{
          background: isComplete ? phaseColor : 'transparent',
          borderColor: isComplete ? phaseColor : '#334155'
        }}>
          {isComplete ? '✓' : '📅'}
        </div>
        <div className="week-info">
          <span className="week-title">{week.title}</span>
          <div className="week-progress-row">
            {objectives.length > 0 && (
              <>
                <div className="mini-bar">
                  <div className="mini-fill" style={{ width: `${pct}%`, background: phaseColor }} />
                </div>
                <span className="week-count">{done}/{objectives.length}</span>
              </>
            )}
            {(week.start_date || week.end_date) && (
              <span className="week-dates">
                {formatDate(week.start_date)}{week.end_date && ` → ${formatDate(week.end_date)}`}
              </span>
            )}
          </div>
        </div>
        <span className={`chevron ${expanded ? 'open' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="task-list">
          {canEdit && (
            <div className="week-dates-edit">
              {editingDates ? (
                <>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <span>→</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  <button className="btn-mini-primary" onClick={saveDates}>✓</button>
                </>
              ) : (
                <button className="link-action" onClick={() => setEditingDates(true)}>
                  📅 {week.start_date ? 'Modifier les dates' : 'Ajouter des dates'}
                </button>
              )}
              <button className="link-action danger" onClick={() => onDeleteWeek(week.id)} style={{ marginLeft: 'auto' }}>
                Supprimer la semaine
              </button>
            </div>
          )}

          {objectives.length === 0 && !showAddObj && (
            <div className="empty-inline">Aucun objectif pour cette semaine.</div>
          )}

          {objectives.map(obj => (
            <ObjectiveRow
              key={obj.id}
              obj={obj}
              canEdit={canEdit}
              onToggle={toggleObj}
              onDelete={deleteObj}
              onUpdate={updateObj}
            />
          ))}

          {canEdit && (
            showAddObj ? (
              <form className="obj-edit-row" onSubmit={addObj}>
                <input value={newObjLabel} onChange={e => setNewObjLabel(e.target.value)} placeholder="Nouvel objectif" autoFocus />
                <input value={newObjUrl} onChange={e => setNewObjUrl(e.target.value)} placeholder="Lien ressource (optionnel)" />
                <button type="submit" className="btn-mini-primary">✓</button>
                <button type="button" className="btn-mini-ghost" onClick={() => setShowAddObj(false)}>✕</button>
              </form>
            ) : (
              <button className="btn-add-inline" onClick={() => setShowAddObj(true)}>+ Ajouter un objectif</button>
            )
          )}
        </div>
      )}
    </div>
  )
}

function PhaseSection({ phase, canEdit, onAddWeek, onDeleteWeek, onUpdateWeek, onObjectivesChange, onDeletePhase, weeksData }) {
  const [showAddWeek, setShowAddWeek] = useState(false)
  const [newWeekTitle, setNewWeekTitle] = useState('')

  const weeks = weeksData[phase.id] || []
  const allObjectives = weeks.flatMap(w => w.objectives || [])
  const done = allObjectives.filter(o => o.done).length
  const pct = allObjectives.length ? Math.round((done / allObjectives.length) * 100) : 0

  const addWeek = async (e) => {
    e.preventDefault()
    if (!newWeekTitle.trim()) return
    await onAddWeek(phase.id, newWeekTitle.trim())
    setNewWeekTitle('')
    setShowAddWeek(false)
  }

  return (
    <div className="phase-view">
      <div className="phase-header" style={{ borderColor: phase.color + '44' }}>
        <div>
          <div className="phase-months" style={{ color: phase.color }}>{weeks.length} semaine{weeks.length !== 1 ? 's' : ''}</div>
          <div className="phase-title">{phase.title}</div>
        </div>
        <div className="phase-stat">
          <span className="phase-pct" style={{ color: phase.color }}>{pct}<small>%</small></span>
          <span className="phase-sub">{done}/{allObjectives.length}</span>
          {canEdit && (
            <button className="btn-icon-danger" style={{ marginTop: 8 }} onClick={() => onDeletePhase(phase.id)} title="Supprimer la phase">✕</button>
          )}
        </div>
      </div>
      <div className="phase-bar-wrap">
        <div className="phase-bar-fill" style={{ width: `${pct}%`, background: phase.color }} />
      </div>

      <div className="week-list">
        {weeks.map(week => (
          <WeekCard
            key={week.id}
            week={week}
            phaseColor={phase.color}
            canEdit={canEdit}
            onUpdateWeek={onUpdateWeek}
            onDeleteWeek={onDeleteWeek}
            onObjectivesChange={onObjectivesChange}
          />
        ))}

        {canEdit && (
          showAddWeek ? (
            <form className="obj-edit-row" onSubmit={addWeek}>
              <input value={newWeekTitle} onChange={e => setNewWeekTitle(e.target.value)} placeholder="Titre de la semaine" autoFocus />
              <button type="submit" className="btn-mini-primary">✓</button>
              <button type="button" className="btn-mini-ghost" onClick={() => setShowAddWeek(false)}>✕</button>
            </form>
          ) : (
            <button className="btn-add-inline" onClick={() => setShowAddWeek(true)}>+ Ajouter une semaine</button>
          )
        )}
      </div>
    </div>
  )
}

export default function PlanningView({ planningId, onBack }) {
  const { user } = useAuth()
  const [planning, setPlanning] = useState(null)
  const [phases, setPhases] = useState([])
  const [weeksData, setWeeksData] = useState({}) // { phaseId: [weeks with objectives] }
  const [activePhase, setActivePhase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [newPhaseTitle, setNewPhaseTitle] = useState('')
  const [myRole, setMyRole] = useState('readonly')

  const loadAll = useCallback(async () => {
    setLoading(true)

    const { data: planningData } = await supabase.from('plannings').select('*').eq('id', planningId).single()
    setPlanning(planningData)

    const isOwner = planningData?.owner_id === user.id
    if (isOwner) {
      setMyRole('edit')
    } else {
      const { data: collab } = await supabase.from('collaborators').select('role').eq('planning_id', planningId).eq('user_id', user.id).single()
      setMyRole(collab?.role || 'readonly')
    }

    const { data: phasesData } = await supabase.from('phases').select('*').eq('planning_id', planningId).order('position')
    setPhases(phasesData || [])
    if (phasesData?.length && !activePhase) setActivePhase(phasesData[0].id)

    const wd = {}
    for (const phase of (phasesData || [])) {
      const { data: weeks } = await supabase.from('weeks').select('*').eq('phase_id', phase.id).order('position')
      const weeksWithObj = []
      for (const w of (weeks || [])) {
        const { data: objs } = await supabase.from('objectives').select('*').eq('week_id', w.id).order('position')
        weeksWithObj.push({ ...w, objectives: objs || [] })
      }
      wd[phase.id] = weeksWithObj
    }
    setWeeksData(wd)
    setLoading(false)
  }, [planningId, user.id])

  useEffect(() => { loadAll() }, [loadAll])

  const canEdit = myRole === 'edit'

  const addPhase = async (e) => {
    e.preventDefault()
    if (!newPhaseTitle.trim()) return
    const color = PHASE_COLORS[phases.length % PHASE_COLORS.length]
    const { data } = await supabase.from('phases').insert({
      planning_id: planningId,
      title: newPhaseTitle.trim(),
      color,
      position: phases.length
    }).select().single()
    if (data) {
      setPhases([...phases, data])
      setWeeksData({ ...weeksData, [data.id]: [] })
      setActivePhase(data.id)
      setNewPhaseTitle('')
      setShowAddPhase(false)
    }
  }

  const deletePhase = async (phaseId) => {
    if (!confirm('Supprimer cette phase et toutes ses semaines ?')) return
    await supabase.from('phases').delete().eq('id', phaseId)
    const newPhases = phases.filter(p => p.id !== phaseId)
    setPhases(newPhases)
    if (activePhase === phaseId) setActivePhase(newPhases[0]?.id || null)
  }

  const addWeek = async (phaseId, title) => {
    const position = (weeksData[phaseId] || []).length
    const { data } = await supabase.from('weeks').insert({ phase_id: phaseId, title, position }).select().single()
    if (data) {
      setWeeksData({ ...weeksData, [phaseId]: [...(weeksData[phaseId] || []), { ...data, objectives: [] }] })
    }
  }

  const deleteWeek = async (weekId) => {
    if (!confirm('Supprimer cette semaine et ses objectifs ?')) return
    await supabase.from('weeks').delete().eq('id', weekId)
    const updated = { ...weeksData }
    for (const phaseId in updated) {
      updated[phaseId] = updated[phaseId].filter(w => w.id !== weekId)
    }
    setWeeksData(updated)
  }

  const updateWeek = async (weekId, fields) => {
    const { data } = await supabase.from('weeks').update(fields).eq('id', weekId).select().single()
    if (data) {
      const updated = { ...weeksData }
      for (const phaseId in updated) {
        updated[phaseId] = updated[phaseId].map(w => w.id === weekId ? { ...data, objectives: w.objectives } : w)
      }
      setWeeksData(updated)
    }
  }

  const onObjectivesChange = (weekId, objectives) => {
    const updated = { ...weeksData }
    for (const phaseId in updated) {
      updated[phaseId] = updated[phaseId].map(w => w.id === weekId ? { ...w, objectives } : w)
    }
    setWeeksData(updated)
  }

  if (loading) return <div className="app"><div className="empty-state">Chargement...</div></div>
  if (!planning) return <div className="app"><div className="empty-state">Planning introuvable.</div></div>

  const allObjectives = Object.values(weeksData).flat().flatMap(w => w.objectives || [])
  const totalDone = allObjectives.filter(o => o.done).length
  const overallPct = allObjectives.length ? Math.round((totalDone / allObjectives.length) * 100) : 0

  const currentPhase = phases.find(p => p.id === activePhase)

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button className="btn-back" onClick={onBack}>← Mes plannings</button>
            <h1 className="header-title">{planning.title}</h1>
          </div>
          <div className="header-right">
            <div className="overall-pct">{overallPct}<span>%</span></div>
            <div className="overall-sub">{totalDone}/{allObjectives.length} objectifs</div>
            {myRole === 'edit' && planning.owner_id === user.id && (
              <button className="btn-ghost" onClick={() => setShowShare(true)}>👥 Partager</button>
            )}
            {myRole === 'readonly' && <span className="badge-readonly">👁️ Lecture seule</span>}
          </div>
        </div>
        <div className="overall-bar">
          <div className="overall-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <nav className="phase-nav">
          {phases.map(phase => {
            const weeks = weeksData[phase.id] || []
            const objs = weeks.flatMap(w => w.objectives || [])
            const done = objs.filter(o => o.done).length
            const pct = objs.length ? Math.round((done / objs.length) * 100) : 0
            const active = activePhase === phase.id
            return (
              <button key={phase.id}
                className={`phase-tab ${active ? 'active' : ''}`}
                style={active ? { background: phase.color, borderColor: phase.color } : {}}
                onClick={() => setActivePhase(phase.id)}>
                {phase.title}
                <span className="tab-pct">{pct}%</span>
              </button>
            )
          })}
          {canEdit && (
            showAddPhase ? (
              <form className="phase-tab-add-form" onSubmit={addPhase}>
                <input
                  autoFocus
                  value={newPhaseTitle}
                  onChange={e => setNewPhaseTitle(e.target.value)}
                  placeholder="Nom de la phase"
                  onBlur={() => !newPhaseTitle && setShowAddPhase(false)}
                />
              </form>
            ) : (
              <button className="phase-tab phase-tab-add" onClick={() => setShowAddPhase(true)}>+ Phase</button>
            )
          )}
        </nav>
      </header>

      <main className="main">
        {phases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <p>Aucune phase dans ce planning.</p>
            {canEdit && <p className="empty-sub">Ajoute ta première phase pour commencer !</p>}
          </div>
        ) : currentPhase ? (
          <PhaseSection
            phase={currentPhase}
            canEdit={canEdit}
            weeksData={weeksData}
            onAddWeek={addWeek}
            onDeleteWeek={deleteWeek}
            onUpdateWeek={updateWeek}
            onObjectivesChange={onObjectivesChange}
            onDeletePhase={deletePhase}
          />
        ) : null}
      </main>

      {showShare && (
        <ShareModal planningId={planningId} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}

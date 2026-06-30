import { useState } from 'react'
import { EXAMPLE_PLANNING } from '../data/examplePlanning'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function ExampleObjectiveRow({ obj }) {
  return (
    <div className="task-item">
      <div
        className="checkbox"
        style={{
          borderColor: obj.done ? '#10b981' : '#334155',
          background: obj.done ? '#10b981' : 'transparent',
          cursor: 'default'
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
        </div>
      </div>
    </div>
  )
}

function ExampleWeekCard({ week, phaseColor }) {
  const [expanded, setExpanded] = useState(false)
  const done = week.objectives.filter(o => o.done).length
  const pct = week.objectives.length ? Math.round((done / week.objectives.length) * 100) : 0
  const isComplete = week.objectives.length > 0 && done === week.objectives.length

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
            <div className="mini-bar">
              <div className="mini-fill" style={{ width: `${pct}%`, background: phaseColor }} />
            </div>
            <span className="week-count">{done}/{week.objectives.length}</span>
            {(week.start_date || week.end_date) && (
              <span className="week-dates">
                {formatDate(week.start_date)} → {formatDate(week.end_date)}
              </span>
            )}
          </div>
        </div>
        <span className={`chevron ${expanded ? 'open' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="task-list">
          {week.objectives.map(obj => (
            <ExampleObjectiveRow key={obj.id} obj={obj} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExamplePlanningView({ onBack }) {
  const [activePhase, setActivePhase] = useState(EXAMPLE_PLANNING.phases[0].id)

  const allObjectives = EXAMPLE_PLANNING.phases.flatMap(p => p.weeks.flatMap(w => w.objectives))
  const totalDone = allObjectives.filter(o => o.done).length
  const overallPct = Math.round((totalDone / allObjectives.length) * 100)

  const currentPhase = EXAMPLE_PLANNING.phases.find(p => p.id === activePhase)
  const phaseObjectives = currentPhase.weeks.flatMap(w => w.objectives)
  const phaseDone = phaseObjectives.filter(o => o.done).length
  const phasePct = phaseObjectives.length ? Math.round((phaseDone / phaseObjectives.length) * 100) : 0

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button className="btn-back" onClick={onBack}>← Mes plannings</button>
            <h1 className="header-title">{EXAMPLE_PLANNING.title}</h1>
          </div>
          <div className="header-right">
            <div className="overall-pct">{overallPct}<span>%</span></div>
            <div className="overall-sub">{totalDone}/{allObjectives.length} objectifs</div>
            <span className="badge-readonly">👁️ Exemple — lecture seule</span>
          </div>
        </div>
        <div className="overall-bar">
          <div className="overall-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <nav className="phase-nav">
          {EXAMPLE_PLANNING.phases.map(phase => {
            const objs = phase.weeks.flatMap(w => w.objectives)
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
        </nav>
      </header>

      <main className="main">
        <div className="example-banner">
          ✨ Ceci est un planning d'exemple pour te montrer comment fonctionne l'app. Il n'est pas modifiable. Crée ton propre planning depuis le tableau de bord !
        </div>

        <div className="phase-view">
          <div className="phase-header" style={{ borderColor: currentPhase.color + '44' }}>
            <div>
              <div className="phase-months" style={{ color: currentPhase.color }}>
                {currentPhase.weeks.length} semaine{currentPhase.weeks.length !== 1 ? 's' : ''}
              </div>
              <div className="phase-title">{currentPhase.title}</div>
            </div>
            <div className="phase-stat">
              <span className="phase-pct" style={{ color: currentPhase.color }}>{phasePct}<small>%</small></span>
              <span className="phase-sub">{phaseDone}/{phaseObjectives.length}</span>
            </div>
          </div>
          <div className="phase-bar-wrap">
            <div className="phase-bar-fill" style={{ width: `${phasePct}%`, background: currentPhase.color }} />
          </div>

          <div className="week-list">
            {currentPhase.weeks.map(week => (
              <ExampleWeekCard key={week.id} week={week} phaseColor={currentPhase.color} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

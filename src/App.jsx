import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import UpdatePassword from './components/UpdatePassword'
import Dashboard from './components/Dashboard'
import PlanningView from './components/PlanningView'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [currentPlanningId, setCurrentPlanningId] = useState(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (recoveryMode) {
    return <UpdatePassword onDone={() => setRecoveryMode(false)} />
  }

  if (!user) {
    return <Auth />
  }

  if (currentPlanningId) {
    return <PlanningView planningId={currentPlanningId} onBack={() => setCurrentPlanningId(null)} />
  }

  return <Dashboard onOpenPlanning={setCurrentPlanningId} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

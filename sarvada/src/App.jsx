import './App.css'
import MainLayout from './components/MainLayout'
import { FloodRiskProvider } from './state/FloodRiskContext'

const navItems = [
  { id: 'shield', label: 'Shield', icon: 'shield' },
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { id: 'bell', label: 'Alerts', icon: 'bell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function App() {
  return (
    <FloodRiskProvider>
      <MainLayout navItems={navItems} systemStatus="LIVE" damLevel={88} />
    </FloodRiskProvider>
  )
}

export default App

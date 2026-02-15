import { motion, AnimatePresence } from 'framer-motion'
import { Settings, MapPin, Bell, Droplet, Shield, Database, Globe, Check } from 'lucide-react'
import { useState } from 'react'

/**
 * Settings Page - System configuration and preferences
 */
export default function SettingsPage() {
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      criticalAlerts: true,
      warningAlerts: true,
      infoAlerts: false,
      soundEnabled: true,
      emailNotifications: true,
    },
    map: {
      terrainExaggeration: 1.5,
      showLabels: true,
      show3DBuildings: false,
      animationSpeed: 'normal',
    },
    monitoring: {
      updateInterval: 30,
      dataRetention: 90,
      autoRefresh: true,
      predictionRange: 24,
    },
    system: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      units: 'metric',
      theme: 'dark',
    },
  })

  const handleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }))
  }

  const handleSelectChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const handleSave = () => {
    // Save settings logic here (e.g., localStorage, API call)
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        enabled ? 'bg-sky-500' : 'bg-slate-700'
      }`}
      type="button"
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0"
      >
        <h2 className="text-2xl font-bold text-slate-100">System Settings</h2>
        <p className="text-sm text-slate-400">Configure monitoring preferences and system behavior</p>
      </motion.div>

      {/* Settings Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2"
      >
        {/* Notifications Settings */}
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-4">
            <Bell size={20} className="text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-100">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Critical Alerts</p>
                <p className="text-xs text-slate-400">High-priority flood warnings and system failures</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.criticalAlerts}
                onToggle={() => handleToggle('notifications', 'criticalAlerts')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Warning Alerts</p>
                <p className="text-xs text-slate-400">Moderate risk notifications and advisories</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.warningAlerts}
                onToggle={() => handleToggle('notifications', 'warningAlerts')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Info Alerts</p>
                <p className="text-xs text-slate-400">General updates and system information</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.infoAlerts}
                onToggle={() => handleToggle('notifications', 'infoAlerts')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Sound Notifications</p>
                <p className="text-xs text-slate-400">Audio alerts for critical events</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.soundEnabled}
                onToggle={() => handleToggle('notifications', 'soundEnabled')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Email Notifications</p>
                <p className="text-xs text-slate-400">Send alerts to registered email addresses</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.emailNotifications}
                onToggle={() => handleToggle('notifications', 'emailNotifications')}
              />
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-4">
            <MapPin size={20} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-100">Map Display</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Terrain Exaggeration</p>
                <p className="text-xs text-slate-400">3D elevation multiplier: {settings.map.terrainExaggeration}x</p>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={settings.map.terrainExaggeration}
                onChange={(e) => handleSelectChange('map', 'terrainExaggeration', parseFloat(e.target.value))}
                className="w-32 cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Show Labels</p>
                <p className="text-xs text-slate-400">Display landmark and location names</p>
              </div>
              <ToggleSwitch
                enabled={settings.map.showLabels}
                onToggle={() => handleToggle('map', 'showLabels')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">3D Buildings</p>
                <p className="text-xs text-slate-400">Render buildings in 3D perspective</p>
              </div>
              <ToggleSwitch
                enabled={settings.map.show3DBuildings}
                onToggle={() => handleToggle('map', 'show3DBuildings')}
              />
            </div>
            <div>
              <p className="font-medium text-slate-200">Animation Speed</p>
              <select
                value={settings.map.animationSpeed}
                onChange={(e) => handleSelectChange('map', 'animationSpeed', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-4">
            <Droplet size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-slate-100">Monitoring</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-200">Update Interval</p>
              <p className="text-xs text-slate-400">Data refresh rate: {settings.monitoring.updateInterval} seconds</p>
              <input
                type="range"
                min="10"
                max="120"
                step="10"
                value={settings.monitoring.updateInterval}
                onChange={(e) => handleSelectChange('monitoring', 'updateInterval', parseInt(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <p className="font-medium text-slate-200">Data Retention</p>
              <p className="text-xs text-slate-400">Historical data storage: {settings.monitoring.dataRetention} days</p>
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={settings.monitoring.dataRetention}
                onChange={(e) => handleSelectChange('monitoring', 'dataRetention', parseInt(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-amber-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Auto Refresh</p>
                <p className="text-xs text-slate-400">Automatically update data at set intervals</p>
              </div>
              <ToggleSwitch
                enabled={settings.monitoring.autoRefresh}
                onToggle={() => handleToggle('monitoring', 'autoRefresh')}
              />
            </div>
            <div>
              <p className="font-medium text-slate-200">Prediction Range</p>
              <p className="text-xs text-slate-400">Forecast horizon: {settings.monitoring.predictionRange} hours</p>
              <input
                type="range"
                min="6"
                max="72"
                step="6"
                value={settings.monitoring.predictionRange}
                onChange={(e) => handleSelectChange('monitoring', 'predictionRange', parseInt(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-4">
            <Shield size={20} className="text-rose-400" />
            <h3 className="text-lg font-semibold text-slate-100">System</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-200">Language</p>
              <select
                value={settings.system.language}
                onChange={(e) => handleSelectChange('system', 'language', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
            <div>
              <p className="font-medium text-slate-200">Timezone</p>
              <select
                value={settings.system.timezone}
                onChange={(e) => handleSelectChange('system', 'timezone', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div>
              <p className="font-medium text-slate-200">Units</p>
              <select
                value={settings.system.units}
                onChange={(e) => handleSelectChange('system', 'units', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="metric">Metric (meters, °C)</option>
                <option value="imperial">Imperial (feet, °F)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex-shrink-0 pb-4">
          <button 
            onClick={handleSave}
            className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-white transition-all hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/50 active:scale-[0.98]"
          >
            Save Settings
          </button>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3.5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Check size={18} strokeWidth={3} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-100">Settings Saved!</p>
              <p className="text-sm text-emerald-200/80">Your preferences have been updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

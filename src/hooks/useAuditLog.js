import { createContext, createElement, useContext, useMemo, useState } from 'react'

const AuditLogContext = createContext(undefined)

const pad = (num, size = 3) => String(num).padStart(size, '0')

export function AuditLogProvider({ children }) {
  const [logs, setLogs] = useState([])
  const [counter, setCounter] = useState(1)

  const addLog = (entry) => {
    setLogs((prev) => {
      const id = `SRVD-2026-${pad(counter)}`
      const next = {
        id,
        timestamp: new Date().toISOString(),
        ...entry,
      }
      setCounter((c) => c + 1)
      return [next, ...prev]
    })
  }

  const value = useMemo(() => ({ logs, addLog }), [logs])

  return createElement(AuditLogContext.Provider, { value, children })
}

export function useAuditLog() {
  const ctx = useContext(AuditLogContext)
  if (!ctx) throw new Error('useAuditLog must be used within AuditLogProvider')
  return ctx
}

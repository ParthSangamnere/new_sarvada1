import SensorDiagnostics from '../components/SensorDiagnostics'
import CommandAuditLog from '../components/CommandAuditLog'

export default function IntegrityPage() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="min-h-0 flex flex-col">
        <SensorDiagnostics className="flex-1 min-h-0" />
      </div>
      <div className="min-h-0 flex flex-col">
        <CommandAuditLog className="flex-1 min-h-0" />
      </div>
    </div>
  )
}

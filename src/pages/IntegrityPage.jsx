import SensorDiagnostics from '../components/SensorDiagnostics'
import CommandAuditLog from '../components/CommandAuditLog'

export default function IntegrityPage() {
  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SensorDiagnostics />
      </div>
      <div className="lg:col-span-7">
        <CommandAuditLog />
      </div>
    </div>
  )
}

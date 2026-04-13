import { useCallback, useEffect, useState } from 'react'
import { Cpu, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { fetchHardwareDevices, type HardwareDeviceRow } from '@/api/facility'

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        connected
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {connected ? (
        <Wifi className="h-3 w-3" strokeWidth={2} />
      ) : (
        <WifiOff className="h-3 w-3" strokeWidth={2} />
      )}
      {connected ? 'Online' : 'Offline'}
    </span>
  )
}

function DeviceTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    KEYPAD: 'Keypad',
    QR_SCANNER: 'QR Scanner',
    RFID_READER: 'RFID',
    MULTI_INPUT: 'Multi-Input',
  }
  return (
    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      {labels[type] ?? type}
    </span>
  )
}

function formatLastSeen(ts: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString()
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<HardwareDeviceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    fetchHardwareDevices()
      .then(setDevices)
      .catch((e: Error) => setErr(e.message ?? 'Failed to load devices'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
    // Auto-refresh every 15s to update connection status
    const id = setInterval(() => void load(), 15_000)
    return () => clearInterval(id)
  }, [load])

  const online = devices.filter((d) => d.isConnected).length
  const offline = devices.filter((d) => !d.isConnected).length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Device Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Access panel devices connected via WebSocket (port 7788)
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E8E8ED] bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
          <p className="mt-1 text-xs text-gray-500">Total Devices</p>
        </div>
        <div className="rounded-xl border border-[#E8E8ED] bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{online}</p>
          <p className="mt-1 text-xs text-gray-500">Online</p>
        </div>
        <div className="rounded-xl border border-[#E8E8ED] bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-400">{offline}</p>
          <p className="mt-1 text-xs text-gray-500">Offline</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-sm">
        {err && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {loading && devices.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading devices…
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Cpu className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-500">No devices registered</p>
            <p className="max-w-xs text-xs text-gray-400">
              Register a device from the Access Control section. Devices connect to the server
              via WebSocket on port 7788 using their serial number.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Serial No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3">
                    <DeviceTypeBadge type={d.type} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {d.serialNumber ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge connected={d.isConnected} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatLastSeen(d.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">How it works</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
          <li>
            Devices connect to <code className="font-mono text-xs">port 7788</code> via
            WebSocket using the device serial number (SN).
          </li>
          <li>
            When a resident creates a guest access token with password mode, the 6-digit PIN is
            automatically synced to all online devices.
          </li>
          <li>
            Offline devices receive pending PINs the next time they reconnect.
          </li>
          <li>
            Guests enter the 6-digit PIN on the keypad — the device validates locally and logs
            the event to this server.
          </li>
        </ul>
      </div>
    </div>
  )
}

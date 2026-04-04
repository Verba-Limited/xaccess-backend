import { useCallback, useEffect, useState } from 'react'
import { Building2, Plus, RefreshCw } from 'lucide-react'
import { createCommunity, fetchCommunities } from '@/api/admin'
import type { Community } from '@/api/types'

export function CommunityManagement() {
  const [rows, setRows] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [address, setAddress] = useState('')

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchCommunities()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load communities')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createCommunity({
        name: name.trim(),
        slug: slug.trim(),
        address: address.trim() || undefined,
      })
      setName('')
      setSlug('')
      setAddress('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create community')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
        <p className="text-sm text-gray-500">
          Create estates that appear in the mobile app signup list. Super admin only.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-xl border border-surface-border bg-white p-6 shadow-card"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Plus className="h-5 w-5 text-brand" strokeWidth={1.75} />
          Create community
        </h2>
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
              placeholder="Harmony Estate"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Slug (URL-safe)</label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
              placeholder="harmony-estate"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Address (optional)</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
            placeholder="City, region"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Creating…' : 'Create community'}
        </button>
      </form>

      <div className="rounded-xl border border-surface-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Building2 className="h-5 w-5 text-brand" strokeWidth={1.75} />
            All communities
          </h2>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No communities yet. Create one above.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.slug}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                      {c.address ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

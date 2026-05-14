import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { TEAMS, SPECIAL_SECTIONS, ALL_STICKERS, TOTAL_STICKERS } from '../lib/stickers'

// ── Individual sticker card ───────────────────────────────────────
function StickerCard({ sticker, collected, onToggle, editable }) {
  const got = collected.has(sticker.id)
  const isNew = sticker.foil && !got

  return (
    <div
      onClick={() => editable && onToggle(sticker.id)}
      className={`border rounded-lg p-1.5 flex flex-col select-none transition-all duration-100 ${
        editable ? 'cursor-pointer' : 'cursor-default'
      } ${got ? 'bg-green-50 border-green-400' : isNew ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}
      style={{ minHeight: 54 }}
    >
      <div className={`text-[9px] font-semibold mb-1 ${got ? 'text-green-600' : isNew ? 'text-amber-600' : 'text-gray-400'}`}>
        {sticker.id}{got ? ' ✓' : isNew ? ' ★' : ''}
      </div>
      <div className="text-[10.5px] leading-tight text-gray-800 flex-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {sticker.label}
      </div>
    </div>
  )
}

// ── Collapsible section ───────────────────────────────────────────
function StickerSection({ title, stickers, collected, onToggle, editable, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const got = stickers.filter(s => collected.has(s.id)).length
  const pct = Math.round(got / stickers.length * 100)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
      >
        <span className="flex-1 text-sm font-medium text-gray-800">{title}</span>
        <span className="text-xs text-gray-500">{got}/{stickers.length} · {pct}%</span>
        <span className="text-xs text-gray-400 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="sticker-grid mt-2">
          {stickers.map(s => (
            <StickerCard key={s.id} sticker={s} collected={collected} onToggle={onToggle} editable={editable} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────
function OverviewTab({ collected }) {
  const got = collected.size
  const pct = Math.round(got / TOTAL_STICKERS * 100)

  const cats = [
    { name: 'Introduction (9)', stickers: SPECIAL_SECTIONS.intro.stickers },
    { name: 'FIFA Museum (11)', stickers: SPECIAL_SECTIONS.museum.stickers },
    { name: 'All 48 teams (960)', stickers: TEAMS.flatMap(t => t.stickers) },
    { name: 'Coca-Cola exclusives (12)', stickers: SPECIAL_SECTIONS.cc.stickers },
  ]

  const nearComplete = TEAMS
    .map(t => ({ ...t, got: t.stickers.filter(s => collected.has(s.id)).length }))
    .filter(t => t.got > 0 && t.got < t.stickers.length)
    .sort((a, b) => (b.got / b.stickers.length) - (a.got / a.stickers.length))
    .slice(0, 6)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { value: got, label: 'Collected', color: 'text-green-600' },
          { value: TOTAL_STICKERS - got, label: 'Still missing', color: 'text-red-500' },
          { value: `${pct}%`, label: 'Complete', color: 'text-gray-900' },
          { value: TOTAL_STICKERS, label: 'Total stickers', color: 'text-amber-600' },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-3xl font-semibold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Progress by section</h3>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        {cats.map((c, i) => {
          const cGot = c.stickers.filter(s => collected.has(s.id)).length
          const cPct = Math.round(cGot / c.stickers.length * 100)
          return (
            <div key={c.name} className={`flex items-center gap-3 px-4 py-3 ${i < cats.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="flex-1 text-sm text-gray-600">{c.name}</span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${cPct}%` }} />
              </div>
              <span className="text-xs text-gray-500 min-w-[40px] text-right">{cGot}/{c.stickers.length}</span>
            </div>
          )
        })}
      </div>

      {nearComplete.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nearly complete</h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {nearComplete.map((t, i) => {
              const p = Math.round(t.got / t.stickers.length * 100)
              return (
                <div key={t.code} className={`flex items-center gap-3 px-4 py-3 ${i < nearComplete.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-lg">{t.flag}</span>
                  <span className="flex-1 text-sm">{t.name}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 min-w-[32px] text-right">{t.got}/{t.stickers.length}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Album tab ─────────────────────────────────────────────────────
function AlbumTab({ collected, onToggle, editable }) {
  const [search, setSearch] = useState('')
  const lq = search.toLowerCase().trim()

  const searchResults = useMemo(() => {
    if (!lq) return null
    return ALL_STICKERS.filter(s =>
      s.id.toLowerCase().includes(lq) ||
      s.label.toLowerCase().includes(lq) ||
      s.team.toLowerCase().includes(lq) ||
      s.code.toLowerCase().includes(lq)
    )
  }, [lq])

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by code (BRA14), player name, or country…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {searchResults ? (
        <div>
          <p className="text-xs text-gray-500 mb-2">{searchResults.length} sticker{searchResults.length !== 1 ? 's' : ''} found</p>
          <div className="sticker-grid">
            {searchResults.map(s => <StickerCard key={s.id} sticker={s} collected={collected} onToggle={onToggle} editable={editable} />)}
          </div>
        </div>
      ) : (
        <>
          {Object.values(SPECIAL_SECTIONS).map(sec => (
            <StickerSection key={sec.key} title={sec.title} stickers={sec.stickers} collected={collected} onToggle={onToggle} editable={editable} defaultOpen />
          ))}
          {TEAMS.map(team => (
            <StickerSection key={team.code} title={`${team.flag} ${team.name}`} stickers={team.stickers} collected={collected} onToggle={onToggle} editable={editable} />
          ))}
        </>
      )}
    </div>
  )
}

// ── Collect tab ───────────────────────────────────────────────────
function CollectTab({ collected, onToggle, editable }) {
  const [query, setQuery] = useState('')
  const lq = query.toLowerCase().trim()

  const results = useMemo(() => {
    if (!lq) return []
    return ALL_STICKERS.filter(s =>
      s.id.toLowerCase().startsWith(lq) ||
      s.id.toLowerCase() === lq ||
      s.label.toLowerCase().includes(lq) ||
      s.team.toLowerCase().includes(lq)
    ).slice(0, 24)
  }, [lq])

  function markAll() {
    results.forEach(s => { if (!collected.has(s.id)) onToggle(s.id) })
  }

  const allSameTeam = results.length > 1 && results.every(r => r.code === results[0].code)

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a code (ARG10) or player name (Messi)…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        autoFocus
      />
      {!lq && (
        <p className="text-sm text-gray-400 py-2">
          Type a sticker code like <code className="bg-gray-100 px-1 rounded">BRA14</code> or a player name to find and mark stickers.
        </p>
      )}
      {editable && allSameTeam && (
        <button onClick={markAll} className="w-full text-sm border border-gray-200 rounded-lg py-2 mb-3 hover:bg-gray-50 transition-colors text-gray-600">
          Mark all {results[0].team} stickers as collected
        </button>
      )}
      <div className="space-y-1.5">
        {results.map(s => {
          const got = collected.has(s.id)
          return (
            <div
              key={s.id}
              onClick={() => editable && onToggle(s.id)}
              className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${editable ? 'cursor-pointer' : ''} ${got ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <span className={`text-sm font-semibold min-w-[52px] ${got ? 'text-green-600' : 'text-gray-400'}`}>{s.id}</span>
              <div className="flex-1">
                <div className="text-sm text-gray-800">{s.label}</div>
                <div className="text-xs text-gray-400">{s.flag} {s.team}</div>
              </div>
              {editable && <span className={`text-xs font-medium ${got ? 'text-green-600' : 'text-gray-400'}`}>{got ? '✓ Got' : '+ Mark'}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Teams tab ─────────────────────────────────────────────────────
function TeamsTab({ collected }) {
  const sections = [
    { key: 'intro', title: 'Introduction', flag: '⭐', stickers: SPECIAL_SECTIONS.intro.stickers },
    { key: 'museum', title: 'FIFA Museum', flag: '🏆', stickers: SPECIAL_SECTIONS.museum.stickers },
    ...TEAMS.map(t => ({ key: t.code, title: t.name, flag: t.flag, stickers: t.stickers })),
    { key: 'cc', title: 'Coca-Cola Exclusives', flag: '🥤', stickers: SPECIAL_SECTIONS.cc.stickers },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {sections.map((s, i) => {
        const got = s.stickers.filter(st => collected.has(st.id)).length
        const pct = Math.round(got / s.stickers.length * 100)
        return (
          <div key={s.key} className={`flex items-center gap-3 px-4 py-3 ${i < sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <span className="text-lg w-7 text-center">{s.flag}</span>
            <span className="flex-1 text-sm text-gray-700">{s.title}</span>
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 min-w-[36px] text-right">{got}/{s.stickers.length}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Tracker component ────────────────────────────────────────
export default function Tracker({ userId, editable = false }) {
  const [collected, setCollected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const pendingToggles = useRef(new Set())

  // Load collection from Supabase
  useEffect(() => {
    if (!userId) return
    async function load() {
      const { data, error } = await supabase
        .from('collections')
        .select('sticker_id')
        .eq('user_id', userId)
      if (!error && data) setCollected(new Set(data.map(r => r.sticker_id)))
      setLoading(false)
    }
    load()
  }, [userId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`collection:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collections', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCollected(prev => new Set([...prev, payload.new.sticker_id]))
        } else if (payload.eventType === 'DELETE') {
          setCollected(prev => { const next = new Set(prev); next.delete(payload.old.sticker_id); return next })
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1800)
  }

  const handleToggle = useCallback(async (stickerId) => {
    if (!editable || pendingToggles.current.has(stickerId)) return
    pendingToggles.current.add(stickerId)

    const wasCollected = collected.has(stickerId)
    // Optimistic update
    setCollected(prev => {
      const next = new Set(prev)
      wasCollected ? next.delete(stickerId) : next.add(stickerId)
      return next
    })
    showToast(wasCollected ? 'Removed' : 'Got it ✓')

    // Persist to Supabase
    if (wasCollected) {
      await supabase.from('collections').delete().eq('user_id', userId).eq('sticker_id', stickerId)
    } else {
      await supabase.from('collections').insert({ user_id: userId, sticker_id: stickerId })
    }
    pendingToggles.current.delete(stickerId)
  }, [collected, editable, userId])

  const pct = Math.round(collected.size / TOTAL_STICKERS * 100)

  const tabs = ['overview', 'album', 'collect', 'teams']

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Loading collection…</div>

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-gray-700">{collected.size} / {TOTAL_STICKERS} stickers</span>
          <span className="text-sm text-gray-500">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 text-sm capitalize transition-colors ${activeTab === t ? 'border-b-2 border-green-600 font-medium text-green-700 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab collected={collected} />}
      {activeTab === 'album' && <AlbumTab collected={collected} onToggle={handleToggle} editable={editable} />}
      {activeTab === 'collect' && editable && <CollectTab collected={collected} onToggle={handleToggle} editable={editable} />}
      {activeTab === 'collect' && !editable && <div className="text-sm text-gray-400 py-4">View-only mode.</div>}
      {activeTab === 'teams' && <TeamsTab collected={collected} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

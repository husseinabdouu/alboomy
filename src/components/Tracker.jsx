import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { TEAMS, SPECIAL_SECTIONS, ALL_STICKERS, TOTAL_STICKERS } from '../lib/stickers'
import { Avatar, ProgressBar, StatCard, Toast, EmptyState, PageLoader } from './ui'

// ── Sticker card ──────────────────────────────────────────────────
function StickerCard({ sticker, collected, onToggle, editable }) {
  const got = collected.has(sticker.id)
  const isNew = sticker.foil && !got
  return (
    <div
      onClick={() => editable && onToggle(sticker.id)}
      className={`sticker-card ${got ? 'collected' : ''} ${isNew ? 'foil' : ''} ${editable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`text-[9px] font-semibold mb-1 leading-none ${got ? 'text-brand-500 dark:text-brand-400' : isNew ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
        {sticker.id}{got ? ' ✓' : isNew ? ' ★' : ''}
      </div>
      <div className="text-[10.5px] leading-tight text-slate-700 dark:text-slate-300 flex-1 overflow-hidden line-clamp-3">
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
  const complete = got === stickers.length

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(o => !o)} className="section-header w-full">
        <span className="flex-1 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</span>
        {complete && <span className="badge-green mr-2">Complete ✓</span>}
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">{got}/{stickers.length} · {pct}%</span>
        <ProgressBar value={got} max={stickers.length} className="w-16" size="sm" />
        <svg className={`w-4 h-4 text-slate-400 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
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
    { name: 'Introduction', stickers: SPECIAL_SECTIONS.intro.stickers },
    { name: 'FIFA Museum', stickers: SPECIAL_SECTIONS.museum.stickers },
    { name: '48 teams', stickers: TEAMS.flatMap(t => t.stickers) },
    { name: 'Coca-Cola exclusives', stickers: SPECIAL_SECTIONS.cc.stickers },
  ]

  const teamStats = TEAMS.map(t => ({
    ...t,
    got: t.stickers.filter(s => collected.has(s.id)).length,
  }))

  const completedTeams = teamStats.filter(t => t.got === t.stickers.length).length
  const nearComplete = teamStats.filter(t => t.got > 0 && t.got < t.stickers.length)
    .sort((a, b) => (b.got / b.stickers.length) - (a.got / a.stickers.length))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard value={got} label="Stickers collected" color="brand" />
        <StatCard value={TOTAL_STICKERS - got} label="Still missing" color="red" />
        <StatCard value={`${pct}%`} label="Album complete" />
        <StatCard value={completedTeams} label="Full teams" color="green" sublabel="out of 48" />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Progress by section</h3>
        <div className="card overflow-hidden">
          {cats.map((c, i) => {
            const cGot = c.stickers.filter(s => collected.has(s.id)).length
            const cPct = Math.round(cGot / c.stickers.length * 100)
            return (
              <div key={c.name} className={`flex items-center gap-3 px-4 py-3 ${i < cats.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{c.name}</span>
                <ProgressBar value={cGot} max={c.stickers.length} className="w-20" />
                <span className="text-xs text-slate-500 dark:text-slate-500 min-w-[52px] text-right">{cGot}/{c.stickers.length}</span>
              </div>
            )
          })}
        </div>
      </div>

      {nearComplete.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Almost complete</h3>
          <div className="card overflow-hidden">
            {nearComplete.map((t, i) => (
              <div key={t.code} className={`flex items-center gap-3 px-4 py-3 ${i < nearComplete.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                <span className="text-xl w-7 text-center flex-shrink-0">{t.flag}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{t.name}</span>
                <span className="text-xs text-slate-500">missing {t.stickers.length - t.got}</span>
                <ProgressBar value={t.got} max={t.stickers.length} className="w-16" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Album tab ─────────────────────────────────────────────────────
function AlbumTab({ collected, onToggle, editable }) {
  const [search, setSearch] = useState('')
  const lq = search.toLowerCase().trim()

  const results = useMemo(() => {
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
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sticker code, player name, or country…"
          className="input pl-10"
        />
      </div>

      {results ? (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.length === 0 ? (
            <EmptyState icon="🔍" title="No stickers found" description="Try searching by code like BRA14, or a player's name" />
          ) : (
            <div className="sticker-grid">
              {results.map(s => <StickerCard key={s.id} sticker={s} collected={collected} onToggle={onToggle} editable={editable} />)}
            </div>
          )}
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
function CollectTab({ collected, onToggle }) {
  const [query, setQuery] = useState('')
  const lq = query.toLowerCase().trim()

  const results = useMemo(() => {
    if (!lq) return []
    return ALL_STICKERS.filter(s =>
      s.id.toLowerCase().startsWith(lq) ||
      s.id.toLowerCase() === lq ||
      s.label.toLowerCase().includes(lq) ||
      s.team.toLowerCase().includes(lq)
    ).slice(0, 30)
  }, [lq])

  const allSameTeam = results.length > 1 && results.every(r => r.code === results[0].code)

  function markAll() {
    results.forEach(s => { if (!collected.has(s.id)) onToggle(s.id) })
  }

  return (
    <div>
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a code like ARG10 or a player name…"
          className="input pl-10"
          autoFocus
        />
      </div>

      {!lq && (
        <div className="card p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Type a sticker code like <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">BRA14</span> or a player name like <span className="font-semibold text-brand-600 dark:text-brand-400">Messi</span> to mark stickers as collected.
          </p>
        </div>
      )}

      {lq && results.length === 0 && (
        <EmptyState icon="🔍" title="No matches" description="Try a different code or player name" />
      )}

      {allSameTeam && (
        <button onClick={markAll} className="w-full btn-secondary mb-3 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950">
          Mark all {results[0].team} stickers as collected
        </button>
      )}

      <div className="space-y-2">
        {results.map(s => {
          const got = collected.has(s.id)
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 card rounded-xl text-left transition-all hover:shadow-card-hover ${got ? 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800' : ''}`}
            >
              <span className={`text-sm font-bold min-w-[52px] ${got ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`}>{s.id}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.label}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">{s.flag} {s.team}</div>
              </div>
              <div className={`text-xs font-semibold flex-shrink-0 ${got ? 'text-brand-500' : 'text-slate-400'}`}>
                {got ? '✓ Got it' : '+ Mark'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Teams tab ─────────────────────────────────────────────────────
function TeamsTab({ collected }) {
  const [sort, setSort] = useState('alpha') // 'alpha' | 'progress' | 'missing'

  const sections = [
    { key: 'intro', title: 'Introduction', flag: '⭐', stickers: SPECIAL_SECTIONS.intro.stickers },
    { key: 'museum', title: 'FIFA Museum', flag: '🏆', stickers: SPECIAL_SECTIONS.museum.stickers },
    ...TEAMS.map(t => ({ key: t.code, title: t.name, flag: t.flag, stickers: t.stickers })),
    { key: 'cc', title: 'Coca-Cola', flag: '🥤', stickers: SPECIAL_SECTIONS.cc.stickers },
  ].map(s => ({ ...s, got: s.stickers.filter(st => collected.has(st.id)).length }))

  const sorted = [...sections].sort((a, b) => {
    if (sort === 'progress') return (b.got / b.stickers.length) - (a.got / a.stickers.length)
    if (sort === 'missing') return (a.stickers.length - a.got) - (b.stickers.length - b.got)
    return a.title.localeCompare(b.title)
  })

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[['alpha', 'A–Z'], ['progress', 'Progress'], ['missing', 'Missing']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSort(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === val ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {sorted.map((s, i) => {
          const pct = Math.round(s.got / s.stickers.length * 100)
          const complete = s.got === s.stickers.length
          return (
            <div key={s.key} className={`flex items-center gap-3 px-4 py-3 ${i < sorted.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''} ${complete ? 'bg-emerald-50 dark:bg-emerald-950' : ''}`}>
              <span className="text-xl w-7 text-center flex-shrink-0">{s.flag}</span>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{s.title}</span>
              {complete && <span className="badge-green text-xs">✓</span>}
              <ProgressBar value={s.got} max={s.stickers.length} className="w-16 hidden sm:block" />
              <span className="text-xs text-slate-400 dark:text-slate-500 min-w-[36px] text-right">{s.got}/{s.stickers.length}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Tracker ──────────────────────────────────────────────────
export default function Tracker({ userId, editable = false }) {
  const [collected, setCollected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState({ msg: '', show: false })
  const toastTimer = useRef(null)
  const pending = useRef(new Set())

  useEffect(() => {
    if (!userId) return
    supabase.from('collections').select('sticker_id').eq('user_id', userId)
      .then(({ data, error }) => {
        if (!error && data) setCollected(new Set(data.map(r => r.sticker_id)))
        setLoading(false)
      })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel(`col:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collections', filter: `user_id=eq.${userId}` }, payload => {
        if (payload.eventType === 'INSERT') setCollected(p => new Set([...p, payload.new.sticker_id]))
        else if (payload.eventType === 'DELETE') setCollected(p => { const n = new Set(p); n.delete(payload.old.sticker_id); return n })
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  function showToast(msg) {
    setToast({ msg, show: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 1800)
  }

  const handleToggle = useCallback(async (stickerId) => {
    if (!editable || pending.current.has(stickerId)) return
    pending.current.add(stickerId)
    const wasCollected = collected.has(stickerId)
    setCollected(prev => {
      const next = new Set(prev)
      wasCollected ? next.delete(stickerId) : next.add(stickerId)
      return next
    })
    showToast(wasCollected ? 'Removed' : 'Got it ✓')
    if (wasCollected) {
      await supabase.from('collections').delete().eq('user_id', userId).eq('sticker_id', stickerId)
    } else {
      await supabase.from('collections').insert({ user_id: userId, sticker_id: stickerId })
    }
    pending.current.delete(stickerId)
  }, [collected, editable, userId])

  const pct = Math.round(collected.size / TOTAL_STICKERS * 100)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'album', label: 'Album' },
    ...(editable ? [{ id: 'collect', label: 'Collect' }] : []),
    { id: 'teams', label: 'Teams' },
  ]

  if (loading) return <PageLoader />

  return (
    <div>
      {/* Progress header */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{collected.size} / {TOTAL_STICKERS} stickers</span>
          <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-500' : 'text-brand-600 dark:text-brand-400'}`}>{pct}%</span>
        </div>
        <ProgressBar value={collected.size} max={TOTAL_STICKERS} size="lg" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5 -mx-4 px-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab collected={collected} />}
      {activeTab === 'album' && <AlbumTab collected={collected} onToggle={handleToggle} editable={editable} />}
      {activeTab === 'collect' && <CollectTab collected={collected} onToggle={handleToggle} />}
      {activeTab === 'teams' && <TeamsTab collected={collected} />}

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}

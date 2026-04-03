import { useState, useRef, useCallback } from 'react'
import './App.css'

// ── Seed data (demo) ──────────────────────────────────────────────────────────
const SEED = [
  { id: 1, stock: '삼성전자', rate: 3.2,  date: '2026-03-05', image: null },
  { id: 2, stock: 'SK하이닉스', rate: -1.8, date: '2026-03-07', image: null },
  { id: 3, stock: '카카오',   rate: 5.1,  date: '2026-03-10', image: null },
  { id: 4, stock: 'NAVER',   rate: -0.6, date: '2026-03-12', image: null },
  { id: 5, stock: '현대차',   rate: 2.4,  date: '2026-03-14', image: null },
  { id: 6, stock: '삼성전자', rate: -2.1, date: '2026-03-18', image: null },
  { id: 7, stock: 'LG에너지솔루션', rate: 7.3, date: '2026-03-21', image: null },
  { id: 8, stock: 'SK하이닉스', rate: 4.0, date: '2026-03-25', image: null },
  { id: 9, stock: '카카오',   rate: -3.3, date: '2026-04-01', image: null },
  { id: 10, stock: 'NAVER',  rate: 1.9,  date: '2026-04-02', image: null },
]

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (rate) => `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`
const sign = (rate) => (rate >= 0 ? 'positive' : 'negative')

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

// ── EntryModal ────────────────────────────────────────────────────────────────
function EntryModal({ entry, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {entry.image
          ? <img src={entry.image} alt={entry.stock} className="modal-img" />
          : <div className="modal-img-placeholder">📈</div>
        }
        <div className="modal-body">
          <div className="modal-header">
            <div>
              <div className="modal-stock">{entry.stock}</div>
              <div className="modal-date">{formatDateLabel(entry.date)}</div>
            </div>
            <div className={`modal-rate ${sign(entry.rate)}`}>{fmt(entry.rate)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

// ── UploadView ────────────────────────────────────────────────────────────────
function UploadView({ entries, onAdd }) {
  const [dragging, setDragging] = useState(false)
  const [image, setImage] = useState(null)
  const [stock, setStock] = useState('')
  const [rate, setRate] = useState('')
  const [selected, setSelected] = useState(null)
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setImage(url)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const rateNum = parseFloat(rate)
  const rateValid = rate !== '' && !isNaN(rateNum)
  const canSubmit = stock.trim() !== '' && rateValid

  const handleSubmit = () => {
    if (!canSubmit) return
    onAdd({ stock: stock.trim(), rate: rateNum, date: today(), image })
    setStock('')
    setRate('')
    setImage(null)
  }

  return (
    <>
      <div className="upload-view">
        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !image && inputRef.current.click()}
        >
          {image ? (
            <>
              <img src={image} alt="preview" className="drop-zone-preview" />
              <div className="drop-zone-overlay">
                <button className="change-image-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}>
                  이미지 변경
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="drop-zone-icon">📷</div>
              <div className="drop-zone-text">
                <h3>캡처 이미지 업로드</h3>
                <p>클릭하거나 드래그해서 추가</p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Form Panel */}
        <div className="form-panel">
          <div className="form-panel-title">거래 기록</div>

          <div className="form-group">
            <label className="form-label">종목명</label>
            <input
              className="form-input"
              placeholder="예) 삼성전자, NAVER"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">수익률</label>
            <div className="rate-input-wrap">
              <input
                className="form-input"
                type="number"
                step="0.1"
                placeholder="예) 3.5 또는 -2.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <span className="rate-suffix">%</span>
            </div>
            {rateValid && (
              <div className={`rate-preview ${sign(rateNum)}`}>
                {rateNum > 0 ? '▲' : '▼'} {fmt(rateNum)}
              </div>
            )}
          </div>

          <div className="date-info">
            <span>📅</span>
            <span>오늘 — {formatDateLabel(today())}</span>
          </div>

          <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
            일기 저장
          </button>
        </div>
      </div>

      {/* Recent entries */}
      <div className="recent-section">
        <div className="section-header">
          <span className="section-title">최근 기록</span>
          <span className="section-count">{entries.length}개</span>
        </div>
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>아직 기록이 없습니다</p>
          </div>
        ) : (
          <div className="entries-grid">
            {[...entries].reverse().map((e) => (
              <div key={e.id} className="entry-card" onClick={() => setSelected(e)}>
                {e.image
                  ? <img src={e.image} alt={e.stock} className="entry-card-img" />
                  : <div className="entry-card-img-placeholder">📈</div>
                }
                <div className="entry-card-body">
                  <div className="entry-card-stock">{e.stock}</div>
                  <div className="entry-card-meta">
                    <span className="entry-card-date">{e.date}</span>
                    <span className={`rate-badge ${sign(e.rate)}`}>{fmt(e.rate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <EntryModal entry={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

// ── CalendarView ──────────────────────────────────────────────────────────────
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function CalendarView({ entries }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [selected, setSelected] = useState(null)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Build calendar days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false })
  }

  const todayStr = today()
  const pad = (n) => String(n).padStart(2, '0')

  const entriesForDay = (d) => {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    return entries.filter((e) => e.date === dateStr)
  }

  // Month entries for stats & compare
  const monthEntries = entries.filter((e) => {
    const [y, m] = e.date.split('-').map(Number)
    return y === year && m === month + 1
  })

  const totalWins = monthEntries.filter((e) => e.rate > 0).length
  const totalLoss = monthEntries.filter((e) => e.rate < 0).length
  const avgRate = monthEntries.length
    ? (monthEntries.reduce((s, e) => s + e.rate, 0) / monthEntries.length)
    : null

  // Stock aggregation for compare
  const stockMap = {}
  monthEntries.forEach(({ stock, rate }) => {
    if (!stockMap[stock]) stockMap[stock] = { total: 0, count: 0 }
    stockMap[stock].total += rate
    stockMap[stock].count += 1
  })
  const stockStats = Object.entries(stockMap)
    .map(([name, { total, count }]) => ({ name, avg: total / count }))
    .sort((a, b) => b.avg - a.avg)

  const maxAbs = stockStats.length
    ? Math.max(...stockStats.map((s) => Math.abs(s.avg)))
    : 1

  const monthLabel = new Date(year, month).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className="calendar-view">
      {/* Controls */}
      <div className="calendar-controls">
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>
        <div className="cal-summary">
          <div className="cal-stat">
            <span className="cal-stat-label">기록</span>
            <span className={`cal-stat-value neutral`}>{monthEntries.length}건</span>
          </div>
          <div className="cal-stat">
            <span className="cal-stat-label">승 / 패</span>
            <span className="cal-stat-value neutral">
              <span style={{ color: 'var(--accent-green)' }}>{totalWins}</span>
              {' / '}
              <span style={{ color: 'var(--accent-red)' }}>{totalLoss}</span>
            </span>
          </div>
          {avgRate !== null && (
            <div className="cal-stat">
              <span className="cal-stat-label">평균 수익률</span>
              <span className={`cal-stat-value ${sign(avgRate)}`}>{fmt(avgRate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="calendar-grid-wrap">
        <div className="calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="weekday-header">{d}</div>
          ))}
        </div>
        <div className="calendar-days">
          {cells.map((cell, idx) => {
            const isToday = cell.current &&
              `${year}-${pad(month + 1)}-${pad(cell.day)}` === todayStr
            const dayEntries = cell.current ? entriesForDay(cell.day) : []
            return (
              <div
                key={idx}
                className={`cal-day ${!cell.current ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <span className="day-num">{cell.day}</span>
                <div className="day-entries">
                  {dayEntries.map((e) => (
                    <div
                      key={e.id}
                      className={`day-entry-chip ${sign(e.rate)}`}
                      onClick={() => setSelected(e)}
                    >
                      <span className="chip-stock">{e.stock}</span>
                      <span className={`chip-rate ${sign(e.rate)}`}>{fmt(e.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stock Compare */}
      {stockStats.length > 0 && (
        <div className="stock-compare">
          <div className="stock-compare-title">종목별 평균 수익률</div>
          <div className="stock-bars">
            {stockStats.map(({ name, avg }) => {
              const pct = (Math.abs(avg) / maxAbs) * 46  // max 46% of half track
              return (
                <div key={name} className="stock-bar-row">
                  <span className="stock-bar-label">{name}</span>
                  <div className="stock-bar-track">
                    <div className="zero-line" />
                    <div
                      className={`stock-bar-fill ${sign(avg)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`stock-bar-value ${sign(avg)}`}>{fmt(avg)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {monthEntries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>이 달의 거래 기록이 없습니다</p>
        </div>
      )}

      {selected && <EntryModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('upload')
  const [entries, setEntries] = useState(SEED)
  const nextId = useRef(SEED.length + 1)

  const addEntry = (entry) => {
    setEntries((prev) => [...prev, { ...entry, id: nextId.current++ }])
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <span className="header-label">Stock Diary</span>
          <span className="header-name">매매 일기</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${tab === 'upload' ? 'active' : ''}`}
            onClick={() => setTab('upload')}
          >
            기록하기
          </button>
          <button
            className={`nav-btn ${tab === 'calendar' ? 'active' : ''}`}
            onClick={() => setTab('calendar')}
          >
            달력 보기
          </button>
        </nav>
      </header>

      {tab === 'upload'
        ? <UploadView entries={entries} onAdd={addEntry} />
        : <CalendarView entries={entries} />
      }
    </div>
  )
}

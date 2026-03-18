'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WORKOUT, IMGS, TOTAL_SECONDS, CIRCUMFERENCE, type Exercise } from '@/lib/workoutData'

type Screen = 'start' | 'workout' | 'done'

export default function WorkoutApp() {
  const [screen, setScreen] = useState<Screen>('start')
  const [idx, setIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idxRef = useRef(0)
  const timeLeftRef = useRef(60)
  const pausedRef = useRef(false)
  const elapsedRef = useRef(0)
  const voiceOnRef = useRef(true)

  // Keep refs in sync
  useEffect(() => { idxRef.current = idx }, [idx])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { elapsedRef.current = elapsed }, [elapsed])
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  const currentEx = WORKOUT[idx]
  const nextEx = WORKOUT[idx + 1] ?? null
  const isRest = currentEx?.type === 'rest'
  const totalDur = currentEx?.dur ?? 60
  const ringOffset = CIRCUMFERENCE * (1 - timeLeft / totalDur)

  // ── VOICE ──────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceOnRef.current || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => /Samantha|Google US|Alex|Karen|Moira/.test(v.name))
    if (preferred) u.voice = preferred
    window.speechSynthesis.speak(u)
  }, [])

  // ── TIMER ──────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return

      const newTime = timeLeftRef.current - 1
      const newElapsed = elapsedRef.current + 1

      setTimeLeft(newTime)
      setElapsed(newElapsed)
      timeLeftRef.current = newTime
      elapsedRef.current = newElapsed

      const ex = WORKOUT[idxRef.current]
      if (newTime === 10 && ex.type === 'work') {
        setTimeout(() => speak('Ten seconds left! Push through!'), 0)
      }
      if (newTime === 5) {
        setTimeout(() => speak('Five, four, three, two, one!'), 0)
      }

      if (newTime <= 0) {
        const nextIdx = idxRef.current + 1
        if (nextIdx < WORKOUT.length) {
          idxRef.current = nextIdx
          setIdx(nextIdx)
          setImgLoaded(false)
          setTimeLeft(WORKOUT[nextIdx].dur)
          timeLeftRef.current = WORKOUT[nextIdx].dur
          setTimeout(() => speak(WORKOUT[nextIdx].voice), 100)
        } else {
          stopTimer()
          setScreen('done')
          setTimeout(() => speak('Workout complete! You absolutely crushed it. Amazing work!'), 100)
        }
      }
    }, 1000)
  }, [speak, stopTimer])

  // ── CONTROLS ───────────────────────────────────────────────
  const startWorkout = useCallback(() => {
    idxRef.current = 0
    elapsedRef.current = 0
    timeLeftRef.current = WORKOUT[0].dur
    setIdx(0)
    setElapsed(0)
    setTimeLeft(WORKOUT[0].dur)
    setPaused(false)
    pausedRef.current = false
    setImgLoaded(false)
    setScreen('workout')
    startTimer()
    setTimeout(() => speak("Let's go! Fifteen minute dumbbell workout. " + WORKOUT[0].voice), 200)
  }, [startTimer, speak])

  const togglePause = useCallback(() => {
    const next = !pausedRef.current
    setPaused(next)
    pausedRef.current = next
    speak(next ? 'Paused.' : "Let's go!")
  }, [speak])

  const skipEx = useCallback(() => {
    const nextIdx = idxRef.current + 1
    if (nextIdx < WORKOUT.length) {
      idxRef.current = nextIdx
      setIdx(nextIdx)
      setImgLoaded(false)
      setTimeLeft(WORKOUT[nextIdx].dur)
      timeLeftRef.current = WORKOUT[nextIdx].dur
      speak(WORKOUT[nextIdx].voice)
    } else {
      stopTimer()
      setScreen('done')
      speak('Workout complete! Amazing work!')
    }
  }, [speak, stopTimer])

  const confirmStop = useCallback(() => {
    if (window.confirm('Stop workout? Progress will be lost.')) {
      stopTimer()
      window.speechSynthesis.cancel()
      setScreen('start')
      setPaused(false)
    }
  }, [stopTimer])

  const resetWorkout = useCallback(() => {
    stopTimer()
    window.speechSynthesis.cancel()
    setScreen('start')
    setIdx(0)
    setElapsed(0)
    setPaused(false)
  }, [stopTimer])

  useEffect(() => () => stopTimer(), [stopTimer])

  // ── PROGRESS ───────────────────────────────────────────────
  const pct = Math.min((elapsed / TOTAL_SECONDS) * 100, 100)
  const totalMins = Math.floor(TOTAL_SECONDS / 60)
  const elapsedMins = Math.floor(elapsed / 60)
  const elapsedSecs = elapsed % 60

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --bg:#ECF1F7; --surface:#E1E8EF; --card:#FFFFFF;
          --accent:#DC373E; --accent2:#C42F36;
          --text:#0F3154; --muted:#6B7D8E; --border:#E1E8EF;
          --rest:#1A4268;
        }
        .workout-root { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100dvh; display:flex; flex-direction:column; align-items:center; }
        .w-app { width:100%; max-width:480px; min-height:100dvh; display:flex; flex-direction:column; padding:0 20px 40px; }
        .w-header { display:flex; align-items:center; justify-content:space-between; padding:22px 0 14px; border-bottom:1px solid var(--border); }
        .w-logo { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; color:var(--text); }
        .w-meta { font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }

        /* START */
        .w-start { flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; gap:22px; padding:24px 0; }
        .w-hero { font-family:'Bebas Neue',sans-serif; font-size:clamp(52px,17vw,84px); line-height:.9; letter-spacing:2px; }
        .w-hero span { display:block; color:var(--accent); }
        .w-badges { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
        .w-badge { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:5px 13px; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); }
        .w-badge.hi { border-color:var(--accent); color:var(--accent); background:rgba(220,55,62,0.08); }

        .w-preview { width:100%; background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
        .w-prev-hdr { padding:12px 18px; background:#F5F8FB; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; }
        .w-prev-list { list-style:none; max-height:230px; overflow-y:auto; }
        .w-prev-list::-webkit-scrollbar { width:3px; }
        .w-prev-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .w-prev-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); font-size:13px; }
        .w-prev-item:last-child { border-bottom:none; }
        .w-prev-item.ri { color:var(--rest); opacity:.75; }
        .w-prev-thumb { width:34px; height:34px; border-radius:6px; object-fit:cover; background:var(--border); flex-shrink:0; }
        .w-prev-emoji { width:34px; height:34px; border-radius:6px; background:var(--border); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .w-prev-num { font-family:'Bebas Neue',sans-serif; font-size:11px; color:var(--muted); width:16px; flex-shrink:0; }
        .w-prev-name { flex:1; }
        .w-prev-dur { font-family:'Bebas Neue',sans-serif; font-size:14px; color:var(--accent); flex-shrink:0; }
        .w-prev-item.ri .w-prev-dur { color:var(--rest); }
        .w-prev-item.ri { color:var(--rest); opacity:.75; background:rgba(26,66,104,0.04); }

        .w-voice { display:flex; align-items:center; gap:10px; font-size:12px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; cursor:pointer; user-select:none; background:none; border:none; }
        .w-sw { width:36px; height:20px; background:var(--border); border-radius:10px; position:relative; transition:background .2s; flex-shrink:0; }
        .w-sw.on { background:var(--text); }
        .w-knob { width:14px; height:14px; background:#fff; border-radius:50%; position:absolute; top:3px; left:3px; transition:left .2s; }
        .w-sw.on .w-knob { left:19px; }

        .w-btn-start { width:100%; padding:20px; background:var(--accent); color:#fff; font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:4px; border:none; border-radius:12px; cursor:pointer; transition:transform .1s,box-shadow .2s; box-shadow:0 4px 20px rgba(220,55,62,.25); }
        .w-btn-start:hover { transform:translateY(-2px); box-shadow:0 6px 30px rgba(220,55,62,.35); }
        .w-btn-start:active { transform:translateY(0); }

        /* WORKOUT */
        .w-workout { flex:1; display:flex; flex-direction:column; padding-top:16px; gap:12px; }
        .w-prog-track { width:100%; height:3px; background:var(--border); border-radius:2px; overflow:hidden; }
        .w-prog-fill { height:100%; border-radius:2px; transition:width .5s linear,background .3s; }
        .w-prog-lbl { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:5px; }

        .w-card { background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden; position:relative; transition:border-color .3s; box-shadow:0 2px 10px rgba(15,49,84,0.06); }
        .w-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; z-index:2; transition:background .3s; }

        .w-img-wrap { width:100%; height:200px; background:#F5F8FB; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .w-img { width:100%; height:100%; object-fit:cover; display:block; transition:opacity .5s; }
        .w-img-overlay { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(0,0,0,.7)); height:60px; pointer-events:none; }
        .w-img-ph { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:var(--muted); font-size:11px; letter-spacing:1px; text-transform:uppercase; }
        .w-rest-vis { width:100%; height:200px; background:linear-gradient(135deg,#0F3154,#1A4268); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }
        .w-rest-lbl { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:3px; color:#fff; opacity:.8; }

        .w-info { padding:14px 18px; }
        .w-phase { font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:4px; }
        .w-exname { font-family:'Bebas Neue',sans-serif; font-size:clamp(28px,8vw,40px); line-height:1; letter-spacing:1px; margin-bottom:7px; }
        .w-tip { font-size:12px; color:var(--muted); line-height:1.5; }

        .w-timer { display:flex; align-items:center; justify-content:center; }
        .w-ring { position:relative; width:148px; height:148px; }
        .w-ring svg { transform:rotate(-90deg); }
        .w-ring-disp { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .w-ring-num { font-family:'Bebas Neue',sans-serif; font-size:54px; line-height:1; }
        .w-ring-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }

        .w-controls { display:flex; gap:10px; }
        .w-btn { flex:1; padding:14px; border:1px solid var(--border); background:var(--card); color:var(--text); font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:2px; border-radius:10px; cursor:pointer; transition:all .15s; }
        .w-btn:hover { background:var(--surface); border-color:var(--text); }
        .w-btn.pr { background:var(--accent); color:#fff; border-color:var(--accent); }
        .w-btn.pr:hover { background:var(--accent2); }
        .w-btn.dn { border-color:var(--muted); color:var(--muted); }
        .w-btn.dn:hover { background:var(--text); color:#fff; }

        .w-upnext { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:11px 16px; display:flex; align-items:center; gap:12px; box-shadow:0 1px 4px rgba(15,49,84,0.04); }
        .w-un-thumb { width:32px; height:32px; border-radius:5px; object-fit:cover; background:var(--border); flex-shrink:0; }
        .w-un-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); white-space:nowrap; }
        .w-un-name { font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:1px; }
        .w-un-dur { margin-left:auto; font-family:'Bebas Neue',sans-serif; font-size:14px; color:var(--muted); white-space:nowrap; }

        /* DONE */
        .w-done { flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; gap:28px; }
        .w-done-title { font-family:'Bebas Neue',sans-serif; font-size:80px; line-height:.9; color:var(--text); }
        .w-done-sub { font-size:15px; color:var(--muted); line-height:1.7; }
        .w-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%; }
        .w-stat { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:18px; text-align:center; }
        .w-stat-val { font-family:'Bebas Neue',sans-serif; font-size:40px; color:var(--accent); }
        .w-stat { box-shadow:0 1px 4px rgba(15,49,84,0.04); }
        .w-stat-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .pulsing { animation:pulse 1s ease-in-out infinite; }
        @keyframes flashIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        .flash { animation:flashIn .35s ease; }
      `}</style>

      <div className="workout-root">
        <div className="w-app">

          {/* HEADER */}
          <div className="w-header">
            <div className="w-logo">IRON 15</div>
            <div className="w-meta">~15 MIN &middot; 60s WORK &middot; 30s REST</div>
          </div>

          {/* ── START SCREEN ── */}
          {screen === 'start' && (
            <div className="w-start">
              <div className="w-hero">FEEL<br /><span>THE BURN</span></div>
              <div className="w-badges">
                <div className="w-badge hi">~15 Minutes</div>
                <div className="w-badge">10 Exercises</div>
                <div className="w-badge">60s Work</div>
                <div className="w-badge">30s Rest</div>
              </div>

              <div className="w-preview">
                <div className="w-prev-hdr">
                  <span>Today&apos;s Workout</span>
                  <span style={{ color: 'var(--accent)' }}>1 Round</span>
                </div>
                <ul className="w-prev-list">
                  {(() => { let n = 0; return WORKOUT.map((ex, i) => {
                    if (ex.type === 'work') n++
                    return (
                      <li key={i} className={`w-prev-item${ex.type === 'rest' ? ' ri' : ''}`}>
                        {ex.type === 'work' && ex.img
                          ? <img className="w-prev-thumb" src={ex.img} alt={ex.name} onError={e => (e.currentTarget.style.display = 'none')} />
                          : <div className="w-prev-emoji">{ex.type === 'rest' ? '\uD83D\uDE2E\u200D\uD83D\uDCA8' : '\uD83C\uDFCB\uFE0F'}</div>
                        }
                        <span className="w-prev-num">{ex.type === 'work' ? n : ''}</span>
                        <span className="w-prev-name">{ex.name}</span>
                        <span className="w-prev-dur">{ex.dur}s</span>
                      </li>
                    )
                  })})()}
                </ul>
              </div>

              <button className="w-voice" onClick={() => setVoiceOn(v => !v)}>
                <div className={`w-sw${voiceOn ? ' on' : ''}`}><div className="w-knob" /></div>
                Voice Cues
              </button>

              <button className="w-btn-start" onClick={startWorkout}>START WORKOUT</button>
            </div>
          )}

          {/* ── WORKOUT SCREEN ── */}
          {screen === 'workout' && currentEx && (
            <div className="w-workout">
              {/* Progress */}
              <div>
                <div className="w-prog-track">
                  <div className="w-prog-fill" style={{
                    width: `${pct}%`,
                    background: isRest ? 'var(--rest)' : 'var(--accent)'
                  }} />
                </div>
                <div className="w-prog-lbl">
                  <span>{Math.round(pct)}%</span>
                  <span>{elapsedMins}:{String(elapsedSecs).padStart(2, '0')} / {totalMins}:00</span>
                </div>
              </div>

              {/* Exercise card */}
              <div className="w-card flash" style={{
                borderColor: isRest ? 'var(--rest)' : 'var(--border)',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isRest ? 'var(--rest)' : 'var(--accent)', zIndex: 2 }} />

                {/* Visual */}
                {isRest ? (
                  <div className="w-rest-vis">
                    <div style={{ fontSize: 56 }}>{'\uD83D\uDE2E\u200D\uD83D\uDCA8'}</div>
                    <div className="w-rest-lbl">Rest &amp; Recover</div>
                  </div>
                ) : (
                  <div className="w-img-wrap">
                    {!imgLoaded && (
                      <div className="w-img-ph">
                        <div style={{ fontSize: 44 }}>{'\uD83C\uDFCB\uFE0F'}</div>
                        <div>Loading...</div>
                      </div>
                    )}
                    {currentEx.img && (
                      <img
                        key={currentEx.name}
                        className="w-img"
                        src={currentEx.img}
                        alt={currentEx.name}
                        style={{ opacity: imgLoaded ? 1 : 0 }}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgLoaded(true)}
                      />
                    )}
                    <div className="w-img-overlay" />
                  </div>
                )}

                <div className="w-info">
                  <div className="w-phase" style={{ color: isRest ? 'var(--rest)' : 'var(--muted)' }}>
                    {isRest ? 'REST' : 'WORK'}
                  </div>
                  <div className="w-exname" style={{ color: isRest ? 'var(--rest)' : 'var(--text)' }}>
                    {currentEx.name}
                  </div>
                  <div className="w-tip">{currentEx.tip}</div>
                </div>
              </div>

              {/* Ring timer */}
              <div className="w-timer">
                <div className="w-ring">
                  <svg viewBox="0 0 148 148" width="148" height="148">
                    <circle fill="none" stroke="var(--border)" strokeWidth="6" cx="74" cy="74" r="64" />
                    <circle
                      fill="none"
                      stroke={isRest ? 'var(--rest)' : 'var(--accent)'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      cx="74" cy="74" r="64"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                      style={{ transition: 'stroke-dashoffset .5s linear, stroke .3s' }}
                    />
                  </svg>
                  <div className="w-ring-disp">
                    <div className={`w-ring-num${paused ? ' pulsing' : ''}`}>{timeLeft}</div>
                    <div className="w-ring-lbl">seconds</div>
                  </div>
                </div>
              </div>

              {/* Up next */}
              <div className="w-upnext">
                <div className="w-un-lbl">Up Next</div>
                {nextEx?.img && (
                  <img className="w-un-thumb" src={nextEx.img} alt={nextEx?.name} onError={e => (e.currentTarget.style.display='none')} />
                )}
                <div className="w-un-name">{nextEx ? nextEx.name : '\uD83C\uDFC1 Finish!'}</div>
                {nextEx && <div className="w-un-dur">{nextEx.dur}s</div>}
              </div>

              {/* Controls */}
              <div className="w-controls">
                <button className="w-btn" onClick={skipEx}>SKIP &rarr;</button>
                <button className={`w-btn${!paused ? ' pr' : ''}`} onClick={togglePause}>
                  {paused ? 'RESUME' : 'PAUSE'}
                </button>
                <button className="w-btn dn" onClick={confirmStop}>STOP</button>
              </div>
            </div>
          )}

          {/* ── DONE SCREEN ── */}
          {screen === 'done' && (
            <div className="w-done">
              <div className="w-done-title">WORK<br />DONE.</div>
              <div className="w-done-sub">
                You crushed a full 15-minute<br />dumbbell session. Legendary. &#128293;
              </div>
              <div className="w-stats">
                <div className="w-stat"><div className="w-stat-val">10</div><div className="w-stat-lbl">Exercises</div></div>
                <div className="w-stat"><div className="w-stat-val">15</div><div className="w-stat-lbl">Minutes</div></div>
                <div className="w-stat"><div className="w-stat-val">~120</div><div className="w-stat-lbl">Cal Burned</div></div>
                <div className="w-stat"><div className="w-stat-val">&#128170;</div><div className="w-stat-lbl">Effort</div></div>
              </div>
              <button className="w-btn-start" onClick={resetWorkout}>DO IT AGAIN</button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

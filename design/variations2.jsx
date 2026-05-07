// ====================================================================
// VARIATION C — Dashboard grid, wizard-style log (modal)
// Emphasis on visual density + big calendar heat
// ====================================================================
function VariationC() {
  return (
    <div className="wf" style={{ width: 1280, height: 820 }}>
      {/* slim top bar */}
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 50,
        borderBottom: '2px solid var(--ink)', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--ink)', color: 'var(--paper)'
      }}>
        <div className="row g16 ai-c">
          <div className="row ai-c g8" style={{ filter: 'invert(1)' }}><span className="mug" /><h3 style={{ fontSize: 20 }}>BrewAI</h3></div>
          <span className="tiny" style={{ opacity: .7 }}>/ dashboard</span>
        </div>
        <div className="row g12 ai-c">
          <span className="tiny">🔥 5-day streak</span>
          <span className="btn accent sm">+ new brew</span>
        </div>
      </header>

      {/* Bento grid */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0, bottom: 0,
        padding: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        gap: 14
      }}>

        {/* Big hero: next brew suggestion */}
        <div className="box pad fill-soft" style={{ gridColumn: 'span 5', gridRow: 'span 3' }}>
          <div className="label">Today's pick</div>
          <h1 className="mt4">Gardelli · Kenya AA</h1>
          <div className="muted small">roasted 12d ago · best window closes in 6 days</div>
          <div className="row g12 mt12">
            <BeanBag size={60} fill={0.35} />
            <div className="col f1">
              <div className="row jc-sb"><span className="small">remaining</span><b>142g</b></div>
              <div className="progress mt4"><i style={{ width: '35%' }} /></div>
              <div className="tiny muted mt4">~7 shots left at 18g dose</div>
              <div className="row g8 mt8">
                <span className="chip">last: ★★★★ @ 18→36 · 28s</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="box pad" style={{ gridColumn: 'span 4', gridRow: 'span 3' }}>
          <div className="label">this week</div>
          <div className="row mt8 g16">
            <div className="f1">
              <div className="huge">14</div>
              <div className="tiny muted">brews</div>
            </div>
            <div className="f1">
              <div className="huge">4.1</div>
              <div className="tiny muted">avg ★</div>
            </div>
            <div className="f1">
              <div className="huge">180g</div>
              <div className="tiny muted">beans</div>
            </div>
          </div>
          <div className="h-sep dashed mt12" />
          <div className="label mt12">rating trend</div>
          <div style={{ height: 60, marginTop: 4 }}><SketchLine accent dots={false} /></div>
        </div>

        {/* Streak */}
        <div className="box pad fill-ink" style={{ gridColumn: 'span 3', gridRow: 'span 3' }}>
          <div className="label" style={{ color: 'var(--paper-2)' }}>streak</div>
          <div className="huge" style={{ color: 'var(--paper)', fontSize: 80 }}>5</div>
          <div className="small" style={{ color: 'var(--paper-2)' }}>days in a row</div>
          <div className="row g4 mt12" style={{ gap: 3 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 22,
                border: '1.4px solid var(--paper)',
                background: i < 9 || i > 11 ? 'var(--paper)' : 'transparent',
                borderRadius: 2
              }} />
            ))}
          </div>
          <div className="tiny mt4" style={{ color: 'var(--paper-2)' }}>last 14 days</div>
        </div>

        {/* Heatmap */}
        <div className="box pad" style={{ gridColumn: 'span 7', gridRow: 'span 3' }}>
          <div className="row jc-sb ai-c mb8">
            <h3 className="squiggle">Brew calendar</h3>
            <div className="row g8">
              <span className="chip sel">all</span>
              <span className="chip">espresso</span>
              <span className="chip">filter</span>
            </div>
          </div>
          <Heat rows={4} cols={14} />
          <div className="row jc-sb mt8 tiny muted">
            <span>Mar 10</span><span>Apr 22 →</span>
          </div>
        </div>

        {/* Scatter */}
        <div className="box pad" style={{ gridColumn: 'span 5', gridRow: 'span 3' }}>
          <div className="row jc-sb ai-c mb4">
            <h3 className="squiggle">Grind vs. rating</h3>
            <span className="tiny muted">espresso</span>
          </div>
          <div style={{ height: 130 }}><Scatter height={130} /></div>
          <div className="row jc-sb tiny muted mt4">
            <span>finer ←</span><span>→ coarser</span>
          </div>
        </div>

        {/* Inventory strip */}
        <div className="box pad" style={{ gridColumn: 'span 8', gridRow: 'span 2' }}>
          <div className="row jc-sb ai-c mb8">
            <h3 className="squiggle">Inventory</h3>
            <span className="small muted">3 bags · 482g total · 1 running low</span>
          </div>
          <div className="row g12">
            {[
              { n: 'Kenya AA', p: 0.35, w: '142g' },
              { n: 'El Salvador', p: 0.78, w: '312g' },
              { n: 'Yirgacheffe', p: 0.14, w: '28g ⚠' },
            ].map((b, i) => (
              <div key={i} className="row g8 ai-c f1 box pad" style={{ padding: 10 }}>
                <BeanBag size={40} fill={b.p} />
                <div className="col f1">
                  <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                  <div className="progress mt4"><i style={{ width: (b.p * 100) + '%' }} /></div>
                  <div className="tiny muted mt4">{b.w}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite recipe */}
        <div className="box pad fill-note" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
          <div className="label">favorite recipe</div>
          <h3 className="mt4">"The 20% Kenya"</h3>
          <div className="tiny muted">avg ★ 4.6 over 9 brews</div>
          <div className="col g4 mt8 small">
            <div>• 18.0g in → 36g out</div>
            <div>• grind 2.4 · 28s</div>
            <div>• 93°C · basket IMS</div>
          </div>
          <span className="btn sm mt8">brew this →</span>
        </div>
      </div>

      {/* Wizard modal overlay (visible to demo UX) */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 5 }} />
      <div className="box pad" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 560, zIndex: 6, background: 'var(--paper)',
        boxShadow: '6px 8px 0 rgba(0,0,0,.15)'
      }}>
        <div className="row jc-sb ai-c">
          <div className="label">log brew · step 2 of 4</div>
          <span className="tiny muted">esc to close</span>
        </div>
        <h2 className="mt4">Tell us about the shot</h2>

        {/* progress dots */}
        <div className="row g8 mt12 ai-c">
          {['Method', 'Bean & recipe', 'Measurements', 'Taste'].map((s, i) => (
            <React.Fragment key={s}>
              <div className="row g8 ai-c">
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '2px solid var(--ink)',
                  background: i <= 1 ? 'var(--ink)' : 'var(--paper)',
                  color: i <= 1 ? 'var(--paper)' : 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontFamily: 'var(--hand-mono)'
                }}>{i + 1}</div>
                <span className="small" style={{ fontWeight: i === 1 ? 700 : 400, color: i > 1 ? 'var(--ink-3)' : 'var(--ink)' }}>{s}</span>
              </div>
              {i < 3 && <div className="f1 h-sep dashed" style={{ height: 2 }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="h-sep dashed mt16" />

        <div className="mt16">
          <div className="label mb4">Bean</div>
          <div className="row g8" style={{ flexWrap: 'wrap' }}>
            <span className="chip sel">Gardelli · Kenya AA</span>
            <span className="chip">Onyx · El Salvador</span>
            <span className="chip">Drop · Yirg</span>
            <span className="chip" style={{ borderStyle: 'dashed' }}>+ new bag</span>
          </div>
        </div>

        <div className="row g12 mt16">
          <div className="f1">
            <div className="label mb4">Recipe (optional)</div>
            <div className="input row jc-sb">
              <span>"The 20% Kenya" ▾</span>
              <span className="tiny muted">autofills</span>
            </div>
          </div>
          <div className="f1">
            <div className="label mb4">Basket</div>
            <div className="input">IMS 18g ▾</div>
          </div>
        </div>

        <div className="note mt16">
          Step 3 will ask dose / yield / time / grind — with sliders that remember your last values per bean.
        </div>

        <div className="row jc-sb mt16 ai-c">
          <span className="btn sm">← back</span>
          <div className="row g8">
            <span className="btn sm">skip</span>
            <span className="btn accent">continue →</span>
          </div>
        </div>
      </div>

      <div className="annot" style={{ top: 430, left: 170, zIndex: 7, color: 'var(--accent)' }}>wizard UX ↓ guided · 4 steps</div>
    </div>
  );
}

// ====================================================================
// VARIATION D — "Brew journal" spread. Editorial / timeline-first.
// Log via inline "new entry" card that expands in-place.
// ====================================================================
function VariationD() {
  return (
    <div className="wf" style={{ width: 1280, height: 820 }}>
      {/* Journal top */}
      <header style={{ padding: '24px 32px 8px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g12">
            <span className="mug" style={{ width: 28, height: 28 }} />
            <div>
              <h1 style={{ fontSize: 42 }}>Brew Journal</h1>
              <div className="tiny muted" style={{ letterSpacing: 2, textTransform: 'uppercase' }}>week 17  ·   apr 22, 2026  ·   vol. 3</div>
            </div>
          </div>
          <nav className="row g16 small">
            {['journal', 'stats', 'beans', 'recipes'].map((l, i) => (
              <span key={l} style={{
                padding: '4px 6px',
                borderBottom: i === 0 ? '2px solid var(--ink)' : 'none',
                fontWeight: i === 0 ? 700 : 400
              }}>{l}</span>
            ))}
          </nav>
        </div>
      </header>

      {/* 3-column layout */}
      <div style={{
        position: 'absolute', top: 120, bottom: 0, left: 0, right: 0,
        display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 0,
        overflow: 'hidden'
      }}>

        {/* LEFT — weekly recap */}
        <div style={{ padding: 24, borderRight: '2px solid var(--ink)' }}>
          <div className="label">this week</div>
          <h2 className="mt4">Recap</h2>
          <div className="col g12 mt12">
            <div className="row jc-sb"><span className="small">brews</span><b>14</b></div>
            <div className="row jc-sb"><span className="small">avg rating</span><b>4.1 ★</b></div>
            <div className="row jc-sb"><span className="small">best shot</span><b>tue · ★★★★★</b></div>
            <div className="row jc-sb"><span className="small">beans used</span><b>180g</b></div>
            <div className="row jc-sb"><span className="small">cost</span><b>$9.20</b></div>
          </div>

          <div className="h-sep dashed mt24" />
          <div className="label mt16">top method</div>
          <h3 className="mt4">Espresso <span className="muted small">— 9 of 14</span></h3>
          <div style={{ height: 60, marginTop: 8 }}>
            <MiniBars data={[60, 80, 40, 70, 90, 55, 75]} accent={[4]} />
          </div>
          <div className="row jc-sb tiny muted mt4">
            <span>mon</span><span>sun</span>
          </div>

          <div className="h-sep dashed mt16" />
          <div className="label mt12">grind vs rating</div>
          <div style={{ height: 120, marginTop: 4 }}><Scatter height={120} /></div>
        </div>

        {/* MIDDLE — timeline */}
        <div style={{ padding: 24, overflow: 'hidden' }}>
          <div className="row jc-sb ai-c">
            <h2 className="squiggle">Today · Tue</h2>
            <span className="btn sm">+ entry <span className="kbd" style={{ color: 'inherit', borderColor: 'currentColor', marginLeft: 4 }}>L</span></span>
          </div>

          {/* Active inline-log entry */}
          <div className="box pad thick mt12" style={{ borderStyle: 'dashed' }}>
            <div className="label">✏ writing entry · 14:22</div>
            <div className="row g12 ai-c mt8">
              <div className="row g8" style={{ flexWrap: 'wrap' }}>
                <span className="chip sel">☕ Espresso</span>
                <span className="chip">⏲ V60</span>
                <span className="chip">🌀 Aeropress</span>
              </div>
            </div>
            <div className="row g8 mt8">
              <div className="input f1">bean: Kenya AA ▾</div>
              <div className="input" style={{ width: 90 }}>18.0g</div>
              <div className="input" style={{ width: 90 }}>36g / 28s</div>
              <div className="input" style={{ width: 90 }}>grind 2.4</div>
            </div>
            <div className="row jc-sb ai-c mt8">
              <div className="stars" style={{ fontSize: 22 }}>★ ★ ★ ★ ☆</div>
              <div className="row g8">
                <span className="btn sm">draft</span>
                <span className="btn accent sm">publish entry</span>
              </div>
            </div>
          </div>

          {/* Timeline entries */}
          <div className="col g12 mt16" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: 8, bottom: 0, width: 2, background: 'var(--ink)', borderRadius: 2 }} />

            {[
              { t: '07:14', m: 'Espresso', bean: 'Kenya AA', notes: 'floral, juicy, acidity pops — a bit under at 27s', s: 4, meta: '18→36g · 28s · grind 2.4' },
              { t: 'mon 17:02', m: 'V60', bean: 'El Salvador', notes: 'chocolatey, heavy body. 4:30 drawdown.', s: 5, meta: '15g / 240g · 93°C' },
              { t: 'mon 07:30', m: 'Espresso', bean: 'Kenya AA', notes: 'too fast, channeling on the left side', s: 3, meta: '18→38g · 22s · grind 2.6' },
            ].map((e, i) => (
              <div key={i} className="row g12" style={{ paddingLeft: 30, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 3, top: 10, width: 16, height: 16,
                  borderRadius: '50%', background: 'var(--paper)', border: '2.2px solid var(--ink)'
                }} />
                <div className="f1 box pad" style={{ padding: 12 }}>
                  <div className="row jc-sb ai-c">
                    <div className="row ai-c g8">
                      <span className="tiny muted">{e.t}</span>
                      <span className="chip">{e.m}</span>
                      <span className="small">{e.bean}</span>
                    </div>
                    <Stars n={e.s} />
                  </div>
                  <div className="small mt4" style={{ fontStyle: 'italic' }}>"{e.notes}"</div>
                  <div className="tiny muted mt4 row g8">
                    <span>{e.meta}</span>
                    <span>·</span>
                    <span>edit · duplicate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — inventory */}
        <div style={{ padding: 24, borderLeft: '2px solid var(--ink)', background: 'var(--paper-2)' }}>
          <div className="row jc-sb ai-c">
            <h2>Pantry</h2>
            <span className="btn sm">+</span>
          </div>
          <div className="tiny muted">3 bags · 482g</div>

          <div className="col g16 mt16">
            {[
              { n: 'Kenya AA', r: 'Gardelli · 12d', p: 0.35, w: 142, total: 400, warn: false },
              { n: 'El Salvador', r: 'Onyx · 5d', p: 0.78, w: 312, total: 400, warn: false },
              { n: 'Yirgacheffe', r: 'Drop · 18d aged', p: 0.14, w: 28, total: 200, warn: true },
            ].map((b, i) => (
              <div key={i} className="col">
                <div className="row g8 ai-c">
                  <BeanBag size={46} fill={b.p} />
                  <div className="f1">
                    <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                    <div className="tiny muted">{b.r}</div>
                  </div>
                  {b.warn && <span className="chip accent">low</span>}
                </div>
                <div className="progress mt8"><i style={{ width: (b.p * 100) + '%' }} /></div>
                <div className="row jc-sb mt4 tiny muted">
                  <span>{b.w}g left</span>
                  <span>{b.total}g bag</span>
                </div>
              </div>
            ))}
          </div>

          <div className="note mt24">
            <b>Reorder Yirgacheffe?</b><br />
            Based on your 5g/day pace, it'll run out in ~6 days.
          </div>
        </div>
      </div>

      <div className="annot ink" style={{ top: 142, left: 540 }}>inline entry —<br />no modal, no wizard ↙</div>
      <div className="annot green" style={{ bottom: 30, left: 320 }}>click a timeline entry to expand</div>
    </div>
  );
}

Object.assign(window, { VariationC, VariationD });

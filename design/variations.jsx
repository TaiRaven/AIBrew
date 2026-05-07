// ====================================================================
// VARIATION A — Sidebar + Hero Log Button (conventional dashboard)
// ====================================================================
function VariationA() {
  return (
    <div className="wf" style={{ width: 1280, height: 820 }}>
      {/* Sidebar */}
      <aside style={{
        position: 'absolute', inset: '0 auto 0 0', width: 200,
        borderRight: '2px solid var(--ink)', padding: 18, background: 'var(--paper-2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mug" />
          <h2 style={{ fontSize: 26 }}>BrewAI</h2>
        </div>
        <div className="tiny muted" style={{ marginTop: -2 }}>home brewing log</div>

        <div className="mt24">
          <div className="label mb8">Navigate</div>
          {['Dashboard', 'Log brew', 'Stats', 'Inventory', 'Recipes'].map((l, i) => (
            <div key={l} style={{
              padding: '6px 10px', marginBottom: 4,
              fontFamily: 'var(--hand-body)', fontSize: 14,
              background: i === 0 ? 'var(--ink)' : 'transparent',
              color: i === 0 ? 'var(--paper)' : 'var(--ink)',
              borderRadius: '6px 4px 7px 5px',
              border: i === 0 ? '2px solid var(--ink)' : 'none'
            }}>• {l}</div>
          ))}
        </div>

        <div className="mt24">
          <div className="label mb8">This week</div>
          <div className="col g8" style={{ fontSize: 13 }}>
            <div className="row jc-sb"><span>Brews</span><span>14</span></div>
            <div className="row jc-sb"><span>Avg rating</span><span>4.1 ★</span></div>
            <div className="row jc-sb"><span>Beans used</span><span>180g</span></div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main style={{ position: 'absolute', inset: '0 0 0 200px', padding: 24, overflow: 'hidden' }}>
        {/* Top row */}
        <div className="row jc-sb ai-c">
          <div>
            <h1>Good morning, Alex</h1>
            <div className="muted">Tuesday · 14 brews this week <span style={{ color: 'var(--accent)' }}>(+3 vs last)</span></div>
          </div>
          <div className="row g12 ai-c">
            <div className="input" style={{ width: 220 }}>🔍  search brews, beans…</div>
            <span className="btn primary">+ Log brew <span className="kbd" style={{ color: 'inherit', borderColor: 'currentColor' }}>L</span></span>
          </div>
        </div>

        {/* KPI row */}
        <div className="row g16 mt16">
          {[
            { label: 'Brews today', val: '3', sub: 'target 2 ✓' },
            { label: 'Avg rating', val: '4.1', sub: 'this week', stars: true },
            { label: 'Beans remaining', val: '480g', sub: 'across 3 bags' },
            { label: 'Extraction avg', val: '20.4%', sub: 'TDS 8.9%' },
          ].map(k => (
            <div key={k.label} className="box pad f1 tilt-l">
              <div className="label">{k.label}</div>
              <div className="big mt4">{k.val}</div>
              <div className="tiny muted mt4">{k.sub}</div>
              <Spark />
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="row g16 mt16">
          {/* Recent brews table */}
          <div className="box f2 pad">
            <div className="row jc-sb ai-c mb8">
              <h3 className="squiggle">Recent brews</h3>
              <span className="small muted">see all →</span>
            </div>
            <div className="col g8">
              {[
                ['07:14', 'Espresso', 'Gardelli · Kenya', 18, 36, 4],
                ['yest 17:02', 'V60', 'Onyx · El Salvador', 15, 240, 5],
                ['yest 07:30', 'Espresso', 'Gardelli · Kenya', 18, 38, 3],
                ['Mon 14:15', 'Aeropress', 'Drop · Yirg', 14, 220, 4],
                ['Mon 07:12', 'Espresso', 'Gardelli · Kenya', 18, 34, 4],
              ].map((r, i) => (
                <div key={i} className="row ai-c g12" style={{ padding: '6px 4px', borderBottom: '1.4px dashed var(--ink-4)' }}>
                  <div className="tiny muted" style={{ width: 80 }}>{r[0]}</div>
                  <div style={{ width: 80 }}><span className="chip">{r[1]}</span></div>
                  <div className="small f1">{r[2]}</div>
                  <div className="tiny muted">{r[3]}g → {r[4]}g</div>
                  <div><Stars n={r[5]} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="box f1 pad">
            <div className="row jc-sb ai-c mb8">
              <h3 className="squiggle">Beans</h3>
              <span className="small muted">+ add</span>
            </div>
            <div className="col g12">
              {[
                { n: 'Gardelli · Kenya AA', r: 'roasted 12d ago', p: 0.35, w: '142g / 400g', tag: 'espresso' },
                { n: 'Onyx · El Salvador', r: 'roasted 5d', p: 0.78, w: '312g / 400g', tag: 'filter' },
                { n: 'Drop · Yirgacheffe', r: 'roasted 18d ·  ⚠ aged', p: 0.14, w: '28g / 200g', tag: 'filter' },
              ].map((b, i) => (
                <div key={i} className="col g8" style={{ paddingBottom: 10, borderBottom: '1.4px dashed var(--ink-4)' }}>
                  <div className="row jc-sb ai-c">
                    <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                    <span className="chip">{b.tag}</span>
                  </div>
                  <div className="tiny muted">{b.r}</div>
                  <div className="progress" style={{ position: 'relative' }}>
                    <i style={{ width: (b.p * 100) + '%' }} />
                  </div>
                  <div className="tiny">{b.w}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom charts */}
        <div className="row g16 mt16">
          <div className="box pad f1" style={{ height: 160 }}>
            <div className="row jc-sb ai-c"><h4>Brews / day</h4><span className="tiny muted">last 2 wks</span></div>
            <div style={{ height: 100, marginTop: 8 }}>
              <MiniBars data={[30, 60, 45, 80, 55, 25, 40, 70, 50, 85, 60, 30, 75, 65]} accent={[3, 9]} />
            </div>
          </div>
          <div className="box pad f1" style={{ height: 160 }}>
            <div className="row jc-sb ai-c"><h4>Rating trend</h4><span className="tiny muted">30d</span></div>
            <div style={{ height: 100, marginTop: 8 }}>
              <SketchLine accent />
            </div>
          </div>
          <div className="box pad f1" style={{ height: 160 }}>
            <div className="row jc-sb ai-c"><h4>Grind vs. rating</h4><span className="tiny muted">espresso</span></div>
            <div style={{ height: 100, marginTop: 8 }}>
              <Scatter height={100} />
            </div>
          </div>
        </div>

        {/* annotations */}
        <div className="annot" style={{ top: 28, right: 260 }}>⌘L anywhere to log ↓</div>
        <div className="annot green" style={{ top: 310, left: 28 }}>sparkline = last 7 days</div>
        <div className="annot" style={{ bottom: 190, right: 30 }}>tap a dot → filtered view</div>
      </main>
    </div>
  );
}

// ====================================================================
// VARIATION B — Top nav + inline "Quick log" rail always visible
// ====================================================================
function VariationB() {
  return (
    <div className="wf" style={{ width: 1280, height: 820 }}>
      {/* Top bar */}
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        borderBottom: '2px solid var(--ink)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--paper-2)'
      }}>
        <div className="row g24 ai-c">
          <div className="row ai-c g8"><span className="mug" /><h2 style={{ fontSize: 22 }}>BrewAI</h2></div>
          <nav className="row g16">
            {['Dashboard', 'Brews', 'Stats', 'Inventory', 'Recipes'].map((l, i) => (
              <span key={l} className="small" style={{
                padding: '4px 10px',
                borderBottom: i === 0 ? '2.5px solid var(--accent)' : 'none',
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? 'var(--ink)' : 'var(--ink-3)'
              }}>{l}</span>
            ))}
          </nav>
        </div>
        <div className="row g12 ai-c">
          <div className="input small muted" style={{ width: 200 }}>🔍 search…</div>
          <span className="btn sm">⚙</span>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--ink)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</div>
        </div>
      </header>

      {/* Main */}
      <div style={{ position: 'absolute', top: 60, bottom: 0, left: 0, right: 380, padding: 24, overflow: 'hidden' }}>
        <div className="row jc-sb ai-c">
          <div>
            <h1>Dashboard</h1>
            <div className="muted small">Apr 22 · Week 17</div>
          </div>
          <div className="row g8">
            <span className="chip sel">7d</span><span className="chip">30d</span><span className="chip">90d</span><span className="chip">all</span>
          </div>
        </div>

        {/* Big stat cards */}
        <div className="row g16 mt16">
          <div className="box pad f1 fill-soft">
            <div className="label">rating trend · 30d</div>
            <div className="row ai-c jc-sb mt4">
              <span className="huge">4.1</span>
              <span className="small" style={{ color: 'var(--accent-3)' }}>+0.3 ↑</span>
            </div>
            <div style={{ height: 70, marginTop: 8 }}><SketchLine accent dots={false} /></div>
          </div>
          <div className="box pad f1 fill-soft">
            <div className="label">brews this week</div>
            <div className="row ai-c jc-sb mt4">
              <span className="huge">14</span>
              <span className="small muted">goal: 14 ✓</span>
            </div>
            <div style={{ height: 70, marginTop: 8 }}>
              <MiniBars data={[60, 80, 40, 70, 90, 55, 75]} accent={[6]} />
            </div>
          </div>
          <div className="box pad f1 fill-soft">
            <div className="label">bean cost · 30d</div>
            <div className="row ai-c jc-sb mt4">
              <span className="huge">$38</span>
              <span className="small muted">$0.27/brew</span>
            </div>
            <div className="tiny mt8 muted">3 bags, 540g consumed</div>
          </div>
        </div>

        {/* Charts */}
        <div className="row g16 mt16">
          <div className="box pad" style={{ flex: 2 }}>
            <div className="row jc-sb ai-c mb8">
              <h3 className="squiggle">Grind size vs. rating</h3>
              <span className="tiny muted">espresso · last 60 brews</span>
            </div>
            <div style={{ height: 180 }}><Scatter height={180} /></div>
            <div className="tiny muted mt4">sweet spot ≈ 2.2 — 2.6 (fine–medium-fine)</div>
          </div>

          <div className="box pad f1">
            <h3 className="squiggle mb8">Methods · 30d</h3>
            <div className="col g8">
              {[['Espresso', 62], ['V60', 20], ['Aeropress', 10], ['French press', 6], ['Cold brew', 2]].map(([m, p]) => (
                <div key={m} className="col">
                  <div className="row jc-sb small"><span>{m}</span><span className="muted">{p}%</span></div>
                  <div className="progress accent"><i style={{ width: p + '%' }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="box pad mt16">
          <div className="row jc-sb ai-c mb8">
            <h3 className="squiggle">Brew calendar</h3>
            <span className="tiny muted">last 60 days · darker = more</span>
          </div>
          <Heat rows={5} cols={12} />
        </div>

        <div className="annot" style={{ top: 230, left: 400 }}>trendline = pearson corr</div>
      </div>

      {/* Right side "Quick log" rail — always visible */}
      <aside style={{
        position: 'absolute', top: 60, bottom: 0, right: 0, width: 380,
        borderLeft: '2px solid var(--ink)', background: 'var(--paper-2)', padding: 20, overflow: 'hidden'
      }}>
        <div className="row jc-sb ai-c">
          <h2 className="squiggle">Quick log</h2>
          <span className="kbd">press L</span>
        </div>
        <div className="tiny muted" style={{ marginTop: -2 }}>inline · never leaves the page</div>

        <div className="col g12 mt16">
          <div>
            <div className="label mb4">Method</div>
            <div className="row g8" style={{ flexWrap: 'wrap' }}>
              {['Espresso', 'V60', 'Aeropress', 'French', 'Cold', 'Moka', 'Drip'].map((m, i) => (
                <span key={m} className={"chip" + (i === 0 ? ' sel' : '')}>{m}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="label mb4">Bean</div>
            <div className="input row jc-sb">
              <span>Gardelli · Kenya AA ▾</span>
              <span className="tiny muted">142g left</span>
            </div>
          </div>

          <div className="row g8">
            <div className="f1">
              <div className="label mb4">Dose</div>
              <div className="input">18.0 g</div>
            </div>
            <div className="f1">
              <div className="label mb4">Yield</div>
              <div className="input">36 g</div>
            </div>
            <div className="f1">
              <div className="label mb4">Time</div>
              <div className="input">28 s</div>
            </div>
          </div>

          <div className="row g8">
            <div className="f1">
              <div className="label mb4">Grind</div>
              <div className="input">2.4 ▾</div>
            </div>
            <div className="f1">
              <div className="label mb4">Temp</div>
              <div className="input">93 °C</div>
            </div>
            <div className="f1">
              <div className="label mb4">TDS</div>
              <div className="input">9.2 %</div>
            </div>
          </div>

          <div>
            <div className="label mb4">Rating</div>
            <div className="row jc-sb ai-c">
              <span className="stars" style={{ fontSize: 28 }}>★ ★ ★ ★ ☆</span>
              <span className="tiny muted">extraction: 20.4%</span>
            </div>
          </div>

          <div>
            <div className="label mb4">Taste notes</div>
            <div className="input" style={{ height: 60, alignItems: 'flex-start' }}>
              <div className="scribble-lines short" style={{ width: '100%', height: 40 }} />
            </div>
          </div>

          <div className="row g8">
            <span className="btn accent f1 jc-c" style={{ justifyContent: 'center' }}>Save brew</span>
            <span className="btn">clone last</span>
          </div>

          <div className="note mt8">
            <b>Tip:</b> copies most fields from your last brew of the same bean — just tweak what changed.
          </div>
        </div>

        <div className="annot" style={{ top: 30, left: -100, color: 'var(--accent)' }}>always-visible ⌄</div>
      </aside>
    </div>
  );
}

Object.assign(window, { VariationA, VariationB });

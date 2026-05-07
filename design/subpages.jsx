// ====================================================================
// SUB-PAGES — Stats, Inventory detail, Log brew (full page)
// ====================================================================

// STATS DETAIL PAGE
function StatsPage() {
  return (
    <div className="wf" style={{ width: 1100, height: 720 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← back</span>
            <h2>Stats</h2>
          </div>
          <div className="row g8">
            <span className="chip">7d</span>
            <span className="chip sel">30d</span>
            <span className="chip">90d</span>
            <span className="chip">1y</span>
            <span className="chip">all</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
        {[
          ['Total brews', '62', '+12 vs prev'],
          ['Avg rating', '4.1 ★', '+0.3'],
          ['Extraction', '20.1 %', 'target 18-22'],
          ['Bean cost', '$38', '$0.61/brew'],
        ].map(([l, v, s]) => (
          <div key={l} className="box pad">
            <div className="label">{l}</div>
            <div className="huge mt4">{v}</div>
            <div className="tiny muted">{s}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div className="box pad">
          <div className="row jc-sb ai-c"><h3 className="squiggle">Rating over time</h3>
            <div className="row g8">
              <span className="chip sel">all methods</span>
              <span className="chip">espresso</span>
              <span className="chip">filter</span>
            </div>
          </div>
          <div style={{ height: 200, marginTop: 12 }}><SketchLine accent width={600} height={200} /></div>
          <div className="row jc-sb tiny muted mt4">
            <span>Mar 23</span><span>Apr 22</span>
          </div>
        </div>
        <div className="box pad">
          <h3 className="squiggle">Extraction</h3>
          <div className="row ai-c g16 mt12">
            <Donut value={0.72} label="20.1%" />
            <div className="col g4 tiny">
              <div>under — 18%</div>
              <div><b>ideal — 65%</b></div>
              <div>over — 17%</div>
            </div>
          </div>
          <div className="h-sep dashed mt16" />
          <div className="label mt12">TDS distribution</div>
          <div style={{ height: 70, marginTop: 4 }}>
            <MiniBars data={[10, 20, 35, 55, 80, 70, 50, 30, 15]} accent={[4]} />
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div className="box pad">
          <h3 className="squiggle">Grind vs rating</h3>
          <div style={{ height: 150, marginTop: 8 }}><Scatter height={150} /></div>
          <div className="tiny muted mt4">r = 0.64 · sweet spot 2.2–2.6</div>
        </div>
        <div className="box pad">
          <h3 className="squiggle">Method mix</h3>
          <div className="col g8 mt8">
            {[['Espresso', 62], ['V60', 20], ['Aeropress', 10], ['French', 6], ['Cold', 2]].map(([m, p]) => (
              <div key={m}>
                <div className="row jc-sb tiny"><span>{m}</span><span className="muted">{p}%</span></div>
                <div className="progress"><i style={{ width: p + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="box pad">
          <h3 className="squiggle">Top rated beans</h3>
          <div className="col g8 mt8">
            {[['El Salvador', 4.6, 12], ['Kenya AA', 4.2, 28], ['Yirgacheffe', 3.9, 14], ['Ethiopia Guji', 3.7, 8]].map(([n, r, ct]) => (
              <div key={n} className="row jc-sb ai-c" style={{ padding: '4px 0', borderBottom: '1.2px dashed var(--ink-4)' }}>
                <span className="small">{n}</span>
                <span className="row g8 ai-c"><Stars n={Math.round(r)} /><span className="tiny muted">{ct} brews</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="annot" style={{ top: 200, right: 290 }}>method filter here ↓</div>
    </div>
  );
}

// INVENTORY DETAIL PAGE
function InventoryPage() {
  return (
    <div className="wf" style={{ width: 1100, height: 720 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← back</span>
            <h2>Beans · Inventory</h2>
          </div>
          <div className="row g8">
            <div className="input small muted" style={{ width: 180 }}>🔍 search…</div>
            <span className="btn primary">+ new bag</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* summary strip */}
        <div className="row g12 mb16">
          <div className="box pad f1"><div className="label">active bags</div><div className="big mt4">3</div></div>
          <div className="box pad f1"><div className="label">total weight</div><div className="big mt4">482 g</div></div>
          <div className="box pad f1"><div className="label">running low</div><div className="big mt4" style={{ color: 'var(--accent)' }}>1 ⚠</div></div>
          <div className="box pad f1"><div className="label">avg days to empty</div><div className="big mt4">18 d</div></div>
        </div>

        {/* Table */}
        <div className="box">
          <div className="row pad" style={{ background: 'var(--paper-2)', borderBottom: '2px solid var(--ink)', padding: 12 }}>
            <div className="label" style={{ flex: 3 }}>bag</div>
            <div className="label" style={{ flex: 2 }}>roaster · origin</div>
            <div className="label" style={{ flex: 1 }}>roast date</div>
            <div className="label" style={{ flex: 2 }}>remaining</div>
            <div className="label" style={{ flex: 1 }}>avg ★</div>
            <div className="label" style={{ flex: 2 }}>last used</div>
            <div className="label" style={{ flex: 1, textAlign: 'right' }}>actions</div>
          </div>
          {[
            { n: 'Kenya AA', r: 'Gardelli · Kenya', d: 'Apr 10 · 12d', p: 0.35, w: 142, t: 400, rt: 4.2, u: 'today 07:14' },
            { n: 'El Salvador', r: 'Onyx · La Esperanza', d: 'Apr 17 · 5d', p: 0.78, w: 312, t: 400, rt: 4.6, u: 'yest 17:02' },
            { n: 'Yirgacheffe', r: 'Drop · Ethiopia', d: 'Apr 4 · 18d ⚠', p: 0.14, w: 28, t: 200, rt: 3.9, u: 'Mon' },
          ].map((b, i) => (
            <div key={i} className="row ai-c pad" style={{ padding: 12, borderBottom: i < 2 ? '1.4px dashed var(--ink-4)' : 'none' }}>
              <div className="row g8 ai-c" style={{ flex: 3 }}>
                <BeanBag size={38} fill={b.p} />
                <div>
                  <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                  <div className="tiny muted">400g whole bean</div>
                </div>
              </div>
              <div className="small" style={{ flex: 2 }}>{b.r}</div>
              <div className="tiny" style={{ flex: 1 }}>{b.d}</div>
              <div style={{ flex: 2 }}>
                <div className="progress"><i style={{ width: (b.p * 100) + '%' }} /></div>
                <div className="tiny muted mt4">{b.w}g / {b.t}g</div>
              </div>
              <div style={{ flex: 1 }}><Stars n={Math.round(b.rt)} /></div>
              <div className="tiny" style={{ flex: 2 }}>{b.u}</div>
              <div className="row g8 jc-e" style={{ flex: 1 }}>
                <span className="chip">−5g</span>
                <span className="chip">⋯</span>
              </div>
            </div>
          ))}
        </div>

        {/* Finished bags */}
        <div className="h-sep dashed mt24" />
        <div className="row jc-sb ai-c mt16">
          <h3 className="squiggle">Finished bags <span className="muted small">· 8 archive</span></h3>
          <span className="small muted">show all →</span>
        </div>
        <div className="row g12 mt12">
          {['Yirg · Mar', 'Brazil · Mar', 'Colombia · Feb', 'Kenya · Feb'].map((n, i) => (
            <div key={i} className="box pad f1" style={{ opacity: 0.6 }}>
              <div className="row g8 ai-c">
                <BeanBag size={28} fill={0.02} />
                <div className="small">{n}</div>
              </div>
              <div className="tiny muted mt4">400g · 19 brews · ★ 4.0</div>
            </div>
          ))}
        </div>
      </div>

      <div className="annot" style={{ top: 110, left: 380 }}>1-glance status</div>
      <div className="annot green" style={{ top: 330, right: 100 }}>drag ⋯ to reorder / archive</div>
    </div>
  );
}

// LOG BREW FULL PAGE (thorough form)
function LogBrewPage() {
  return (
    <div className="wf" style={{ width: 900, height: 820 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← back</span>
            <h2>Log a brew</h2>
          </div>
          <div className="tiny muted">auto-saved 2s ago</div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* method */}
        <div className="mb16">
          <div className="label mb8">Method</div>
          <div className="row g8" style={{ flexWrap: 'wrap' }}>
            {[
              ['☕', 'Espresso'], ['⏲', 'V60'], ['🧊', 'Chemex'],
              ['🌀', 'Aeropress'], ['🫖', 'French press'],
              ['❄', 'Cold brew'], ['🔥', 'Moka'], ['☁', 'Drip']
            ].map(([ic, n], i) => (
              <div key={n} className={"box pad" + (i === 0 ? ' fill-ink' : '')} style={{ padding: '8px 12px', minWidth: 90, textAlign: 'center', color: i === 0 ? 'var(--paper)' : 'var(--ink)' }}>
                <div style={{ fontSize: 20 }}>{ic}</div>
                <div className="tiny">{n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* bean + recipe */}
        <div className="row g16 mb16">
          <div className="f2">
            <div className="label mb4">Bean</div>
            <div className="input row jc-sb">
              <span className="row g8 ai-c"><BeanBag size={20} fill={0.35} /><span>Gardelli · Kenya AA</span></span>
              <span className="tiny muted">142g left · 12d ▾</span>
            </div>
          </div>
          <div className="f1">
            <div className="label mb4">Recipe</div>
            <div className="input">"The 20%" ▾</div>
          </div>
        </div>

        {/* measurements */}
        <div className="box pad fill-soft mb16">
          <div className="label mb8">Measurements</div>
          <div className="row g12" style={{ flexWrap: 'wrap' }}>
            {[
              ['Dose', '18.0 g'],
              ['Yield', '36.0 g'],
              ['Time', '28 s'],
              ['Grind', '2.4'],
              ['Temp', '93 °C'],
              ['Pressure', '9 bar'],
            ].map(([l, v]) => (
              <div key={l} className="col" style={{ width: 'calc((100% - 48px)/3)' }}>
                <div className="tiny muted">{l}</div>
                <div className="input mt4">{v}</div>
              </div>
            ))}
          </div>
          <div className="row g12 mt12">
            <div className="f1">
              <div className="tiny muted">TDS</div>
              <div className="input mt4 row jc-sb"><span>9.2 %</span><span className="chip">refractometer</span></div>
            </div>
            <div className="f1">
              <div className="tiny muted">Extraction yield (auto)</div>
              <div className="input mt4" style={{ background: 'var(--paper-2)' }}>= 20.4 %  (ideal)</div>
            </div>
          </div>
        </div>

        {/* taste */}
        <div className="row g16 mb16">
          <div className="f1">
            <div className="label mb4">Rating</div>
            <div className="stars" style={{ fontSize: 40 }}>★ ★ ★ ★ ☆</div>
          </div>
          <div className="f2">
            <div className="label mb4">Taste notes</div>
            <div className="row g8" style={{ flexWrap: 'wrap' }}>
              {['floral', 'juicy', 'black currant', 'tea-like', 'chocolate', 'bright', 'under', 'over', 'balanced'].map((t, i) => (
                <span key={t} className={"chip" + (i < 3 ? ' sel' : '')}>{t}</span>
              ))}
              <span className="chip" style={{ borderStyle: 'dashed' }}>+ tag</span>
            </div>
          </div>
        </div>

        <div className="mb16">
          <div className="label mb4">Notes</div>
          <div className="box" style={{ padding: 12, minHeight: 80 }}>
            <div className="scribble-lines short" style={{ height: 60 }} />
          </div>
        </div>

        <div className="row jc-sb ai-c">
          <div className="row g8">
            <span className="btn sm">📷 photo</span>
            <span className="btn sm">🔗 link shot</span>
          </div>
          <div className="row g8">
            <span className="btn">save draft</span>
            <span className="btn accent">log brew</span>
          </div>
        </div>
      </div>

      <div className="annot" style={{ top: 105, right: 80 }}>autosave every field</div>
      <div className="annot green" style={{ top: 415, right: 30 }}>auto-computed from dose/yield/TDS ↘</div>
    </div>
  );
}

Object.assign(window, { StatsPage, InventoryPage, LogBrewPage });

// ====================================================================
// MOBILE — Hand-drawn phone & foldable frames + screens
// ====================================================================

// Sketchy phone bezel — wraps mobile screens
function PhoneFrame({ width = 360, height = 760, label, children, notch = true, tilt = 0 }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `rotate(${tilt}deg)` }}>
      {label && <div className="label" style={{ marginBottom: 4 }}>{label}</div>}
      <div style={{
        position: 'relative',
        width: width + 24, height: height + 24,
        border: '2.5px solid var(--ink)',
        borderRadius: '46px 44px 48px 42px / 44px 48px 42px 46px',
        padding: 12,
        background: 'var(--paper-2)',
        boxShadow: '4px 5px 0 rgba(0,0,0,.1)'
      }}>
        {/* notch / dynamic island */}
        {notch && (
          <div style={{
            position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
            width: 90, height: 18,
            background: 'var(--ink)', borderRadius: 14
          }} />
        )}
        {/* side button */}
        <div style={{ position: 'absolute', left: -3, top: 110, width: 3, height: 50, background: 'var(--ink)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', right: -3, top: 90, width: 3, height: 70, background: 'var(--ink)', borderRadius: 2 }} />

        <div style={{
          width, height, overflow: 'hidden',
          borderRadius: '32px 30px 34px 28px / 30px 34px 28px 32px',
          background: 'var(--paper)',
          position: 'relative',
          border: '1.5px solid var(--ink)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile status bar
function StatusBar({ dark = false }) {
  return (
    <div style={{
      height: 36, padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'var(--hand-mono)', fontSize: 11,
      color: dark ? 'var(--paper)' : 'var(--ink)',
      background: dark ? 'var(--ink)' : 'transparent'
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4 }}>
        <span>·∙· </span><span>📶</span><span>🔋</span>
      </span>
    </div>
  );
}

// Mobile bottom tab bar
function TabBar({ active = 'home' }) {
  const tabs = [
    ['home', 'home', '🏠'],
    ['stats', 'stats', '📊'],
    ['log', '+', '☕'],
    ['beans', 'beans', '🫘'],
    ['more', 'more', '≡'],
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      borderTop: '2px solid var(--ink)',
      background: 'var(--paper-2)',
      padding: '8px 4px 14px',
      display: 'flex', justifyContent: 'space-around'
    }}>
      {tabs.map(([id, lbl, ic], i) => (
        <div key={id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: active === id ? 'var(--ink)' : 'var(--ink-3)',
          fontWeight: active === id ? 700 : 400,
          fontSize: 10
        }}>
          {id === 'log'
            ? <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--hand-disp)', fontSize: 28, lineHeight: 1,
                marginTop: -16,
                boxShadow: '2px 2px 0 rgba(0,0,0,.15)'
              }}>+</div>
            : <span style={{ fontSize: 18 }}>{ic}</span>}
          <span className="tiny" style={{ fontSize: 10 }}>{lbl}</span>
        </div>
      ))}
    </div>
  );
}

// Mobile top header
function MobHeader({ title, back = false, action, sub }) {
  return (
    <div style={{ padding: '8px 16px 12px', borderBottom: '1.6px solid var(--ink)', background: 'var(--paper)' }}>
      <div className="row jc-sb ai-c">
        {back ? <span className="tiny muted">← back</span> : <span className="tiny muted">menu ≡</span>}
        <h3 style={{ fontSize: 18 }}>{title}</h3>
        {action ? <span className="tiny" style={{ color: 'var(--accent)' }}>{action}</span> : <span className="tiny muted">⚙</span>}
      </div>
      {sub && <div className="tiny muted ta-c mt4">{sub}</div>}
    </div>
  );
}

// ─── Screen 1: Mobile Dashboard ───────────────────────────────
function MobDashboard() {
  return (
    <>
      <StatusBar />
      <MobHeader title="BrewAI" sub="14 brews this week" />
      <div style={{ padding: 12, paddingBottom: 90, height: 'calc(100% - 110px)', overflow: 'hidden' }}>
        <h2 style={{ fontSize: 22 }}>Good morning</h2>
        <div className="muted small">3 today · 5-day streak 🔥</div>

        <div className="row g8 mt12">
          <div className="box pad f1" style={{ padding: 10 }}>
            <div className="label tiny">today</div>
            <div className="big" style={{ fontSize: 26 }}>3</div>
            <div className="tiny muted">brews</div>
          </div>
          <div className="box pad f1" style={{ padding: 10 }}>
            <div className="label tiny">avg ★</div>
            <div className="big" style={{ fontSize: 26 }}>4.1</div>
            <Spark />
          </div>
          <div className="box pad f1" style={{ padding: 10 }}>
            <div className="label tiny">beans</div>
            <div className="big" style={{ fontSize: 26 }}>480g</div>
            <div className="tiny muted">3 bags</div>
          </div>
        </div>

        <div className="box pad mt12">
          <div className="row jc-sb ai-c"><h4>Today's pick</h4><span className="tiny muted">12d roast</span></div>
          <div className="row g8 ai-c mt8">
            <BeanBag size={36} fill={0.35} />
            <div className="f1">
              <div className="small" style={{ fontWeight: 600 }}>Gardelli · Kenya AA</div>
              <div className="progress mt4"><i style={{ width: '35%' }} /></div>
              <div className="tiny muted mt4">142g · ~7 shots left</div>
            </div>
          </div>
        </div>

        <div className="box pad mt12">
          <div className="row jc-sb ai-c mb8"><h4>Recent</h4><span className="tiny muted">all →</span></div>
          {[
            ['07:14', 'Espresso', 'Kenya AA', 4],
            ['yest 17:02', 'V60', 'El Salvador', 5],
            ['yest 07:30', 'Espresso', 'Kenya AA', 3],
          ].map((r, i) => (
            <div key={i} className="row ai-c g8" style={{ padding: '6px 0', borderBottom: i < 2 ? '1.2px dashed var(--ink-4)' : 'none' }}>
              <div className="tiny muted" style={{ width: 70 }}>{r[0]}</div>
              <span className="chip" style={{ fontSize: 10, padding: '1px 6px' }}>{r[1]}</span>
              <div className="tiny f1">{r[2]}</div>
              <Stars n={r[3]} />
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" />
    </>
  );
}

// ─── Screen 2: Quick log (bottom sheet) ───────────────────────
function MobQuickLog() {
  return (
    <>
      <StatusBar />
      {/* dimmed bg */}
      <div style={{ padding: 12, opacity: 0.4 }}>
        <h2 style={{ fontSize: 22 }}>Good morning</h2>
        <div className="row g8 mt12">
          <div className="box pad f1" style={{ height: 60 }} />
          <div className="box pad f1" style={{ height: 60 }} />
          <div className="box pad f1" style={{ height: 60 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />

      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--paper)',
        borderTop: '2.5px solid var(--ink)',
        borderRadius: '20px 18px 0 0',
        padding: 16, paddingBottom: 24,
        height: 580,
        boxShadow: '0 -4px 0 rgba(0,0,0,.1)'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--ink-3)', borderRadius: 4, margin: '0 auto 12px' }} />
        <div className="row jc-sb ai-c">
          <h3 className="squiggle">Log a brew</h3>
          <span className="tiny muted">✕</span>
        </div>

        <div className="mt12">
          <div className="label mb4">Method</div>
          <div className="row g4" style={{ flexWrap: 'wrap' }}>
            {['Espresso', 'V60', 'Aeropress', 'French', 'Cold', 'Drip'].map((m, i) => (
              <span key={m} className={"chip" + (i === 0 ? ' sel' : '')} style={{ fontSize: 11 }}>{m}</span>
            ))}
          </div>
        </div>

        <div className="mt12">
          <div className="label mb4">Bean</div>
          <div className="input row jc-sb"><span>Kenya AA ▾</span><span className="tiny muted">142g</span></div>
        </div>

        <div className="row g8 mt12">
          <div className="f1">
            <div className="label mb4">Dose</div>
            <div className="input">18.0g</div>
          </div>
          <div className="f1">
            <div className="label mb4">Yield</div>
            <div className="input">36g</div>
          </div>
          <div className="f1">
            <div className="label mb4">Time</div>
            <div className="input">28s</div>
          </div>
        </div>

        <div className="row g8 mt12">
          <div className="f1">
            <div className="label mb4">Grind</div>
            <div className="input">2.4</div>
          </div>
          <div className="f1">
            <div className="label mb4">Temp</div>
            <div className="input">93°C</div>
          </div>
        </div>

        <div className="mt12">
          <div className="label mb4">Rating</div>
          <div className="stars" style={{ fontSize: 32 }}>★ ★ ★ ★ ☆</div>
        </div>

        <div className="row g8 mt16">
          <span className="btn f1 jc-c" style={{ justifyContent: 'center' }}>clone last</span>
          <span className="btn accent f1 jc-c" style={{ justifyContent: 'center' }}>save brew</span>
        </div>
      </div>
    </>
  );
}

// ─── Screen 3: Stats ──────────────────────────────────────────
function MobStats() {
  return (
    <>
      <StatusBar />
      <MobHeader title="Stats" />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="row g8" style={{ flexWrap: 'wrap' }}>
          <span className="chip">7d</span>
          <span className="chip sel">30d</span>
          <span className="chip">90d</span>
          <span className="chip">all</span>
        </div>

        <div className="row g8 mt12">
          <div className="box pad f1" style={{ padding: 10 }}>
            <div className="label tiny">brews</div>
            <div className="big" style={{ fontSize: 24 }}>62</div>
            <div className="tiny" style={{ color: 'var(--accent-3)' }}>+12</div>
          </div>
          <div className="box pad f1" style={{ padding: 10 }}>
            <div className="label tiny">avg ★</div>
            <div className="big" style={{ fontSize: 24 }}>4.1</div>
            <div className="tiny" style={{ color: 'var(--accent-3)' }}>+0.3</div>
          </div>
        </div>

        <div className="box pad mt12">
          <div className="row jc-sb ai-c"><h4>Rating · 30d</h4><span className="tiny muted">all</span></div>
          <div style={{ height: 80, marginTop: 4 }}><SketchLine accent dots={false} height={80} /></div>
        </div>

        <div className="box pad mt12">
          <h4 className="mb8">Grind vs rating</h4>
          <div style={{ height: 110 }}><Scatter height={110} /></div>
          <div className="tiny muted mt4">sweet spot 2.2–2.6</div>
        </div>

        <div className="box pad mt12">
          <h4 className="mb8">Method mix</h4>
          {[['Espresso', 62], ['V60', 20], ['Aeropress', 10], ['French', 6], ['Cold', 2]].map(([m, p]) => (
            <div key={m} className="mt4">
              <div className="row jc-sb tiny"><span>{m}</span><span className="muted">{p}%</span></div>
              <div className="progress"><i style={{ width: p + '%' }} /></div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="stats" />
    </>
  );
}

// ─── Screen 4: Inventory ──────────────────────────────────────
function MobInventory() {
  return (
    <>
      <StatusBar />
      <MobHeader title="Inventory" action="+ bag" />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="row g8 mb12">
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">bags</div><div className="big" style={{ fontSize: 20 }}>3</div></div>
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">total</div><div className="big" style={{ fontSize: 20 }}>482g</div></div>
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">low</div><div className="big" style={{ fontSize: 20, color: 'var(--accent)' }}>1</div></div>
        </div>

        {[
          { n: 'Kenya AA', r: 'Gardelli · 12d', p: 0.35, w: 142, t: 400, warn: false },
          { n: 'El Salvador', r: 'Onyx · 5d', p: 0.78, w: 312, t: 400, warn: false },
          { n: 'Yirgacheffe', r: 'Drop · 18d aged', p: 0.14, w: 28, t: 200, warn: true },
        ].map((b, i) => (
          <div key={i} className="box pad mt8" style={{ padding: 12 }}>
            <div className="row g8 ai-c">
              <BeanBag size={40} fill={b.p} />
              <div className="f1">
                <div className="row jc-sb ai-c">
                  <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                  {b.warn && <span className="chip accent" style={{ fontSize: 10 }}>low</span>}
                </div>
                <div className="tiny muted">{b.r}</div>
                <div className="progress mt4"><i style={{ width: (b.p * 100) + '%' }} /></div>
                <div className="row jc-sb mt4 tiny muted">
                  <span>{b.w}g left</span><span>of {b.t}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <TabBar active="beans" />
    </>
  );
}

// ─── Screen 5: Roasters ───────────────────────────────────────
function MobRoasters() {
  const roasters = [
    { n: 'Gardelli', loc: 'Forlì, IT', beans: 4, rt: 4.4 },
    { n: 'Onyx Coffee Lab', loc: 'Arkansas, US', beans: 3, rt: 4.6 },
    { n: 'The Drop', loc: 'Stockholm, SE', beans: 2, rt: 3.9 },
    { n: 'La Cabra', loc: 'Aarhus, DK', beans: 1, rt: 4.2 },
  ];
  return (
    <>
      <StatusBar />
      <MobHeader title="Roasters" action="+ new" />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="input small muted mb12">🔍 search roasters…</div>

        {roasters.map((r, i) => (
          <div key={i} className="box pad mt8" style={{ padding: 12 }}>
            <div className="row g8 ai-c">
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                border: '2px solid var(--ink)', background: 'var(--paper-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--hand-disp)', fontSize: 16, fontWeight: 700
              }}>{r.n.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
              <div className="f1">
                <div className="small" style={{ fontWeight: 600 }}>{r.n}</div>
                <div className="tiny muted">{r.loc}</div>
              </div>
              <div className="ta-r">
                <Stars n={Math.round(r.rt)} />
                <div className="tiny muted">{r.beans} beans</div>
              </div>
            </div>
          </div>
        ))}

        <div className="box pad dashed mt12" style={{ padding: 16, textAlign: 'center', color: 'var(--ink-3)' }}>
          <span style={{ fontSize: 24, fontFamily: 'var(--hand-disp)' }}>+</span>
          <div className="tiny">Add new roaster</div>
        </div>
      </div>
      <TabBar active="more" />
    </>
  );
}

// ─── Screen 6: Beans (profiles) ───────────────────────────────
function MobBeans() {
  const beans = [
    { n: 'Kenya AA', r: 'Gardelli', invs: 2, rt: 4.2, color: '#3a2516' },
    { n: 'La Esperanza', r: 'Onyx', invs: 1, rt: 4.6, color: '#5a2e1a' },
    { n: 'Yirgacheffe', r: 'The Drop', invs: 1, rt: 3.9, color: '#7a4a22' },
    { n: 'Las Flores', r: 'La Cabra', invs: 0, rt: 4.2, color: '#6b3a18' },
  ];
  return (
    <>
      <StatusBar />
      <MobHeader title="Beans" action="+ new" />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="note" style={{ fontSize: 11, padding: '6px 10px', marginBottom: 10 }}>
          Roaster ⟶ <b>Bean</b> ⟶ many bags. Each profile groups bag inventories.
        </div>

        <div className="row g8" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
          <span className="chip sel" style={{ fontSize: 10 }}>all</span>
          <span className="chip" style={{ fontSize: 10 }}>active</span>
          <span className="chip" style={{ fontSize: 10 }}>archive</span>
        </div>

        {beans.map((b, i) => (
          <div key={i} className="box pad mt8" style={{ padding: 12 }}>
            <div className="row g8 ai-c">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '2px solid var(--ink)',
                background: `radial-gradient(circle at 35% 35%, ${b.color}, #1d1a17)`
              }} />
              <div className="f1">
                <div className="row jc-sb ai-c">
                  <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                  {b.invs === 0
                    ? <span className="chip" style={{ fontSize: 10, opacity: 0.6 }}>archived</span>
                    : <span className="chip accent" style={{ fontSize: 10 }}>{b.invs} bag{b.invs === 1 ? '' : 's'}</span>}
                </div>
                <div className="tiny muted">by {b.r}</div>
                <Stars n={Math.round(b.rt)} />
              </div>
            </div>
          </div>
        ))}

        <div className="box pad dashed mt12" style={{ padding: 16, textAlign: 'center', color: 'var(--ink-3)' }}>
          <span style={{ fontSize: 24, fontFamily: 'var(--hand-disp)' }}>+</span>
          <div className="tiny">New bean profile</div>
        </div>
      </div>
      <TabBar active="beans" />
    </>
  );
}

// ─── Screen 7: Bean profile detail ────────────────────────────
function MobBeanDetail() {
  return (
    <>
      <StatusBar />
      <MobHeader title="Kenya AA" back />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="row g12 ai-c">
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            border: '2px solid var(--ink)',
            background: 'radial-gradient(circle at 35% 35%, #3a2516, #1d1a17)'
          }} />
          <div className="f1">
            <h3>Kenya AA</h3>
            <div className="tiny muted">by Gardelli · Nyeri, KE</div>
            <div className="row g4 mt4" style={{ flexWrap: 'wrap' }}>
              <span className="chip" style={{ fontSize: 10 }}>washed</span>
              <span className="chip" style={{ fontSize: 10 }}>SL28</span>
              <span className="chip" style={{ fontSize: 10 }}>light</span>
            </div>
          </div>
        </div>

        <div className="row g8 mt12">
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">on shelf</div><div className="big" style={{ fontSize: 20 }}>142g</div></div>
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">avg ★</div><div className="big" style={{ fontSize: 20 }}>4.2</div></div>
          <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">brews</div><div className="big" style={{ fontSize: 20 }}>28</div></div>
        </div>

        <div className="label mt12">Tasting notes</div>
        <div className="row g4 mt4" style={{ flexWrap: 'wrap' }}>
          {['floral', 'black currant', 'tea-like', 'juicy'].map(t => <span key={t} className="chip" style={{ fontSize: 10 }}>{t}</span>)}
        </div>

        <div className="row jc-sb ai-c mt16">
          <h4>Bags · 2</h4>
          <span className="tiny" style={{ color: 'var(--accent)' }}>+ add bag</span>
        </div>
        {[
          { tag: 'active', date: '12d', p: 0.35, w: '142/400g' },
          { tag: 'finished', date: '41d', p: 0, w: '0/400g' },
        ].map((bag, i) => (
          <div key={i} className="box pad mt8" style={{ padding: 10 }}>
            <div className="row g8 ai-c">
              <BeanBag size={28} fill={bag.p} />
              <div className="f1">
                <div className="row jc-sb">
                  <span className={"chip" + (bag.tag === 'active' ? ' sel' : '')} style={{ fontSize: 10 }}>{bag.tag}</span>
                  <span className="tiny muted">roasted {bag.date}</span>
                </div>
                <div className="progress mt4"><i style={{ width: (bag.p * 100) + '%' }} /></div>
                <div className="tiny muted mt4">{bag.w}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Screen 8: Brew journal (mobile) ──────────────────────────
function MobJournal() {
  return (
    <>
      <StatusBar />
      <MobHeader title="Journal" action="+ entry" />
      <div style={{ padding: 12, paddingBottom: 90, overflow: 'hidden', height: 'calc(100% - 110px)' }}>
        <div className="tiny muted ta-c" style={{ letterSpacing: 2, textTransform: 'uppercase' }}>tue · apr 22</div>
        <h2 className="ta-c mt4" style={{ fontSize: 24 }}>Today</h2>

        <div style={{ position: 'relative', paddingLeft: 20, marginTop: 16 }}>
          <div style={{ position: 'absolute', left: 6, top: 4, bottom: 0, width: 2, background: 'var(--ink)' }} />

          {[
            { t: '07:14', m: 'Espresso', bean: 'Kenya AA', notes: 'floral, juicy, a bit under', s: 4 },
            { t: 'yest 17:02', m: 'V60', bean: 'El Salvador', notes: 'chocolatey, heavy body', s: 5 },
            { t: 'yest 07:30', m: 'Espresso', bean: 'Kenya AA', notes: 'too fast, channeling', s: 3 },
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 10 }}>
              <div style={{
                position: 'absolute', left: -20, top: 8, width: 14, height: 14,
                borderRadius: '50%', background: 'var(--paper)', border: '2px solid var(--ink)'
              }} />
              <div className="box pad" style={{ padding: 10 }}>
                <div className="row jc-sb ai-c">
                  <span className="tiny muted">{e.t}</span>
                  <Stars n={e.s} />
                </div>
                <div className="row g4 ai-c mt4">
                  <span className="chip" style={{ fontSize: 10 }}>{e.m}</span>
                  <span className="small">{e.bean}</span>
                </div>
                <div className="tiny mt4" style={{ fontStyle: 'italic' }}>"{e.notes}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" />
    </>
  );
}

// ─── FOLDABLE / ULTRAWIDE ─────────────────────────────────────
// Two-pane layout: list/nav left, detail right. Designed for unfolded
// foldables (~720pt wide) and tablets.
function FoldableFrame({ children, label, width = 880, height = 640 }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {label && <div className="label">{label}</div>}
      <div style={{
        position: 'relative',
        width: width + 30, height: height + 30,
        border: '2.5px solid var(--ink)',
        borderRadius: '24px 22px 26px 20px / 22px 26px 20px 24px',
        padding: 15, background: 'var(--paper-2)',
        boxShadow: '4px 5px 0 rgba(0,0,0,.1)'
      }}>
        {/* fold seam */}
        <div style={{
          position: 'absolute', top: 15, bottom: 15, left: '50%',
          width: 1, background: 'rgba(0,0,0,.18)', transform: 'translateX(-50%)',
          backgroundImage: 'repeating-linear-gradient(180deg, var(--ink-4) 0 4px, transparent 4px 8px)',
          zIndex: 5, pointerEvents: 'none'
        }} />
        {/* hinge label */}
        <div className="tiny muted" style={{
          position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
          letterSpacing: 1.5, fontFamily: 'var(--hand-mono)', fontSize: 9
        }}>↕ fold ↕</div>

        <div style={{
          width, height, overflow: 'hidden',
          borderRadius: 12, background: 'var(--paper)',
          position: 'relative', border: '1.5px solid var(--ink)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Foldable: Beans (list) + bean detail (right pane)
function FoldBeansSplit() {
  const beans = [
    { n: 'Kenya AA', r: 'Gardelli', invs: 2, rt: 4.2, color: '#3a2516', sel: true },
    { n: 'La Esperanza', r: 'Onyx', invs: 1, rt: 4.6, color: '#5a2e1a' },
    { n: 'Yirgacheffe', r: 'The Drop', invs: 1, rt: 3.9, color: '#7a4a22' },
    { n: 'Las Flores', r: 'La Cabra', invs: 0, rt: 4.2, color: '#6b3a18' },
  ];

  return (
    <div className="row" style={{ height: '100%' }}>
      {/* LEFT pane — list */}
      <div style={{ flex: 1, borderRight: '2px solid var(--ink)', overflow: 'hidden' }}>
        <StatusBar />
        <div style={{ padding: '8px 14px 10px', borderBottom: '1.6px solid var(--ink)' }}>
          <div className="row jc-sb ai-c">
            <h3 style={{ fontSize: 18 }}>Beans</h3>
            <span className="btn sm accent" style={{ fontSize: 11, padding: '3px 8px' }}>+ new</span>
          </div>
          <div className="input small muted mt8">🔍 search…</div>
        </div>
        <div style={{ padding: 10, overflow: 'hidden' }}>
          {beans.map((b, i) => (
            <div key={i} className={"box pad" + (b.sel ? ' fill-soft' : '')} style={{ padding: 10, marginBottom: 8, border: b.sel ? '2.5px solid var(--ink)' : '2px solid var(--ink)' }}>
              <div className="row g8 ai-c">
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2px solid var(--ink)',
                  background: `radial-gradient(circle at 35% 35%, ${b.color}, #1d1a17)`
                }} />
                <div className="f1">
                  <div className="row jc-sb">
                    <div className="small" style={{ fontWeight: 600 }}>{b.n}</div>
                    {b.invs > 0 && <span className="chip" style={{ fontSize: 10 }}>{b.invs}</span>}
                  </div>
                  <div className="tiny muted">{b.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT pane — detail */}
      <div style={{ flex: 1.2, overflow: 'hidden', position: 'relative' }}>
        <StatusBar />
        <div style={{ padding: '8px 16px 10px', borderBottom: '1.6px solid var(--ink)' }}>
          <div className="row jc-sb ai-c">
            <h3 style={{ fontSize: 18 }}>Kenya AA</h3>
            <div className="row g8">
              <span className="btn sm" style={{ fontSize: 11, padding: '3px 8px' }}>edit</span>
              <span className="btn sm accent" style={{ fontSize: 11, padding: '3px 8px' }}>+ bag</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 12, overflow: 'hidden' }}>
          <div className="row g12 ai-c">
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid var(--ink)',
              background: 'radial-gradient(circle at 35% 35%, #3a2516, #1d1a17)'
            }} />
            <div className="f1">
              <div className="small">by <b>Gardelli</b> · Nyeri, KE</div>
              <div className="row g4 mt4" style={{ flexWrap: 'wrap' }}>
                <span className="chip" style={{ fontSize: 10 }}>washed</span>
                <span className="chip" style={{ fontSize: 10 }}>SL28</span>
                <span className="chip" style={{ fontSize: 10 }}>light</span>
                <span className="chip" style={{ fontSize: 10 }}>1,750m</span>
              </div>
            </div>
          </div>

          <div className="row g8 mt12">
            <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">shelf</div><div className="big" style={{ fontSize: 20 }}>142g</div></div>
            <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">★</div><div className="big" style={{ fontSize: 20 }}>4.2</div></div>
            <div className="box pad f1" style={{ padding: 8 }}><div className="tiny muted">brews</div><div className="big" style={{ fontSize: 20 }}>28</div></div>
          </div>

          <div className="label mt12">Bags inventory</div>
          {[
            { tag: 'active', date: '12d', p: 0.35, w: '142/400g' },
            { tag: 'finished', date: '41d', p: 0, w: '0/400g' },
          ].map((bag, i) => (
            <div key={i} className="box pad mt8" style={{ padding: 8 }}>
              <div className="row g8 ai-c">
                <BeanBag size={26} fill={bag.p} />
                <span className={"chip" + (bag.tag === 'active' ? ' sel' : '')} style={{ fontSize: 10 }}>{bag.tag}</span>
                <div className="tiny muted f1">roasted {bag.date}</div>
                <div style={{ width: 80 }}><div className="progress"><i style={{ width: (bag.p * 100) + '%' }} /></div></div>
                <div className="tiny" style={{ width: 70, textAlign: 'right' }}>{bag.w}</div>
              </div>
            </div>
          ))}

          <div className="row g12 mt12">
            <div className="f1">
              <div className="label mb4">rating trend</div>
              <div style={{ height: 60 }}><SketchLine accent dots={false} height={60} /></div>
            </div>
            <div className="f1">
              <div className="label mb4">grind vs ★</div>
              <div style={{ height: 60 }}><Scatter height={60} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Foldable: Dashboard (left) + Quick log (right) — power-user mode
function FoldDashboardLog() {
  return (
    <div className="row" style={{ height: '100%' }}>
      <div style={{ flex: 1.2, borderRight: '2px solid var(--ink)', overflow: 'hidden' }}>
        <StatusBar />
        <div style={{ padding: '8px 14px 10px', borderBottom: '1.6px solid var(--ink)' }}>
          <h3>Dashboard</h3>
          <div className="tiny muted">14 brews this week · 5-day streak 🔥</div>
        </div>
        <div style={{ padding: 12, overflow: 'hidden' }}>
          <div className="row g8">
            <div className="box pad f1" style={{ padding: 10 }}><div className="tiny muted">today</div><div className="big" style={{ fontSize: 22 }}>3</div></div>
            <div className="box pad f1" style={{ padding: 10 }}><div className="tiny muted">avg ★</div><div className="big" style={{ fontSize: 22 }}>4.1</div></div>
            <div className="box pad f1" style={{ padding: 10 }}><div className="tiny muted">beans</div><div className="big" style={{ fontSize: 22 }}>480g</div></div>
          </div>
          <div className="box pad mt12">
            <h4 className="mb8">Rating · 30d</h4>
            <div style={{ height: 70 }}><SketchLine accent dots={false} height={70} /></div>
          </div>
          <div className="box pad mt12">
            <h4 className="mb8">Brews / day</h4>
            <div style={{ height: 60 }}>
              <MiniBars data={[60, 80, 40, 70, 90, 55, 75]} accent={[4]} />
            </div>
          </div>
          <div className="box pad mt12">
            <h4 className="mb8">Recent</h4>
            {[['07:14', 'Espresso', 'Kenya', 4], ['yest', 'V60', 'El Salv', 5]].map((r, i) => (
              <div key={i} className="row ai-c g8" style={{ padding: '4px 0' }}>
                <span className="tiny muted" style={{ width: 50 }}>{r[0]}</span>
                <span className="chip" style={{ fontSize: 10 }}>{r[1]}</span>
                <span className="small f1">{r[2]}</span>
                <Stars n={r[3]} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', background: 'var(--paper-2)' }}>
        <StatusBar />
        <div style={{ padding: '8px 14px 10px', borderBottom: '1.6px solid var(--ink)' }}>
          <div className="row jc-sb ai-c">
            <h3 className="squiggle">Quick log</h3>
            <span className="kbd">L</span>
          </div>
          <div className="tiny muted">always-visible · power user</div>
        </div>
        <div style={{ padding: 12 }}>
          <div className="label mb4">Method</div>
          <div className="row g4" style={{ flexWrap: 'wrap' }}>
            {['Espresso', 'V60', 'Aero', 'French', 'Cold'].map((m, i) => (
              <span key={m} className={"chip" + (i === 0 ? ' sel' : '')} style={{ fontSize: 11 }}>{m}</span>
            ))}
          </div>
          <div className="label mb4 mt12">Bean</div>
          <div className="input row jc-sb"><span>Kenya AA ▾</span><span className="tiny muted">142g</span></div>

          <div className="row g8 mt12">
            <div className="f1"><div className="label">Dose</div><div className="input">18.0g</div></div>
            <div className="f1"><div className="label">Yield</div><div className="input">36g</div></div>
          </div>
          <div className="row g8 mt8">
            <div className="f1"><div className="label">Time</div><div className="input">28s</div></div>
            <div className="f1"><div className="label">Grind</div><div className="input">2.4</div></div>
          </div>

          <div className="label mt12 mb4">Rating</div>
          <div className="stars" style={{ fontSize: 28 }}>★ ★ ★ ★ ☆</div>

          <div className="row g8 mt16">
            <span className="btn f1 jc-c" style={{ justifyContent: 'center' }}>clone</span>
            <span className="btn accent f1 jc-c" style={{ justifyContent: 'center' }}>save brew</span>
          </div>

          <div className="note mt12" style={{ fontSize: 11 }}>
            Foldable advantage: log without leaving the dashboard view.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PhoneFrame, FoldableFrame,
  MobDashboard, MobQuickLog, MobStats, MobInventory,
  MobRoasters, MobBeans, MobBeanDetail, MobJournal,
  FoldBeansSplit, FoldDashboardLog
});

// ====================================================================
// ROASTERS PAGE — list of roasters with + New roaster
// ====================================================================
function RoastersPage() {
  const roasters = [
    { n: 'Gardelli Specialty Coffees', loc: 'Forlì, Italy', est: 2003, beans: 4, fav: 'Kenya AA', rt: 4.4, brews: 38, last: '2d ago' },
    { n: 'Onyx Coffee Lab', loc: 'Arkansas, USA', est: 2012, beans: 3, fav: 'El Salvador', rt: 4.6, brews: 22, last: 'yest' },
    { n: 'The Drop Coffee', loc: 'Stockholm, SE', est: 2009, beans: 2, fav: 'Yirgacheffe', rt: 3.9, brews: 14, last: '5d' },
    { n: 'Square Mile', loc: 'London, UK', est: 2008, beans: 0, fav: '—', rt: 4.0, brews: 9, last: '3w' },
    { n: 'La Cabra', loc: 'Aarhus, DK', est: 2012, beans: 1, fav: 'Colombia', rt: 4.2, brews: 11, last: '6d' },
  ];
  return (
    <div className="wf" style={{ width: 1100, height: 820 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← back</span>
            <h2>Roasters</h2>
          </div>
          <div className="row g8">
            <div className="input small muted" style={{ width: 200 }}>🔍 search roasters…</div>
            <span className="chip">A–Z ▾</span>
            <span className="btn primary">+ New roaster</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* summary */}
        <div className="row g12 mb16">
          <div className="box pad f1"><div className="label">total roasters</div><div className="big mt4">5</div></div>
          <div className="box pad f1"><div className="label">active</div><div className="big mt4">4</div><div className="tiny muted">have beans on shelf</div></div>
          <div className="box pad f1"><div className="label">favorite</div><div className="big mt4" style={{ fontSize: 22 }}>Onyx</div><div className="tiny muted">★ 4.6 avg</div></div>
          <div className="box pad f1"><div className="label">total brews</div><div className="big mt4">94</div></div>
        </div>

        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {roasters.map((r, i) => (
            <div key={i} className={"box pad" + (i === 1 ? ' tilt-l' : i === 2 ? ' tilt-r' : '')}>
              <div className="row jc-sb ai-c">
                {/* avatar — sketched circular logo placeholder */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '2px solid var(--ink)',
                  background: 'var(--paper-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--hand-disp)', fontSize: 22, fontWeight: 700
                }}>{r.n.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                <span className="chip">{r.beans} bean{r.beans === 1 ? '' : 's'}</span>
              </div>
              <h3 className="mt8" style={{ fontSize: 22 }}>{r.n}</h3>
              <div className="tiny muted">{r.loc} · est. {r.est}</div>

              <div className="h-sep dashed mt12" />
              <div className="col g4 mt8 small">
                <div className="row jc-sb"><span className="muted">favorite bean</span><b>{r.fav}</b></div>
                <div className="row jc-sb"><span className="muted">avg rating</span><Stars n={Math.round(r.rt)} /></div>
                <div className="row jc-sb"><span className="muted">total brews</span><b>{r.brews}</b></div>
                <div className="row jc-sb"><span className="muted">last brewed</span><b>{r.last}</b></div>
              </div>
              <div className="row jc-e mt12 g8">
                <span className="chip">view →</span>
                <span className="chip">edit</span>
              </div>
            </div>
          ))}

          {/* + new roaster card */}
          <div className="box pad dashed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 50, fontFamily: 'var(--hand-disp)', lineHeight: 1 }}>+</div>
            <div className="small mt4" style={{ fontWeight: 600 }}>New roaster</div>
            <div className="tiny muted mt4 ta-c" style={{ maxWidth: 200 }}>add a roaster you'll buy from. beans then attach to it.</div>
          </div>
        </div>

        <div className="annot" style={{ top: 110, right: 30 }}>quick add ⤴</div>
        <div className="annot green" style={{ top: 540, left: 740 }}>card → bean profile</div>
      </div>
    </div>
  );
}

// ====================================================================
// NEW ROASTER MODAL — supporting flow
// ====================================================================
function NewRoasterModal() {
  return (
    <div className="wf" style={{ width: 1100, height: 700, position: 'relative' }}>
      {/* dimmed roasters page peek */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--paper-2)', opacity: 0.6 }}>
        <div style={{ padding: 24 }}>
          <div className="label">roasters</div>
          <div className="row g12 mt12">
            {[1,2,3].map(i => (
              <div key={i} className="box pad f1" style={{ height: 140, opacity: 0.5 }}>
                <div className="scribble-lines" style={{ height: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />

      {/* modal */}
      <div className="box pad" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 580, background: 'var(--paper)',
        boxShadow: '6px 8px 0 rgba(0,0,0,.15)'
      }}>
        <div className="row jc-sb ai-c">
          <div className="label">add roaster</div>
          <span className="tiny muted">esc</span>
        </div>
        <h2 className="mt4">New roaster</h2>

        <div className="col g12 mt16">
          <div>
            <div className="label mb4">Name *</div>
            <div className="input">Gardelli Specialty Coffees</div>
          </div>
          <div className="row g12">
            <div className="f1">
              <div className="label mb4">City</div>
              <div className="input">Forlì</div>
            </div>
            <div className="f1">
              <div className="label mb4">Country</div>
              <div className="input">Italy ▾</div>
            </div>
          </div>
          <div className="row g12">
            <div className="f1">
              <div className="label mb4">Website</div>
              <div className="input">gardellicoffee.com</div>
            </div>
            <div className="f1">
              <div className="label mb4">Founded</div>
              <div className="input">2003</div>
            </div>
          </div>
          <div>
            <div className="label mb4">Tags</div>
            <div className="row g8" style={{ flexWrap: 'wrap' }}>
              <span className="chip sel">specialty</span>
              <span className="chip sel">light roast</span>
              <span className="chip">filter</span>
              <span className="chip">espresso</span>
              <span className="chip" style={{ borderStyle: 'dashed' }}>+ tag</span>
            </div>
          </div>
          <div>
            <div className="label mb4">Notes</div>
            <div className="box" style={{ padding: 10, minHeight: 50 }}>
              <div className="scribble-lines short" style={{ height: 30 }} />
            </div>
          </div>
        </div>

        <div className="note mt12">
          <b>Next:</b> after saving, you can add beans to this roaster from the Beans page.
        </div>

        <div className="row jc-sb mt16 ai-c">
          <span className="btn sm">cancel</span>
          <div className="row g8">
            <span className="btn">save & add bean →</span>
            <span className="btn accent">save roaster</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// BEANS PAGE — list of bean profiles (each → roaster + many inventories)
// ====================================================================
function BeansPage() {
  const beans = [
    { n: 'Kenya AA', roaster: 'Gardelli', origin: 'Nyeri, Kenya', process: 'washed', vari: 'SL28 / SL34', notes: ['floral', 'black currant', 'juicy'], invs: 2, weight: 142, rt: 4.2, brews: 28, color: '#3a2516' },
    { n: 'La Esperanza', roaster: 'Onyx', origin: 'Chalatenango, El Salvador', process: 'natural', vari: 'Bourbon', notes: ['chocolate', 'plum', 'heavy body'], invs: 1, weight: 312, rt: 4.6, brews: 12, color: '#5a2e1a' },
    { n: 'Yirgacheffe Konga', roaster: 'The Drop', origin: 'Yirgacheffe, ET', process: 'washed', vari: 'Heirloom', notes: ['jasmine', 'lemon', 'tea-like'], invs: 1, weight: 28, rt: 3.9, brews: 14, color: '#7a4a22' },
    { n: 'Colombia Las Flores', roaster: 'La Cabra', origin: 'Huila, CO', process: 'honey', vari: 'Pink Bourbon', notes: ['stone fruit', 'syrupy'], invs: 0, weight: 0, rt: 4.2, brews: 11, color: '#6b3a18' },
  ];

  return (
    <div className="wf" style={{ width: 1100, height: 820 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← back</span>
            <h2>Beans</h2>
            <span className="tiny muted">· bean profiles, separate from physical bags</span>
          </div>
          <div className="row g8">
            <div className="input small muted" style={{ width: 180 }}>🔍 search…</div>
            <span className="chip">all roasters ▾</span>
            <span className="chip">all origins ▾</span>
            <span className="btn primary">+ New bean</span>
          </div>
        </div>
      </div>

      {/* Schema explainer note */}
      <div style={{ padding: '14px 24px 0' }}>
        <div className="note" style={{ display: 'inline-block', transform: 'rotate(-0.5deg)' }}>
          <b>Data model:</b> &nbsp; Roaster &nbsp;⟶&nbsp; <b>Bean</b> (this page) &nbsp;⟶&nbsp; many Inventory bags (pantry).
          A bean profile is the <i>recipe of beans</i>; each new bag of the same bean = a new inventory entry.
        </div>
      </div>

      <div style={{ padding: '14px 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {beans.map((b, i) => (
          <div key={i} className={"box pad" + (i % 2 ? ' tilt-r' : ' tilt-l')}>
            <div className="row g12">
              {/* bean swatch */}
              <div style={{
                width: 72, height: 72, flexShrink: 0,
                borderRadius: '50%',
                border: '2px solid var(--ink)',
                background: `radial-gradient(circle at 35% 35%, ${b.color}, #1d1a17)`,
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: '15% 35% 15% 47%', borderLeft: '2px solid rgba(255,255,255,.15)', transform: 'rotate(8deg)', borderRadius: '50%' }} />
              </div>

              <div className="f1">
                <div className="row jc-sb ai-c">
                  <h3 style={{ fontSize: 22 }}>{b.n}</h3>
                  {b.invs === 0
                    ? <span className="chip" style={{ opacity: 0.6 }}>archived</span>
                    : <span className="chip accent">{b.invs} bag{b.invs === 1 ? '' : 's'}</span>}
                </div>
                <div className="tiny muted">by <b>{b.roaster}</b> · {b.origin}</div>
                <div className="row g8 mt8" style={{ flexWrap: 'wrap' }}>
                  <span className="chip">{b.process}</span>
                  <span className="chip">{b.vari}</span>
                </div>
              </div>
            </div>

            <div className="h-sep dashed mt12" />

            <div className="row mt12 g16">
              <div className="f1">
                <div className="label">on shelf</div>
                <div className="big mt4">{b.weight}g</div>
                <div className="tiny muted">{b.invs} inventory</div>
              </div>
              <div className="f1">
                <div className="label">avg rating</div>
                <div className="row ai-c g8 mt4"><Stars n={Math.round(b.rt)} /></div>
                <div className="tiny muted">{b.rt} over {b.brews} brews</div>
              </div>
              <div className="f2">
                <div className="label">tasting notes</div>
                <div className="row g4 mt4" style={{ flexWrap: 'wrap' }}>
                  {b.notes.map(n => <span key={n} className="chip">{n}</span>)}
                </div>
              </div>
            </div>

            {/* Mini inventory strip showing bag children */}
            {b.invs > 0 && (
              <div className="mt12">
                <div className="tiny muted mb4">inventory bags</div>
                <div className="row g8">
                  {Array.from({ length: b.invs }).map((_, k) => (
                    <div key={k} className="row g8 ai-c box" style={{ padding: '6px 10px', flex: 1 }}>
                      <BeanBag size={26} fill={k === 0 ? 0.35 : 0.78} />
                      <div className="tiny">
                        <div><b>bag #{k + 1}</b></div>
                        <div className="muted">roasted {k === 0 ? '12d' : '5d'} · {k === 0 ? 142 : 312}g</div>
                      </div>
                    </div>
                  ))}
                  <span className="chip" style={{ borderStyle: 'dashed', alignSelf: 'center' }}>+ bag</span>
                </div>
              </div>
            )}

            <div className="row jc-e g8 mt12">
              <span className="chip">open profile →</span>
            </div>
          </div>
        ))}

        {/* + new bean tile */}
        <div className="box pad dashed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, color: 'var(--ink-3)', gridColumn: 'span 2' }}>
          <div className="row ai-c g16">
            <div style={{ fontSize: 60, fontFamily: 'var(--hand-disp)', lineHeight: 1 }}>+</div>
            <div>
              <div style={{ fontFamily: 'var(--hand-disp)', fontSize: 26 }}>New bean profile</div>
              <div className="tiny muted" style={{ maxWidth: 360 }}>
                add a bean (origin, process, variety, tasting notes) — then attach physical bags to it on the inventory page.
              </div>
            </div>
            <span className="btn primary">+ New bean</span>
          </div>
        </div>
      </div>

      <div className="annot" style={{ top: 110, right: 30 }}>+ new bean ⤴</div>
      <div className="annot green" style={{ top: 200, left: 30 }}>↘ schema reminder</div>
    </div>
  );
}

// ====================================================================
// BEAN PROFILE DETAIL — single bean → its inventories + brew history
// ====================================================================
function BeanProfilePage() {
  return (
    <div className="wf" style={{ width: 1100, height: 820 }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--ink)' }}>
        <div className="row jc-sb ai-c">
          <div className="row ai-c g8">
            <span className="tiny muted">← Beans</span>
            <span className="tiny muted">/</span>
            <h2>Kenya AA</h2>
          </div>
          <div className="row g8">
            <span className="btn sm">edit</span>
            <span className="btn sm">archive</span>
            <span className="btn accent">+ new bag of this bean</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
        {/* LEFT — profile card */}
        <div>
          <div className="box pad">
            <div className="row g12">
              <div style={{
                width: 88, height: 88,
                borderRadius: '50%',
                border: '2px solid var(--ink)',
                background: 'radial-gradient(circle at 35% 35%, #3a2516, #1d1a17)'
              }} />
              <div className="f1">
                <h2 style={{ fontSize: 26 }}>Kenya AA</h2>
                <div className="small">by <b>Gardelli</b></div>
                <div className="tiny muted">Nyeri, Kenya</div>
              </div>
            </div>

            <div className="h-sep dashed mt12" />

            <div className="col g8 mt12 small">
              <div className="row jc-sb"><span className="muted">process</span><b>washed</b></div>
              <div className="row jc-sb"><span className="muted">variety</span><b>SL28 / SL34</b></div>
              <div className="row jc-sb"><span className="muted">altitude</span><b>1,750 m</b></div>
              <div className="row jc-sb"><span className="muted">roast level</span><b>light</b></div>
              <div className="row jc-sb"><span className="muted">best for</span><b>espresso · filter</b></div>
            </div>

            <div className="h-sep dashed mt12" />

            <div className="label mt12">tasting notes</div>
            <div className="row g4 mt8" style={{ flexWrap: 'wrap' }}>
              {['floral', 'black currant', 'tea-like', 'juicy', 'bright acidity'].map(t => <span key={t} className="chip">{t}</span>)}
            </div>

            <div className="h-sep dashed mt12" />

            <div className="label mt12">recommended recipe</div>
            <div className="col g4 mt8 small">
              <div>• 18.0g in → 36g out</div>
              <div>• grind 2.4 · 28s</div>
              <div>• 93°C</div>
            </div>
          </div>
        </div>

        {/* RIGHT — inventories + history */}
        <div className="col g14">
          {/* KPIs */}
          <div className="row g12">
            <div className="box pad f1"><div className="label">on shelf</div><div className="big mt4">142g</div><div className="tiny muted">across 1 bag</div></div>
            <div className="box pad f1"><div className="label">total ever</div><div className="big mt4">800g</div><div className="tiny muted">2 bags lifetime</div></div>
            <div className="box pad f1"><div className="label">avg rating</div><div className="big mt4">4.2 ★</div><div className="tiny muted">28 brews</div></div>
            <div className="box pad f1"><div className="label">cost / brew</div><div className="big mt4">$0.62</div><div className="tiny muted">$28/400g bag</div></div>
          </div>

          {/* inventories */}
          <div className="box pad">
            <div className="row jc-sb ai-c mb8">
              <h3 className="squiggle">Inventory · pantry</h3>
              <span className="tiny muted">multiple bags can share this profile</span>
            </div>
            <div className="col g8">
              {[
                { tag: 'active', date: 'Apr 10 · 12d', p: 0.35, w: '142 / 400g', cost: '$28' },
                { tag: 'finished', date: 'Mar 12 · 41d', p: 0, w: '0 / 400g', cost: '$28' },
              ].map((bag, i) => (
                <div key={i} className="row ai-c g12" style={{ padding: 10, borderBottom: i === 0 ? '1.4px dashed var(--ink-4)' : 'none' }}>
                  <BeanBag size={32} fill={bag.p} />
                  <span className={"chip" + (bag.tag === 'active' ? ' sel' : '')}>{bag.tag}</span>
                  <div className="small f1">roasted {bag.date}</div>
                  <div style={{ width: 140 }}><div className="progress"><i style={{ width: (bag.p * 100) + '%' }} /></div></div>
                  <div className="tiny muted" style={{ width: 90, textAlign: 'right' }}>{bag.w}</div>
                  <div className="tiny" style={{ width: 50, textAlign: 'right' }}>{bag.cost}</div>
                  <span className="chip">⋯</span>
                </div>
              ))}
              <div className="row ai-c g12 mt4">
                <span className="btn sm">+ add new bag of Kenya AA</span>
                <span className="tiny muted">creates a new inventory entry under this bean</span>
              </div>
            </div>
          </div>

          {/* brew history mini */}
          <div className="box pad">
            <div className="row jc-sb ai-c mb8">
              <h3 className="squiggle">Brew history</h3>
              <span className="tiny muted">28 brews · last today 07:14</span>
            </div>
            <div className="row g16">
              <div className="f1">
                <div className="label mb4">rating trend</div>
                <div style={{ height: 80 }}><SketchLine accent dots={false} height={80} /></div>
              </div>
              <div className="f1">
                <div className="label mb4">grind vs rating</div>
                <div style={{ height: 80 }}><Scatter height={80} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="annot" style={{ top: 360, right: 60 }}>↑ many bags → one bean profile</div>
      <div className="annot green" style={{ top: 230, left: 360 }}>recipes live with the bean</div>
    </div>
  );
}

Object.assign(window, { RoastersPage, NewRoasterModal, BeansPage, BeanProfilePage });

// ——— App: assemble the design canvas ———
const { DesignCanvas, DCSection, DCArtboard, PostIt } = window;

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="intro"
        title="Coffee Brewing — Wireframes"
        subtitle="Low-fi sketchy explorations · home brewing hobbyist · main dashboard + linked sub-pages · hero action: log a brew fast"
      >
        <DCArtboard id="readme" label="README · goals & assumptions" width={640} height={820}>
          <div className="wf" style={{ width: 640, height: 820 }}>
            <div className="pad" style={{ padding: 32 }}>
              <h1 style={{ fontSize: 52 }}>BrewAI</h1>
              <div className="squiggle" style={{ display: 'inline-block', fontFamily: 'var(--hand-disp)', fontSize: 26 }}>
                the home brewing logbook
              </div>

              <div className="note mt16" style={{ transform: 'rotate(-1deg)' }}>
                <b>Hey manager —</b> these are 4 rough dashboard directions for the "log a brew + see stats + track beans" page, plus 3 supporting sub-pages. All low-fi, no color commitments yet.
              </div>

              <div className="mt24">
                <h3 className="squiggle">Assumptions</h3>
                <ul style={{ fontSize: 15, lineHeight: 1.7, paddingLeft: 20 }}>
                  <li>User is a home brewing hobbyist — logs 1–3 brews/day</li>
                  <li>Primary action: <b>log a brew in under 10 seconds</b></li>
                  <li>7 methods: espresso, V60/Chemex, Aeropress, French press, cold brew, moka, drip</li>
                  <li>Inventory = beans only (bag, roaster, origin, roast date, weight left)</li>
                  <li>Stats care: grind vs rating, bean usage/cost, brews per day, favorites, rating trend, extraction/TDS</li>
                  <li>Main dashboard → links to stats · inventory · log pages</li>
                </ul>
              </div>

              <div className="mt16">
                <h3 className="squiggle">What's in this canvas</h3>
                <div className="col g8 mt8" style={{ fontSize: 14 }}>
                  <div className="row g8"><b style={{ width: 90 }}>A ·</b> Sidebar dashboard + ⌘L hero button (most conventional)</div>
                  <div className="row g8"><b style={{ width: 90 }}>B ·</b> Top nav + always-visible <i>Quick Log</i> rail (fastest path)</div>
                  <div className="row g8"><b style={{ width: 90 }}>C ·</b> Bento-grid stats + <i>wizard modal</i> for logging</div>
                  <div className="row g8"><b style={{ width: 90 }}>D ·</b> "Brew Journal" editorial timeline + inline entry</div>
                  <div className="row g8"><b style={{ width: 90 }}>Stats ·</b> Full sub-page, drill into metrics</div>
                  <div className="row g8"><b style={{ width: 90 }}>Inv ·</b> Full bean inventory table + archive</div>
                  <div className="row g8"><b style={{ width: 90 }}>Log ·</b> Full-page form (when quick log isn't enough)</div>
                </div>
              </div>

              <div className="h-sep dashed mt16" />
              <div className="mt16">
                <h3 className="squiggle">Open questions</h3>
                <ul style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 20 }}>
                  <li>Pick a direction (or a hybrid) and I'll push it to mid/hi-fi</li>
                  <li>Should quick-log also appear on mobile as a FAB, or its own screen?</li>
                  <li>Add water profile / milk to inventory later? (scope'd out for now)</li>
                  <li>Do recipes live inside stats, or their own page?</li>
                </ul>
              </div>

              <div className="note mt16" style={{ transform: 'rotate(1deg)', background: '#ffe4cc' }}>
                <b>Tip:</b> open the <i>Tweaks</i> panel (toolbar toggle) to change sketch weight, hide annotations, swap the accent, or adjust density.
              </div>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="dashboards"
        title="Dashboards — 4 directions"
        subtitle="All show: recent brews · rating trend · grind vs rating · inventory · brews/day. What differs: layout, info architecture, and how you log a brew."
      >
        <DCArtboard id="var-a" label="A · Sidebar + hero log button" width={1280} height={820}>
          <VariationA />
        </DCArtboard>

        <DCArtboard id="var-b" label="B · Top nav + always-on Quick Log rail" width={1280} height={820}>
          <VariationB />
        </DCArtboard>

        <DCArtboard id="var-c" label="C · Bento grid + wizard modal" width={1280} height={820}>
          <VariationC />
        </DCArtboard>

        <DCArtboard id="var-d" label="D · Brew journal · editorial timeline" width={1280} height={820}>
          <VariationD />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="subpages"
        title="Supporting sub-pages"
        subtitle="These sit behind the main dashboard and are shared across all 4 directions (minor tweaks needed depending on chosen nav)."
      >
        <DCArtboard id="stats" label="Stats · drill-down" width={1100} height={720}>
          <StatsPage />
        </DCArtboard>

        <DCArtboard id="inv" label="Inventory · full bean list" width={1100} height={720}>
          <InventoryPage />
        </DCArtboard>

        <DCArtboard id="log" label="Log brew · full-page form" width={900} height={820}>
          <LogBrewPage />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="roasters-beans"
        title="Roasters & Beans"
        subtitle="Data model: Roaster ⟶ Bean profile ⟶ many Inventory bags. Each bean belongs to one roaster; each physical bag in the pantry is an inventory entry under a bean."
      >
        <DCArtboard id="roasters" label="Roasters · list + add" width={1100} height={820}>
          <RoastersPage />
        </DCArtboard>

        <DCArtboard id="new-roaster" label="Roasters · + New roaster modal" width={1100} height={700}>
          <NewRoasterModal />
        </DCArtboard>

        <DCArtboard id="beans" label="Beans · profiles + add" width={1100} height={820}>
          <BeansPage />
        </DCArtboard>

        <DCArtboard id="bean-detail" label="Bean profile · detail (inventories + history)" width={1100} height={820}>
          <BeanProfilePage />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="mobile"
        title="Mobile · phone screens"
        subtitle="Same pages, redesigned for ~360pt portrait phones. Bottom tab bar with center FAB-style log button. Quick-log appears as a bottom sheet."
      >
        <DCArtboard id="m-dash" label="Dashboard" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobDashboard /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-log" label="Quick log · bottom sheet" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobQuickLog /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-stats" label="Stats" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobStats /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-inv" label="Inventory" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobInventory /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-roasters" label="Roasters" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobRoasters /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-beans" label="Beans" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobBeans /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-bean-detail" label="Bean profile detail" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobBeanDetail /></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="m-journal" label="Brew journal · timeline" width={408} height={808}>
          <PhoneFrame width={360} height={760}><MobJournal /></PhoneFrame>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="foldable"
        title="Foldable / ultrawide"
        subtitle="Two-pane split layouts that take advantage of unfolded foldables (~720–880pt wide). List + detail, or dashboard + always-visible quick-log."
      >
        <DCArtboard id="fold-beans" label="Foldable · Beans list + detail (master/detail)" width={920} height={690}>
          <FoldableFrame width={880} height={640}><FoldBeansSplit /></FoldableFrame>
        </DCArtboard>
        <DCArtboard id="fold-dash" label="Foldable · Dashboard + always-visible Quick Log" width={920} height={690}>
          <FoldableFrame width={880} height={640}><FoldDashboardLog /></FoldableFrame>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="next"
        title="Next steps"
        subtitle="Once we pick a direction"
      >
        <DCArtboard id="next-card" label="what's next" width={640} height={420}>
          <div className="wf pad" style={{ width: 640, height: 420, padding: 32 }}>
            <h2 className="squiggle">After you pick a direction</h2>
            <div className="col g12 mt16" style={{ fontSize: 15, lineHeight: 1.5 }}>
              <div className="row g12 ai-c">
                <span className="chip accent">1</span>
                <div>Commit to a layout (A/B/C/D or a mix) and I'll rebuild at mid-fi with real type, greyscale, and a pixel grid</div>
              </div>
              <div className="row g12 ai-c">
                <span className="chip accent">2</span>
                <div>Mobile variants — quick-log is the highest-stakes mobile flow; needs its own pass</div>
              </div>
              <div className="row g12 ai-c">
                <span className="chip accent">3</span>
                <div>Design system pass — type scale, color, a real component kit</div>
              </div>
              <div className="row g12 ai-c">
                <span className="chip accent">4</span>
                <div>Empty states (no brews yet, no beans, first-run) and error/edit flows</div>
              </div>
            </div>
            <div className="note mt16">
              Reply with which variation resonates — or mix & match ("A's layout + B's quick-log rail + D's timeline for Today") and I'll run with it.
            </div>
          </div>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

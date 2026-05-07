// Shared wireframe primitives — sketchy low-fi parts

// Mini bar chart (random-ish heights)
function MiniBars({ data = [40, 65, 30, 80, 55, 70, 45], accent = [] }) {
  return (
    <div className="bars">
      {data.map((h, i) => (
        <div key={i} className={"bar" + (accent.includes(i) ? " accent" : "")} style={{ height: h + '%' }} />
      ))}
    </div>
  );
}

// Rough line chart with dots
function SketchLine({ points, width = 260, height = 80, accent = false, dots = true }) {
  const pts = points || [10, 30, 20, 45, 35, 60, 50, 55, 65, 70, 62, 78];
  const stepX = width / (pts.length - 1);
  const maxY = 100;
  const path = pts.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / maxY) * height * 0.9 - 5;
    return (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }).join(' ');
  // Jitter for sketchy feel
  const jitter = (n) => n + (Math.sin(n * 13.37) * 0.8);
  const roughPath = pts.map((v, i) => {
    const x = jitter(i * stepX);
    const y = jitter(height - (v / maxY) * height * 0.9 - 5);
    return (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }).join(' ');
  return (
    <div className="line-chart" style={{ width: '100%', height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={roughPath} className={accent ? 'accent' : ''} />
        {dots && pts.map((v, i) => {
          const x = i * stepX;
          const y = height - (v / maxY) * height * 0.9 - 5;
          if (i % 2 !== 0) return null;
          return <circle key={i} cx={x} cy={y} r={3} />;
        })}
      </svg>
    </div>
  );
}

// Scatter (grind size vs rating)
function Scatter({ width = 240, height = 150 }) {
  const pts = [
    [15, 80], [22, 70], [30, 55], [38, 40], [45, 35],
    [52, 25], [25, 65], [33, 45], [41, 35], [48, 30],
    [18, 75], [28, 60], [35, 48], [42, 38], [50, 28],
    [20, 72], [32, 52], [40, 42],
  ];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {/* axes */}
      <path d={`M 20 ${height - 20} L ${width - 5} ${height - 20}`} stroke="#1d1a17" strokeWidth="2" fill="none" />
      <path d={`M 20 ${height - 20} L 20 5`} stroke="#1d1a17" strokeWidth="2" fill="none" />
      {/* trend line */}
      <path d={`M 25 ${height - 30} Q ${width / 2} ${height - 50} ${width - 15} ${height - 100}`}
        stroke="#c2410c" strokeWidth="2" fill="none" strokeDasharray="4 4" opacity="0.7" />
      {pts.map(([x, y], i) => (
        <circle key={i}
          cx={20 + (x / 60) * (width - 30)}
          cy={height - 20 - (y / 100) * (height - 30)}
          r={3.2 + (i % 3) * 0.5}
          fill={i % 4 === 0 ? "#c2410c" : "#1d1a17"}
          opacity={0.75} />
      ))}
    </svg>
  );
}

// Heatmap (brews per day, like GitHub contrib)
function Heat({ rows = 5, cols = 12 }) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // pseudo-random intensity
      const s = Math.abs(Math.sin(r * 3 + c * 7.3)) * 4 | 0; // 0..3
      cells.push(s);
    }
  }
  const color = (s) => ['#f3ede1', '#d9cfb8', '#9c6b3b', '#3a2516'][s];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 3, width: '100%'
    }}>
      {cells.map((s, i) => (
        <div key={i} style={{
          aspectRatio: '1', background: color(s),
          border: '1.4px solid #1d1a17', borderRadius: 2
        }} />
      ))}
    </div>
  );
}

// Stars
function Stars({ n = 4, total = 5 }) {
  const s = [];
  for (let i = 0; i < total; i++) s.push(i < n ? '★' : '☆');
  return <span className="stars">{s.join(' ')}</span>;
}

// Bean bag icon (svg)
function BeanBag({ size = 36, fill = 0.6 }) {
  return (
    <svg viewBox="0 0 40 46" width={size} height={size * 46 / 40}>
      <defs>
        <clipPath id={`bagclip-${Math.round(fill*100)}`}>
          <rect x="0" y={46 - fill * 36 - 4} width="40" height="46" />
        </clipPath>
      </defs>
      <path d="M8 10 L 32 10 L 33 42 Q 33 44 31 44 L 9 44 Q 7 44 7 42 Z"
            fill="#fbf8f2" stroke="#1d1a17" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 10 L 32 10 L 33 42 Q 33 44 31 44 L 9 44 Q 7 44 7 42 Z"
            fill="#1d1a17" clipPath={`url(#bagclip-${Math.round(fill*100)})`} opacity="0.85" />
      {/* fold */}
      <path d="M10 10 Q 20 2 30 10" fill="none" stroke="#1d1a17" strokeWidth="2" strokeLinecap="round" />
      {/* label */}
      <rect x="13" y="20" width="14" height="10" fill="#fbf8f2" stroke="#1d1a17" strokeWidth="1.5" />
    </svg>
  );
}

// Squiggly arrow
function Arrow({ from, to, color = 'var(--accent)', curve = 30, dashed = false, style = {} }) {
  // from/to: {x,y}
  const cx = (from.x + to.x) / 2 + curve;
  const cy = (from.y + to.y) / 2 - curve;
  const maxX = Math.max(from.x, to.x) + 20;
  const maxY = Math.max(from.y, to.y) + 20;
  const minX = Math.min(from.x, to.x) - 20;
  const minY = Math.min(from.y, to.y) - 20;
  return (
    <svg className="arrow" style={{
      left: minX, top: minY, width: maxX - minX, height: maxY - minY, ...style
    }} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      <defs>
        <marker id={`ah-${Math.round(from.x+from.y+to.x+to.y)}`} markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
          <path d="M0 0 L 8 5 L 0 10 Z" fill={color} />
        </marker>
      </defs>
      <path d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
        stroke={color} strokeWidth="2" fill="none"
        strokeDasharray={dashed ? '5 4' : undefined}
        strokeLinecap="round"
        markerEnd={`url(#ah-${Math.round(from.x+from.y+to.x+to.y)})`} />
    </svg>
  );
}

// Sparkline
function Spark({ pts, color = 'var(--ink)' }) {
  const data = pts || [3, 5, 2, 6, 4, 7, 5, 8, 6, 7];
  const w = 80, h = 24;
  const max = Math.max(...data), min = Math.min(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h * 0.9 - 2;
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Donut (fraction)
function Donut({ value = 0.65, label = '65%' }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" width={80} height={80}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="#a59d94" strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1d1a17" strokeWidth="6"
        strokeDasharray={`${c * value} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round"
        transform="rotate(-90 40 40)" />
      <text x="40" y="46" textAnchor="middle" fontFamily="Caveat" fontSize="22" fill="#1d1a17">{label}</text>
    </svg>
  );
}

Object.assign(window, { MiniBars, SketchLine, Scatter, Heat, Stars, BeanBag, Arrow, Spark, Donut });

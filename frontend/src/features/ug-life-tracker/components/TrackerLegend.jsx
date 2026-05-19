function Swatch({ bg, border, dashed }) {
  return (
    <div style={{
      width: 12,
      height: 12,
      borderRadius: 2,
      background: bg,
      border: border ? `1px ${dashed ? "dashed" : "solid"} ${border}` : "none",
      flexShrink: 0,
    }} />
  );
}

export default function TrackerLegend() {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        flexWrap: "wrap",
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 6,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Swatch bg="#374151" />
          <span>–</span>
          <Swatch bg="#c8dfc0" />
          <Swatch bg="#7dba6e" />
          <Swatch bg="#4a9e3c" />
          <Swatch bg="#2d7a24" />
          <Swatch bg="#145014" />
          <span>Semester week (score 1–5)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Swatch bg="#b8d0e0" border="#7aaccc" dashed />
          <span>–</span>
          <Swatch bg="#5a8aaa" />
          <span>Break week</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Swatch bg="var(--text)" border="var(--muted)" />
          <span>This week</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#818cf8", flexShrink: 0,
          }} />
          <span>Has note</span>
        </div>
      </div>
      <div style={{
        textAlign: "center",
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}>
        ← Click any past week to reflect & score
      </div>
    </div>
  );
}

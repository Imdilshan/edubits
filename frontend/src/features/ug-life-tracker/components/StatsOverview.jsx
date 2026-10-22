export default function StatsOverview({ stats }) {
  const items = [
    { value: stats.elapsed, label: "Weeks Elapsed", green: false },
    { value: stats.scored,  label: "Weeks Scored",  green: true  },
    { value: stats.avg,     label: "Average Score", green: true  },
    { value: stats.remaining, label: "Week\nRemain", green: false },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 10,
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: "16px 8px",
            textAlign: "center",
            borderRight: i < 3 ? "1px solid var(--border)" : "none",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.2rem, 4vw, 2rem)",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 8,
            color: item.green ? "#4ade80" : "var(--text)",
          }}>
            {item.value}
          </div>
          <div style={{
            fontSize: "clamp(8px, 2vw, 10px)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted)",
            lineHeight: 1.4,
            whiteSpace: "pre-line",
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
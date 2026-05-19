export default function StatsOverview({ stats }) {
  const items = [
    { value: stats.elapsed, label: "Weeks Elapsed", green: false },
    { value: stats.scored, label: "Weeks Scored", green: true },
    { value: stats.avg, label: "Average Score", green: true },
    { value: stats.remaining, label: "Weeks Remaining", green: false },
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
            padding: "20px 16px",
            textAlign: "center",
            borderRight: i < 3 ? "1px solid var(--border)" : "none",
          }}
        >
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 8,
            color: item.green ? "#4ade80" : "var(--text)",
          }}>
            {item.value}
          </div>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            lineHeight: 1.4,
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

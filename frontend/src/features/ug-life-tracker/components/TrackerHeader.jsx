export default function TrackerHeader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px 32px" }}>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: "var(--text)",
        margin: 0,
        marginBottom: 18,
      }}>
        Engineering <em style={{ fontStyle: "italic", fontWeight: 400, color: "#4ade80" }}>Tracker</em>
      </h1>
      <p style={{
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--muted)",
        lineHeight: 2,
        margin: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        Enter the first day of your UnderGraduation.<br />
        TRACK YOUR ENGINEERING JOURNEY WEEK BY WEEK. <br/>
        MEASURE CONSISTENCY, LEARNING, AND GROWTH.<br />
        No one is watching. The record is yours alone.
      </p>
    </div>
  );
}

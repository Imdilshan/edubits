import { useState } from "react";
import { useTrackerState } from "./hooks/useTrackerState.js";
import TrackerHeader from "./components/TrackerHeader.jsx";
import SetupPanel from "./components/SetupPanel.jsx";
import SemesterBanner from "./components/SemesterBanner.jsx";
import StatsOverview from "./components/StatsOverview.jsx";
import TrackerLegend from "./components/TrackerLegend.jsx";
import YearSection from "./components/YearSection.jsx";
import WeekDetailsDrawer from "./components/WeekDetailsDrawer.jsx";
import DateOverridePanel from "./components/DateOverridePanel.jsx";
import "./ugLifeTracker.css";

export default function UGLifeTrackerPage() {
  const {
    state,
    calendarData,
    stats,
    handleBuild,
    handleScore,
    handleClearScore,
    handleNoteChange,
    handleSaveOverrides,
    handleClearOverrides,
  } = useTrackerState();

  const [showOverrides, setShowOverrides] = useState(false);
  const [drawerCtx, setDrawerCtx] = useState(null);

  const onSaveOverrides = (overrides) => {
    handleSaveOverrides(overrides);
    setShowOverrides(false);
  };

  const onClearOverrides = () => {
    handleClearOverrides();
    setShowOverrides(false);
  };

  return (
    <div
      className="ugl-page"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <TrackerHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" }}>
        <SetupPanel startDate={state.startDate} onBuild={handleBuild} />

        {calendarData && (
          <div
            onClick={() => setShowOverrides((s) => !s)}
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              cursor: "pointer",
              textAlign: "right",
              marginBottom: 10,
              userSelect: "none",
            }}
          >
            {showOverrides ? "✕ Close Date Overrides" : "◎ Adjust Individual Semester Dates"}
          </div>
        )}

        {showOverrides && calendarData && (
          <DateOverridePanel
            calendarData={calendarData}
            overrides={state.overrides}
            onSave={onSaveOverrides}
            onClear={onClearOverrides}
          />
        )}

        {calendarData && stats && (
          <>
            <SemesterBanner calendarData={calendarData} />
            <StatsOverview stats={stats} />
            <TrackerLegend />

            {calendarData.map((yr) => (
              <YearSection
                key={yr.year}
                yearData={yr}
                scores={state.scores}
                notes={state.notes}
                onOpenWeek={setDrawerCtx}
              />
            ))}
          </>
        )}
      </div>

      {drawerCtx && (
        <WeekDetailsDrawer
          ctx={drawerCtx}
          scores={state.scores}
          notes={state.notes}
          onScore={handleScore}
          onNoteChange={handleNoteChange}
          onClearScore={handleClearScore}
          onClose={() => setDrawerCtx(null)}
        />
      )}
    </div>
  );
}

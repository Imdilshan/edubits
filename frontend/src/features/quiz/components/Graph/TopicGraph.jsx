import React, { useRef, useState, useEffect } from "react";
import { MousePointer2, Move } from "lucide-react";
import { getTopicIcon } from "../../utils/topicIcons";

export default function TopicGraph({ topics, onTopicClick }) {
  const svgRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(null);
  const isDraggingRef = useRef(false);

  // Keep refs in sync with state so touch handlers (added via useEffect) can
  // read the latest values without stale closure issues.
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { isDraggingRef.current = dragging; }, [dragging]);

  const rawMinX = Math.min(...topics.map((t) => t.position.x));
  const rawMinY = Math.min(...topics.map((t) => t.position.y));
  const layoutTopics = topics.map((topic) => ({
    ...topic,
    position: {
      x: (topic.position.x - rawMinX) * 1.2 + 50,
      y: (topic.position.y - rawMinY) * 0.55 + 35,
    },
    originalTopic: topic,
  }));

  const topicMap = new Map(layoutTopics.map((t) => [t._id, t]));

  const edges = [];
  layoutTopics.forEach((topic) => {
    (topic.prerequisites || []).forEach((prereq) => {
      const fromTopic = topicMap.get(prereq._id || prereq);
      if (fromTopic) edges.push({ from: fromTopic, to: topic });
    });
  });

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.target.closest(".topic-node")) return;
    setDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };
  const onMouseUp = () => setDragging(false);

  // ── Touch handlers attached as non-passive so preventDefault works ────────
  // React's onTouchMove is passive by default — cannot call preventDefault there.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        isDraggingRef.current = true;
        setDragging(true);
        dragStartRef.current = {
          x: t.clientX - panRef.current.x,
          y: t.clientY - panRef.current.y,
        };
        lastTouchDist.current = null;
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        setDragging(false);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e) => {
      // Only prevent default (and hijack scroll) when actually interacting
      // with the graph — single-finger pan or two-finger pinch.
      if (e.touches.length === 1 && isDraggingRef.current) {
        e.preventDefault();
        const t = e.touches[0];
        const newPan = {
          x: t.clientX - dragStartRef.current.x,
          y: t.clientY - dragStartRef.current.y,
        };
        panRef.current = newPan;
        setPan(newPan);
      } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const ratio = newDist / lastTouchDist.current;
        setScale((s) => Math.min(3, Math.max(0.3, s * ratio)));
        lastTouchDist.current = newDist;
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setDragging(false);
      lastTouchDist.current = null;
    };

    // { passive: false } is required to allow e.preventDefault()
    svg.addEventListener("touchstart", handleTouchStart, { passive: true });
    svg.addEventListener("touchmove", handleTouchMove, { passive: false });
    svg.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      svg.removeEventListener("touchstart", handleTouchStart);
      svg.removeEventListener("touchmove", handleTouchMove);
      svg.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const NODE_W = 180;
  const NODE_H = 76;
  const ARROW_SIZE = 9;

  const getEdgePath = (from, to) => {
    const fromRight = from.position.x + NODE_W;
    const fromLeft = from.position.x;
    const fromCenterX = from.position.x + NODE_W / 2;
    const fromCenterY = from.position.y + NODE_H / 2;
    const toLeft = to.position.x;
    const toRight = to.position.x + NODE_W;
    const toCenterX = to.position.x + NODE_W / 2;
    const toCenterY = to.position.y + NODE_H / 2;

    const leftToRight = toCenterX >= fromCenterX;
    const x1 = leftToRight ? fromRight + 10 : fromLeft - 10;
    const x2 = leftToRight ? toLeft - 14 : toRight + 14;
    const y1 = fromCenterY;
    const y2 = toCenterY;

    if (Math.abs(y1 - y2) < 8) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    const midX = x1 + (x2 - x1) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  };

  const minX = 0;
  const minY = 0;
  const maxX = Math.max(...layoutTopics.map((t) => t.position.x)) + NODE_W + 60;
  const maxY = Math.max(...layoutTopics.map((t) => t.position.y)) + NODE_H + 45;

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <p className="quiz-graph-hint">
        <Move size={16} />
        Drag to pan
        <MousePointer2 size={16} />
        Click an unlocked node to start
      </p>

      <svg
        ref={svgRef}
        width="100%"
        className="quiz-graph-svg"
        style={{
          height: Math.max(280, maxY - minY),
          cursor: dragging ? "grabbing" : "grab",
        }}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            refX={ARROW_SIZE - 1}
            refY={ARROW_SIZE / 2}
            orient="auto"
          >
            <path
              d={`M0,0 L0,${ARROW_SIZE} L${ARROW_SIZE},${ARROW_SIZE / 2} z`}
              fill="#4a90e2"
            />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {edges.map(({ from, to }, i) => (
            <path
              key={i}
              className="quiz-graph-edge"
              d={getEdgePath(from, to)}
              fill="none"
              markerEnd="url(#arrow)"
            />
          ))}

          {layoutTopics.map((topic) => {
            const { _id, name, color, unlocked, completed, position } = topic;
            const TopicIcon = getTopicIcon(name);

            return (
              <g
                key={_id}
                className={`topic-node quiz-graph-node ${unlocked ? "is-unlocked" : "is-locked"} ${completed ? "is-complete" : ""}`}
                transform={`translate(${position.x}, ${position.y})`}
                style={{
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.58,
                  "--topic-color": color || "var(--primary)",
                }}
                onClick={() => onTopicClick(topic.originalTopic)}
              >
                <rect width={NODE_W} height={NODE_H} rx={12} />
                <foreignObject x={0} y={0} width={NODE_W} height={NODE_H}>
                  <div className="quiz-graph-node-card">
                    <TopicIcon size={27} strokeWidth={2.2} />
                    <div>
                      <div className="quiz-graph-node-title">{name}</div>
                      <div className="quiz-graph-node-subtitle">
                        {completed
                          ? "Completed"
                          : unlocked
                          ? "Ready to start"
                          : "Prerequisite locked"}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
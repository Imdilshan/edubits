import React, { useRef, useState } from "react";
import { MousePointer2, Move } from "lucide-react";
import { getTopicIcon } from "../../utils/topicIcons";

export default function TopicGraph({ topics, onTopicClick }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const onMouseDown = (e) => {
    if (e.target.closest(".topic-node")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);
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
          <marker id="arrow" markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} refX={ARROW_SIZE - 1} refY={ARROW_SIZE / 2} orient="auto">
            <path d={`M0,0 L0,${ARROW_SIZE} L${ARROW_SIZE},${ARROW_SIZE / 2} z`} fill="#4a90e2" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {edges.map(({ from, to }, i) => {
            return (
              <path
                key={i}
                className="quiz-graph-edge"
                d={getEdgePath(from, to)}
                fill="none"
                markerEnd="url(#arrow)"
              />
            );
          })}

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
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                />

                <foreignObject x={0} y={0} width={NODE_W} height={NODE_H}>
                  <div className="quiz-graph-node-card">
                    <TopicIcon size={27} strokeWidth={2.2} />
                    <div>
                      <div className="quiz-graph-node-title">{name}</div>
                      <div className="quiz-graph-node-subtitle">
                        {completed ? "Completed" : unlocked ? "Ready to start" : "Prerequisite locked"}
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

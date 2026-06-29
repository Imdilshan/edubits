import React, { useRef, useState, useEffect } from "react";
import { Move, MousePointer2 } from "lucide-react";

export default function ProgrammingGraph({ topics, onTopicClick }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { isDraggingRef.current = dragging; }, [dragging]);

  // Fill the remaining visible viewport below the graph's own top offset.
  // We also track the container's real width so the viewBox can be set to
  // actual pixel dimensions — that way node size (NODE_W/NODE_H) stays fixed
  // regardless of canvas size, instead of being stretched by preserveAspectRatio.
  useEffect(() => {
    const updateSize = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const top = rect?.top ?? 0;
      setViewportHeight(Math.max(420, window.innerHeight - top - 32));
      if (rect?.width) setCanvasWidth(rect.width);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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

  // Single-parent edges only — purely visual ordering, no unlock logic.
  const edges = [];
  layoutTopics.forEach((topic) => {
    const parentId = topic.parentTopic?._id || topic.parentTopic;
    if (!parentId) return;
    const fromTopic = topicMap.get(parentId);
    if (fromTopic) edges.push({ from: fromTopic, to: topic });
  });

  const onMouseDown = (e) => {
    if (e.target.closest(".prog-node")) return;
    setDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };
  const onMouseUp = () => setDragging(false);

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

  // viewBox spans the actual rendered canvas size (1:1 pixel units), but grows
  // to fit content if topics are laid out beyond the visible area — so nodes
  // never get stretched larger/smaller just because the container is tall.
  const contentMaxX = Math.max(...layoutTopics.map((t) => t.position.x)) + NODE_W + 60;
  const contentMaxY = Math.max(...layoutTopics.map((t) => t.position.y)) + NODE_H + 45;
  const minX = 0;
  const minY = 0;
  const maxX = Math.max(canvasWidth, contentMaxX);
  const maxY = Math.max(viewportHeight, contentMaxY);

  return (
    <div ref={wrapperRef} style={{ position: "relative", userSelect: "none" }}>
      <p className="prog-graph-hint">
        <Move size={16} />
        Drag to pan
        <MousePointer2 size={16} />
        Click a topic to view problems
      </p>

      <svg
        ref={svgRef}
        width="100%"
        className="prog-graph-svg"
        style={{
          height: viewportHeight,
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
            id="prog-arrow"
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            refX={ARROW_SIZE - 1}
            refY={ARROW_SIZE / 2}
            orient="auto"
          >
            <path
              d={`M0,0 L0,${ARROW_SIZE} L${ARROW_SIZE},${ARROW_SIZE / 2} z`}
              fill="var(--primary)"
            />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {edges.map(({ from, to }, i) => (
            <path
              key={i}
              className="prog-graph-edge"
              d={getEdgePath(from, to)}
              fill="none"
              markerEnd="url(#prog-arrow)"
            />
          ))}

          {layoutTopics.map((topic) => {
            const { _id, name, position } = topic;
            return (
              <g
                key={_id}
                className="prog-node prog-graph-node"
                transform={`translate(${position.x}, ${position.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onTopicClick(topic.originalTopic)}
              >
                <rect width={NODE_W} height={NODE_H} rx={12} />
                <foreignObject x={0} y={0} width={NODE_W} height={NODE_H}>
                  <div className="prog-graph-node-card">
                    <div className="prog-graph-node-title">{name}</div>
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
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WarmTooltip from "../ui/WarmTooltip";
import "./MagneticMorphingNav.css";

const MotionDiv = motion.div;

export default function MagneticMorphingNav({
  activeTab,
  onTabChange,
  tabs = [],
  className = "",
  mobileIconOnly = false,
}) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setHoveredTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`magnetic-nav-container ${mobileIconOnly ? "nav-mobile-icons-only" : ""} ${className}`}>
      <div ref={navRef} className="magnetic-nav">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;

          return (
            <WarmTooltip
              key={tab.id}
              content={`Open ${tab.label} ${tab.count !== undefined ? `(${tab.count})` : ""}`}
              side="bottom"
            >
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`magnetic-nav-item ${isActive ? "active" : ""}`}
                aria-label={tab.label}
                title={tab.label}
              >
                {isActive && (
                  <MotionDiv
                    layoutId="active-pill"
                    className="nav-pill-active"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {!isActive && isHovered && (
                  <AnimatePresence>
                    <MotionDiv
                      layoutId="hover-pill"
                      className="nav-pill-hover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  </AnimatePresence>
                )}

                <span className="nav-content">
                  {tab.icon && <span className="nav-icon">{tab.icon}</span>}
                  <span className="nav-label">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className="nav-count"
                      style={{
                        fontSize: 11,
                        padding: "1px 6px",
                        borderRadius: "9999px",
                        background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                        marginLeft: 2,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            </WarmTooltip>
          );
        })}
      </div>
    </div>
  );
}

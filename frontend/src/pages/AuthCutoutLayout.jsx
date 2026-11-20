import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import WarmTooltip from "../components/ui/WarmTooltip";
import GradientASCII from "../components/ui/GradientASCII";

function ConcaveScoop({ className = "" }) {
  return (
    <svg
      className={`auth-scoop ${className}`}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <path d="M0 0 H24 A24 24 0 0 0 0 24 Z" fill="currentColor" />
    </svg>
  );
}

export default function AuthCutoutLayout({
  mode,
  title,
  subtitle,
  children,
}) {
  const isLogin = mode === "login";
  const stepLabel = isLogin ? "01/02" : "02/02";
  const alternatePath = isLogin ? "/register" : "/login";
  const alternateLabel = isLogin ? "Create account" : "Log in";

  const [asciiConfig, setAsciiConfig] = useState(() => {
    if (typeof window === "undefined") return { scale: 0.65, cellSize: 16 };
    const w = window.innerWidth;
    if (w < 640) return { scale: 1.15, cellSize: 13 };
    if (w < 920) return { scale: 0.95, cellSize: 15 };
    return { scale: 0.65, cellSize: 16 };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setAsciiConfig({ scale: 1.15, cellSize: 13 });
      else if (w < 920) setAsciiConfig({ scale: 0.95, cellSize: 15 });
      else setAsciiConfig({ scale: 0.65, cellSize: 16 });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-frame">
        <div className="auth-canvas">
          {/* Subtle atmospheric vignette */}
          <div className="auth-canvas-vignette" aria-hidden="true" />

          {/* Center Logo Stage with Eclipse ASCII background */}
          <div className="auth-center-stage" aria-hidden="true">
            <div className="auth-logo-stage-wrap">
              <div className="auth-logo-ascii-layer">
                <GradientASCII
                  shape="eclipse"
                  colors={["#115d62", "#1f7771", "#3e9b8f", "#5cc2b4"]}
                  scale={asciiConfig.scale}
                  density={0.8}
                  glyphOpacity={0.88}
                  softness={0.95}
                  speed={0.8}
                  cellSize={asciiConfig.cellSize}
                />
              </div>
              <img
                src="/images/favicon.png"
                alt="Edubits logo"
                className="auth-center-logo"
                width="220"
                height="220"
              />
            </div>
          </div>

          {/* Top-Left Cutout Brand Notch */}
          <header className="auth-notch-tl">
            <Link to="/" className="auth-brand-tagline" aria-label="Edubits home">
              <span className="auth-tagline-text">education in bits</span>
            </Link>
            <ConcaveScoop className="auth-scoop--tl-right" />
            <ConcaveScoop className="auth-scoop--tl-bottom" />
          </header>

          {/* Top-Right Cutout Navigation Notch */}
          <nav className="auth-notch-tr" aria-label="Auth navigation">
            <WarmTooltip content="Return to landing page" side="bottom">
              <Link to="/" className="auth-top-link">
                Home
              </Link>
            </WarmTooltip>
            <WarmTooltip content="Log in to existing account" side="bottom">
              <Link
                to="/login"
                className={`auth-top-link ${isLogin ? "is-active" : ""}`}
              >
                Log in
              </Link>
            </WarmTooltip>
            <WarmTooltip content="Create a new account" side="bottom">
              <Link
                to="/register"
                className={`auth-top-link ${!isLogin ? "is-active" : ""}`}
              >
                Sign up
              </Link>
            </WarmTooltip>
            <ConcaveScoop className="auth-scoop--tr-left" />
            <ConcaveScoop className="auth-scoop--tr-bottom" />
          </nav>

          {/* Bottom-Right Cutout Form Card */}
          <section
            className="auth-notch-br"
            aria-label={isLogin ? "Log in form" : "Create account form"}
          >
            <ConcaveScoop className="auth-scoop--br-top" />
            <ConcaveScoop className="auth-scoop--br-left" />

            <div className="auth-card-inner">
              <div className="auth-card-stepbar">
                <WarmTooltip content={`Switch to ${alternateLabel}`} side="top">
                  <Link
                    to={alternatePath}
                    className="auth-step-arrow"
                    title={alternateLabel}
                    aria-label={`Switch to ${alternateLabel}`}
                  >
                    <ArrowLeft size={14} strokeWidth={1.8} />
                  </Link>
                </WarmTooltip>
                <WarmTooltip content={isLogin ? "Step 1 of 2: Log in" : "Step 2 of 2: Register"} side="top">
                  <span className="auth-step-count">{stepLabel}</span>
                </WarmTooltip>
                <WarmTooltip content={`Switch to ${alternateLabel}`} side="top">
                  <Link
                    to={alternatePath}
                    className="auth-step-arrow"
                    title={alternateLabel}
                    aria-label={`Switch to ${alternateLabel}`}
                  >
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </Link>
                </WarmTooltip>
              </div>

              <div className="auth-card-header">
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

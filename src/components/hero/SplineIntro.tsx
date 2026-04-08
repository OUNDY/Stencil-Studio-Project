import { Suspense, lazy, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Spline = lazy(() => import("@splinetool/react-spline"));

// Spline sahne URL'i buraya gelecek — şimdilik null (placeholder modu aktif)
const SPLINE_SCENE_URL: string | null = null;

interface SplineIntroProps {
  /** Intro bitince çağrılır — HeroExperience'a geçiş */
  onComplete: () => void;
  /** Kaç ms sonra otomatik geçiş (default 4500) */
  autoSkipMs?: number;
}

export function SplineIntro({ onComplete, autoSkipMs = 4500 }: SplineIntroProps) {
  const [exiting, setExiting] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const handleComplete = () => {
    if (exiting) return;
    setExiting(true);
    // exit animasyonu bittikten sonra parent'ı bilgilendir
    setTimeout(onComplete, 700);
  };

  // Otomatik geçiş zamanlayıcısı
  useEffect(() => {
    const tid = setTimeout(handleComplete, autoSkipMs);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSkipMs]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="spline-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "#1a1410",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Spline sahnesi veya placeholder */}
          {SPLINE_SCENE_URL ? (
            <Suspense fallback={<PlaceholderScene />}>
              <Spline
                scene={SPLINE_SCENE_URL}
                onLoad={() => setSplineLoaded(true)}
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
              />
            </Suspense>
          ) : (
            <PlaceholderScene onAnimationEnd={() => setSplineLoaded(true)} />
          )}

          {/* CTA — sahne yüklenince + 1.5s sonra göster */}
          {splineLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              style={{
                position: "absolute", bottom: 48,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              }}
            >
              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "#b5673e", color: "#fff",
                  border: "none", borderRadius: 12,
                  padding: "14px 40px",
                  fontSize: 15, fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(181,103,62,0.45)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Dene ✓
              </motion.button>
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.35)",
                fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em",
              }}>
                veya bekle, otomatik devam eder
              </span>
            </motion.div>
          )}

          {/* Skip butonu — sağ üst */}
          <button
            onClick={handleComplete}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.45)", borderRadius: 8,
              padding: "6px 14px", fontSize: 11, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em",
            }}
          >
            Geç →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Placeholder sahne — Spline URL gelmeden önce gösterilen animasyon ─────────
interface PlaceholderSceneProps {
  onAnimationEnd?: () => void;
}

function PlaceholderScene({ onAnimationEnd }: PlaceholderSceneProps) {
  useEffect(() => {
    const tid = setTimeout(() => onAnimationEnd?.(), 800);
    return () => clearTimeout(tid);
  }, [onAnimationEnd]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32,
    }}>
      {/* Sahte duvar yüzeyi */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: "min(480px, 85vw)",
          height: "min(320px, 55vw)",
          borderRadius: 18,
          background: "linear-gradient(135deg, #e8ddd4 0%, #d4c8bb 40%, #c9bdb0 100%)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Doku simülasyonu */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.5' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`,
          borderRadius: 18,
        }} />

        {/* Stencil şablonu — duvardan düşüyor gibi */}
        <motion.div
          initial={{ y: -60, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 140, height: 140,
            border: "3px solid rgba(61,48,40,0.45)",
            borderRadius: 12, background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(4px)",
            boxShadow: "4px 8px 32px rgba(0,0,0,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Motif SVG — Damask */}
          <motion.svg
            viewBox="0 0 100 100"
            width="80" height="80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <g fill="#b5673e">
              <ellipse cx="50" cy="50" rx="8" ry="18"/>
              <ellipse cx="50" cy="50" rx="18" ry="8"/>
              <ellipse cx="50" cy="50" rx="5" ry="12" transform="rotate(45 50 50)"/>
              <ellipse cx="50" cy="50" rx="5" ry="12" transform="rotate(-45 50 50)"/>
              <circle cx="50" cy="50" r="4"/>
              <circle cx="50" cy="14" r="3"/>
              <circle cx="50" cy="86" r="3"/>
              <circle cx="14" cy="50" r="3"/>
              <circle cx="86" cy="50" r="3"/>
            </g>
          </motion.svg>
        </motion.div>

        {/* Boya efekti — motifin altına sızıyor */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ delay: 1.3, duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 110, height: 110,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(181,103,62,0.35) 0%, transparent 70%)",
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ textAlign: "center" }}
      >
        <div style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 600, color: "#f7f3ee",
          letterSpacing: "0.06em", marginBottom: 8,
        }}>
          Stencil
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13, color: "rgba(247,243,238,0.45)",
          letterSpacing: "0.08em",
        }}>
          Uygulamadan önce gör
        </div>
      </motion.div>
    </div>
  );
}

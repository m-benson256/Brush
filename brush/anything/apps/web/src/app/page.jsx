"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Palette,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { BASE_PAINTS } from "../data/paints";

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_CUSTOM_KEY = "mixmaster_custom_paints";
const LS_ACTIVE_KEY = "mixmaster_active_paints";

// ─── Solver ──────────────────────────────────────────────────────────────────
const calculateMix = (targetRGB, basePaints) => {
  if (basePaints.length === 0) return [];
  const { r: tr, g: tg, b: tb } = targetRGB;
  let weights = basePaints.map(() => 1 / basePaints.length);

  const getError = (w) => {
    let r = 0,
      g = 0,
      b = 0;
    w.forEach((wi, i) => {
      r += wi * basePaints[i].r;
      g += wi * basePaints[i].g;
      b += wi * basePaints[i].b;
    });
    return Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
  };

  for (let iter = 0; iter < 600; iter++) {
    const delta = 0.06 * (1 - iter / 600);
    for (let i = 0; i < weights.length; i++) {
      const tryDir = (sign) => {
        const w = [...weights];
        w[i] = Math.max(0, w[i] + sign * delta);
        const sumOthers = w.reduce((s, v, j) => (j !== i ? s + v : s), 0);
        if (sumOthers > 0) {
          const f = (1 - w[i]) / sumOthers;
          w.forEach((_, j) => {
            if (j !== i) w[j] *= f;
          });
        }
        return w;
      };
      const wP = tryDir(1),
        wM = tryDir(-1);
      const eC = getError(weights),
        eP = getError(wP),
        eM = getError(wM);
      if (eP < eC && eP < eM) weights = wP;
      else if (eM < eC) weights = wM;
    }
  }

  const total = weights.reduce((a, b) => a + b, 0);
  return basePaints
    .map((p, i) => ({
      ...p,
      percentage: Math.round((weights[i] / total) * 100),
    }))
    .filter((p) => p.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
};

const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

// Lighten a hex color by mixing with white for gradient bars
const lightenHex = (hex, amount = 0.55) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);
  return rgbToHex(r, g, b);
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function MixMaster() {
  const [targetColor, setTargetColor] = useState({
    r: 156,
    g: 130,
    b: 200,
    hex: "#9C82C8",
  });
  const [availablePaints, setAvailablePaints] = useState(
    BASE_PAINTS.map((p) => p.id),
  );
  const [customPaints, setCustomPaints] = useState([]);
  const [recipe, setRecipe] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newColor, setNewColor] = useState("#A0522D");
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [brushIcon, setBrushIcon] = useState(
    "https://api.iconify.design/mdi/brush.svg?color=white&width=40&height=40",
  );

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const nameInputRef = useRef(null);

  const allPaints = [...BASE_PAINTS, ...customPaints];

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(LS_CUSTOM_KEY);
      const savedActive = localStorage.getItem(LS_ACTIVE_KEY);
      if (savedCustom) setCustomPaints(JSON.parse(savedCustom));
      if (savedActive) setAvailablePaints(JSON.parse(savedActive));
    } catch {}
  }, []);

  // ── Fetch paintbrush icon from Iconify ───────────────────────────────────
  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const url =
          "https://api.iconify.design/mdi/brush.svg?color=white&width=40&height=40";
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const iconUrl = URL.createObjectURL(blob);
          setBrushIcon(iconUrl);
        }
      } catch {
        // Fallback to default URL if fetch fails
      }
    };
    fetchIcon();
  }, []);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(LS_ACTIVE_KEY, JSON.stringify(availablePaints));
    } catch {}
  }, [availablePaints]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_CUSTOM_KEY, JSON.stringify(customPaints));
    } catch {}
  }, [customPaints]);

  // ── Mixed preview ─────────────────────────────────────────────────────────
  const mixedColor =
    recipe.length > 0
      ? recipe.reduce(
          (acc, p) => {
            const rgb = hexToRgb(rgbToHex(p.r, p.g, p.b)) || {
              r: 0,
              g: 0,
              b: 0,
            };
            return {
              r: acc.r + (rgb.r * p.percentage) / 100,
              g: acc.g + (rgb.g * p.percentage) / 100,
              b: acc.b + (rgb.b * p.percentage) / 100,
            };
          },
          { r: 0, g: 0, b: 0 },
        )
      : null;

  useEffect(() => {
    const active = allPaints.filter((p) => availablePaints.includes(p.id));
    setRecipe(calculateMix(targetColor, active));
  }, [targetColor, availablePaints, customPaints]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = 60;
        canvas.width = size;
        canvas.height = size;
        const srcSize = Math.min(img.width, img.height) * 0.22;
        ctx.drawImage(
          img,
          (img.width - srcSize) / 2,
          (img.height - srcSize) / 2,
          srcSize,
          srcSize,
          0,
          0,
          size,
          size,
        );
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0,
          g = 0,
          b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        const px = data.length / 4;
        const avgR = Math.round(r / px),
          avgG = Math.round(g / px),
          avgB = Math.round(b / px);
        setTargetColor({
          r: avgR,
          g: avgG,
          b: avgB,
          hex: rgbToHex(avgR, avgG, avgB),
        });
        setIsProcessing(false);
      };
      img.src = ev.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (e) => {
    const hex = e.target.value;
    const rgb = hexToRgb(hex);
    if (rgb) setTargetColor({ ...rgb, hex });
  };

  const togglePaint = (id) =>
    setAvailablePaints((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const removeCustomPaint = (id) => {
    setCustomPaints((prev) => prev.filter((p) => p.id !== id));
    setAvailablePaints((prev) => prev.filter((p) => p !== id));
  };

  const addCustomPaint = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError(true);
      nameInputRef.current?.focus();
      return;
    }
    setNameError(false);
    const rgb = hexToRgb(newColor) || { r: 128, g: 128, b: 128 };
    const id = `custom-${Date.now()}`;
    const paint = {
      id,
      name: trimmed,
      color: newColor,
      hex: newColor,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      isCustom: true,
    };
    setCustomPaints((prev) => [...prev, paint]);
    setAvailablePaints((prev) => [...prev, id]);
    setNewName("");
    setNewColor("#A0522D");
  };

  const copyRecipe = () => {
    const text = recipe.map((p) => `${p.percentage}% ${p.name}`).join(" + ");
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setTargetColor({ r: 156, g: 130, b: 200, hex: "#9C82C8" });
    setAvailablePaints(BASE_PAINTS.map((p) => p.id));
    setCustomPaints([]);
    setNewName("");
    setNewColor("#A0522D");
  };

  const isDark = luminance(targetColor.r, targetColor.g, targetColor.b) < 128;
  const textOnSwatch = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.7)";

  // ── Palette Chip ──────────────────────────────────────────────────────────
  const PaletteChip = ({ paint, isActive, isCustom }) => (
    <div
      title={paint.name}
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 10,
        flexShrink: 0,
        cursor: "pointer",
        transition: "all 0.2s",
        opacity: isActive ? 1 : 0.3,
      }}
      onClick={() => !isCustom && togglePaint(paint.id)}
      onMouseEnter={(e) => {
        if (isActive) e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Paint dab */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 10,
          background: paint.color,
          border: isActive
            ? "2px solid rgba(255,255,255,0.7)"
            : "2px solid rgba(255,255,255,0.2)",
          boxShadow: isActive
            ? `0 4px 14px ${paint.color}66, 0 0 0 1px rgba(0,0,0,0.1)`
            : "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
      {/* Shine overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 10,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* × badge */}
      <button
        title={
          isCustom
            ? `Remove ${paint.name}`
            : isActive
              ? `Deactivate ${paint.name}`
              : `Activate ${paint.name}`
        }
        onClick={(e) => {
          e.stopPropagation();
          if (isCustom) removeCustomPaint(paint.id);
          else togglePaint(paint.id);
        }}
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          width: 17,
          height: 17,
          borderRadius: "50%",
          background: "rgba(20,10,40,0.65)",
          border: "1.5px solid rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          transition: "all 0.15s",
          padding: 0,
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(220,50,50,0.9)";
          e.currentTarget.style.transform = "scale(1.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,10,40,0.65)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <X size={8} color="white" strokeWidth={2.5} />
      </button>
    </div>
  );

  const activePaints = allPaints.filter((p) => availablePaints.includes(p.id));
  const inactivePaints = BASE_PAINTS.filter(
    (p) => !availablePaints.includes(p.id),
  );

  return (
    <div className="mm-root">
      {/* ── Animated aurora background ── */}
      <div className="mm-bg" />

      {/* ── Noise texture overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.035,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />

      {/* ── Floating orbs ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header className="mm-header">
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={brushIcon}
                alt="Brush"
                style={{
                  width: 40,
                  height: 40,
                  display: "block",
                }}
              />
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#fff",
                  textShadow: "0 1px 12px rgba(0,0,0,0.25)",
                }}
              >
                Brush
              </span>
            </div>
            <button
              onClick={reset}
              title="Reset everything"
              className="icon-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.28)";
                e.currentTarget.style.transform = "rotate(-30deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "rotate(0deg)";
              }}
            >
              <RotateCcw
                size={15}
                style={{ color: "rgba(255,255,255,0.85)" }}
              />
            </button>
          </div>
        </header>

        <main
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* ── Card 1: Target Color ── */}
          <div className="glass-card">
            <p className="card-label">Target Color</p>
            <p className="card-sub">Upload a photo or pick a colour to match</p>

            {/* Swatch */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                height: 164,
                borderRadius: 16,
                marginBottom: 16,
                backgroundColor: targetColor.hex,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.45)",
                boxShadow: `0 8px 32px ${targetColor.hex}55, 0 2px 8px rgba(0,0,0,0.15)`,
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.008)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {/* Shine */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.18) 0%, transparent 55%)",
                  pointerEvents: "none",
                }}
              />
              {/* Dark scrim */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.08)",
                }}
              />

              {isProcessing ? (
                <div
                  style={{
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    className="spinner"
                    style={{
                      width: 28,
                      height: 28,
                      border: `2.5px solid ${textOnSwatch}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: textOnSwatch,
                      fontWeight: 300,
                    }}
                  >
                    Sampling…
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(0,0,0,0.12)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "50%",
                      padding: 10,
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.12)"}`,
                    }}
                  >
                    <Camera
                      size={22}
                      style={{ color: textOnSwatch, display: "block" }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: textOnSwatch,
                      background: isDark
                        ? "rgba(0,0,0,0.28)"
                        : "rgba(255,255,255,0.35)",
                      backdropFilter: "blur(8px)",
                      padding: "4px 12px",
                      borderRadius: 20,
                      letterSpacing: "0.1em",
                      textShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {targetColor.hex}
                  </span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="pill-btn vibrant-btn"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  position: "relative",
                  zIndex: 10,
                  pointerEvents: "auto",
                }}
              >
                <Upload size={14} />
                <span>Upload / Camera</span>
              </button>
              <div style={{ position: "relative", zIndex: 10 }}>
                <input
                  type="color"
                  value={targetColor.hex}
                  onChange={handleColorChange}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    zIndex: 10,
                    pointerEvents: "auto",
                  }}
                />
                <button
                  className="pill-btn ghost-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    position: "relative",
                  }}
                >
                  <Palette size={14} />
                  <span>Pick Colour</span>
                </button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="sr-only"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* ── Card 2: Recipe ── */}
          {recipe.length > 0 && (
            <div className="glass-card fade-up">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <Sparkles
                      size={15}
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    />
                    <p className="card-label" style={{ marginBottom: 0 }}>
                      Mix Recipe
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(255,180,80,0.2)",
                      border: "1px solid rgba(255,180,80,0.35)",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 500,
                      color: "rgba(255,210,140,0.95)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#f5a623",
                        display: "inline-block",
                      }}
                    />
                    Closest achievable mix
                  </span>
                </div>
                <button
                  onClick={copyRecipe}
                  className="pill-btn ghost-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    padding: "7px 16px",
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Colour comparison */}
              {mixedColor && (
                <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: 6,
                        fontWeight: 400,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Target
                    </p>
                    <div
                      style={{
                        height: 52,
                        borderRadius: 12,
                        background: targetColor.hex,
                        border: "1.5px solid rgba(255,255,255,0.35)",
                        boxShadow: `0 4px 16px ${targetColor.hex}55`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(160deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: 6,
                        fontWeight: 400,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Approx. mix
                    </p>
                    <div
                      style={{
                        height: 52,
                        borderRadius: 12,
                        background: `rgb(${Math.round(mixedColor.r)},${Math.round(mixedColor.g)},${Math.round(mixedColor.b)})`,
                        border: "1.5px solid rgba(255,255,255,0.35)",
                        boxShadow: `0 4px 16px rgba(${Math.round(mixedColor.r)},${Math.round(mixedColor.g)},${Math.round(mixedColor.b)},0.4)`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(160deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paint rows */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {recipe.map((paint, idx) => {
                  const lightHex = lightenHex(paint.color, 0.5);
                  const paintRgb = hexToRgb(paint.color) || {
                    r: 128,
                    g: 128,
                    b: 128,
                  };
                  const customBadge = paint.isCustom ? (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        color: "rgba(200,180,255,0.9)",
                        background: "rgba(160,120,255,0.2)",
                        border: "1px solid rgba(160,120,255,0.3)",
                        borderRadius: 99,
                        padding: "1px 6px",
                        textTransform: "uppercase",
                      }}
                    >
                      Custom
                    </span>
                  ) : null;

                  return (
                    <div key={paint.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              flexShrink: 0,
                              background: paint.color,
                              border: "1.5px solid rgba(255,255,255,0.4)",
                              boxShadow: `0 2px 8px ${paint.color}66`,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(145deg, rgba(255,255,255,0.35) 0%, transparent 65%)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "rgba(255,255,255,0.92)",
                            }}
                          >
                            {paint.name}
                          </span>
                          {customBadge}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            fontFamily: "monospace",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {paint.percentage}%
                        </span>
                      </div>
                      {/* Gradient progress bar */}
                      <div
                        style={{
                          height: 6,
                          borderRadius: 99,
                          background: "rgba(255,255,255,0.1)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          className="bar-fill"
                          style={{
                            height: "100%",
                            width: `${paint.percentage}%`,
                            borderRadius: 99,
                            background: `linear-gradient(90deg, ${paint.color}, ${lightHex})`,
                            boxShadow: `0 2px 12px rgba(${paintRgb.r},${paintRgb.g},${paintRgb.b},0.55)`,
                            animationDelay: `${idx * 60}ms`,
                            position: "relative",
                          }}
                        >
                          {/* Shine on bar */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 22,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Info
                  size={13}
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.65,
                  }}
                >
                  Real paint mixing is subtractive — pigments interact
                  differently than digital colours. Use this recipe as a
                  starting guide and adjust by eye.
                </p>
              </div>
            </div>
          )}

          {/* ── Card 3: My Palette ── */}
          <div className="glass-card">
            <p className="card-label">My Palette</p>
            <p className="card-sub">
              Active paints — tap × to remove, or add your own below
            </p>

            {/* Active chips */}
            {activePaints.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: inactivePaints.length > 0 ? 18 : 0,
                }}
              >
                {activePaints.map((paint) => (
                  <PaletteChip
                    key={paint.id}
                    paint={paint}
                    isActive={true}
                    isCustom={!!paint.isCustom}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px 0 8px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 300,
                  }}
                >
                  No active paints — add some below
                </p>
              </div>
            )}

            {/* Inactive base paints */}
            {inactivePaints.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 400,
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    NOT IN KIT — tap to restore
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {inactivePaints.map((paint) => (
                    <PaletteChip
                      key={paint.id}
                      paint={paint}
                      isActive={false}
                      isCustom={false}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.12)",
                margin: "22px 0 18px",
              }}
            />

            {/* Add Paint section */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Add a Paint
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {/* Color swatch picker */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    background: newColor,
                    border: "2px solid rgba(255,255,255,0.5)",
                    boxShadow: `0 4px 16px ${newColor}66, 0 0 0 1px rgba(0,0,0,0.1)`,
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.3) 0%, transparent 65%)",
                    }}
                  />
                </div>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    borderRadius: 13,
                  }}
                />
              </div>

              {/* Name input */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Payne's Grey, Hooker's Green…"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCustomPaint();
                  }}
                  maxLength={48}
                  style={{
                    width: "100%",
                    padding: "11px 15px",
                    borderRadius: 13,
                    border: nameError
                      ? "1.5px solid rgba(255,100,100,0.6)"
                      : "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    fontSize: 13,
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.92)",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "all 0.18s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1.5px solid rgba(255,255,255,0.45)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = nameError
                      ? "1.5px solid rgba(255,100,100,0.6)"
                      : "1px solid rgba(255,255,255,0.2)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                />
                {nameError && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,150,150,0.9)",
                      fontWeight: 300,
                      paddingLeft: 2,
                    }}
                  >
                    Please enter a paint name
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={addCustomPaint}
              className="pill-btn vibrant-btn"
              style={{
                marginTop: 14,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Plus size={14} />
              <span>Add to Palette</span>
            </button>
          </div>
        </main>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: "Inter", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #1a0533;
        }

        /* ── Animated aurora background ── */
        @keyframes auroraShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .mm-root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 96px;
        }

        .mm-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(
            -45deg,
            #1a0533,
            #0d1b6e,
            #0a4d6e,
            #1a0533,
            #4a0e6e,
            #6b1a4e,
            #0d1b6e
          );
          background-size: 400% 400%;
          animation: auroraShift 20s ease infinite;
        }

        /* ── Floating colour orbs ── */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 52vw; height: 52vw;
          top: -8%; left: -12%;
          background: radial-gradient(circle, rgba(102,126,234,0.45) 0%, transparent 70%);
          animation: orbFloat1 18s ease-in-out infinite;
        }
        .orb-2 {
          width: 44vw; height: 44vw;
          bottom: 5%; right: -10%;
          background: radial-gradient(circle, rgba(246,79,89,0.35) 0%, transparent 70%);
          animation: orbFloat2 22s ease-in-out infinite;
        }
        .orb-3 {
          width: 38vw; height: 38vw;
          top: 45%; left: 55%;
          background: radial-gradient(circle, rgba(0,210,200,0.22) 0%, transparent 70%);
          animation: orbFloat3 26s ease-in-out infinite;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(4%, 6%) scale(1.08); }
          66%       { transform: translate(-3%, 3%) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-5%, -4%) scale(1.1); }
          70%       { transform: translate(3%, -2%) scale(0.92); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-6%, 5%) scale(1.12); }
        }

        /* ── Frosted header ── */
        .mm-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(15, 8, 40, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        }

        /* ── Glass cards ── */
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 22px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.28),
            0 2px 0 rgba(255,255,255,0.12) inset,
            0 0 0 0.5px rgba(255,255,255,0.08);
          padding: 22px 20px;
        }

        .card-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .card-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 18px;
          line-height: 1.5;
        }

        /* ── Buttons ── */
        .pill-btn {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          border-radius: 99px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
          border: none;
        }

        /* Primary vibrant gradient button */
        .vibrant-btn {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fc8c27 100%);
          background-size: 200% 200%;
          background-position: 0% 50%;
          color: #fff;
          border: none;
          box-shadow: 0 4px 20px rgba(245, 87, 108, 0.45), 0 1px 0 rgba(255,255,255,0.2) inset;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .vibrant-btn:hover {
          background-position: 100% 50%;
          transform: scale(1.03) translateY(-1px);
          box-shadow: 0 8px 28px rgba(245, 87, 108, 0.6), 0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .vibrant-btn:active { transform: scale(0.97); }

        /* Ghost frosted button */
        .ghost-btn {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          color: rgba(255,255,255,0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .ghost-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.03);
        }
        .ghost-btn:active { transform: scale(0.97); }

        /* Icon button (header reset) */
        .icon-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.25s;
        }

        /* ── Inputs ── */
        input[type="text"]::placeholder { color: rgba(255,255,255,0.3); }

        /* ── Utilities ── */
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }

        /* ── Animations ── */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spinner { animation: spin 0.9s linear infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes barGrow {
          from { width: 0 !important; }
        }
        .bar-fill { animation: barGrow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}

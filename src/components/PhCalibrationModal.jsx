import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Droplets,
  Info,
  Activity,
} from "lucide-react";
import useMqtt from "@/hooks/useMqtt";

// ─── Constants ───────────────────────────────────────────────────────────────
const STABILITY_WINDOW = 8;     // readings to consider
const STABILITY_THRESHOLD = 0.015; // ±V to be "stable"
const AUTO_CLOSE_DELAY = 5000;  // ms after completion

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Stylised flask SVG with coloured solution */
const FlaskSVG = ({ fillColor, label, labelColor }) => (
  <svg
    viewBox="0 0 90 110"
    className="w-24 h-28"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Neck */}
    <rect
      x="33" y="4" width="24" height="32" rx="3"
      fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"
    />
    {/* Cork-cap */}
    <rect
      x="31" y="2" width="28" height="7" rx="2"
      fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"
    />
    {/* Body outline */}
    <path
      d="M25 36 L8 90 Q8 100 22 100 L68 100 Q82 100 82 90 L65 36 Z"
      fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"
    />
    {/* Liquid fill */}
    <path
      d="M27 68 L11 88 Q11 98 22 98 L68 98 Q79 98 79 88 L63 68 Z"
      fill={fillColor} opacity="0.75"
    />
    {/* Highlight / bubbles */}
    <circle cx="36" cy="82" r="3.5" fill="white" opacity="0.45" />
    <circle cx="54" cy="88" r="2.5" fill="white" opacity="0.4" />
    <circle cx="46" cy="76" r="2" fill="white" opacity="0.35" />
    {/* pH label inside flask */}
    <text
      x="45" y="93" textAnchor="middle"
      fontSize="10" fontWeight="700"
      fill={labelColor} fontFamily="system-ui,sans-serif"
    >
      pH {label}
    </text>
  </svg>
);

/** Animated probe dipping indicator */
const ProbeTip = ({ color }) => (
  <div
    className="flex flex-col items-center gap-0.5 animate-bounce"
    style={{ animationDuration: "2s" }}
  >
    <div className="w-1.5 h-10 rounded-full" style={{ background: color }} />
    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, background: "white" }} />
  </div>
);

/** pH stability sparkline — stretches to fill container width */
const PhSparkline = ({ readings, stable }) => {
  if (!readings || readings.length < 2) return null;
  const H = 44, PAD = 5;
  // Use a viewBox-based SVG so it scales to 100% width automatically
  const VW = 300; // arbitrary viewBox width
  const minV = Math.min(...readings) - 0.03;
  const maxV = Math.max(...readings) + 0.03;
  const range = maxV - minV || 0.1;
  const pts = readings
    .map((v, i) => {
      const x = PAD + (i / (readings.length - 1)) * (VW - PAD * 2);
      const y = H - PAD - ((v - minV) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${VW} ${H}`}
      preserveAspectRatio="none"
      className="w-full overflow-visible"
      style={{ height: H }}
    >
      {/* Reference band */}
      <rect x={PAD} y={PAD} width={VW - PAD * 2} height={H - PAD * 2} rx="3" fill="currentColor" opacity="0.04" />
      <polyline
        points={pts}
        fill="none"
        stroke={stable ? "#22c55e" : "#94a3b8"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/** Circular sampling progress ring */
const SamplingRing = ({ progress, color, voltage }) => {
  const r = 52, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;
  const secsLeft = Math.round(((100 - progress) / 100) * 15);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-muted/20" />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {secsLeft}s
        </span>
        {voltage !== null && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {voltage.toFixed(3)} V
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Step header ─────────────────────────────────────────────────────────────
const StepDots = ({ current }) => (
  <div className="flex items-center gap-2">
    {[1, 2].map((n) => (
      <div
        key={n}
        className={`h-2 rounded-full transition-all duration-300 ${
          n === current
            ? "w-6 bg-primary"
            : n < current
            ? "w-2 bg-primary/60"
            : "w-2 bg-muted"
        }`}
      />
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function PhCalibrationModal({
  open,
  onOpenChange,
  deviceId,
  userId,
  phVariableId,
}) {
  const { recived, setSend } = useMqtt();

  // 'intro' | 'starting' | 'waiting_ph4' | 'sampling_ph4' |
  // 'waiting_ph7' | 'sampling_ph7' | 'complete' | 'error'
  const [calibState, setCalibState] = useState("intro");
  const [voltage, setVoltage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stable, setStable] = useState(false);
  const [calibResult, setCalibResult] = useState(null);
  const [autoCloseLeft, setAutoCloseLeft] = useState(5);

  const voltageHistory = useRef([]);
  const autoCloseInterval = useRef(null);

  // ── Reset on open/close ──────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setCalibState("intro");
      setVoltage(null);
      setProgress(0);
      setStable(false);
      setCalibResult(null);
      setAutoCloseLeft(5);
      voltageHistory.current = [];
      clearInterval(autoCloseInterval.current);
    } else {
      clearInterval(autoCloseInterval.current);
    }
  }, [open]);

  // ── Auto-close countdown after complete ─────────────────────────────────
  useEffect(() => {
    if (calibState === "complete") {
      setAutoCloseLeft(5);
      autoCloseInterval.current = setInterval(() => {
        setAutoCloseLeft((prev) => {
          if (prev <= 1) {
            clearInterval(autoCloseInterval.current);
            onOpenChange(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(autoCloseInterval.current);
  }, [calibState]);

  // ── MQTT listener ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !recived) return;

    recived.forEach((item) => {
      // pH variable calibration states
      if (item.dId === deviceId && item.variable === phVariableId) {
        const state = item.calib_state;
        if (!state) return;

        setCalibState(state);

        // Update progress
        if (item.calib_progress !== null && item.calib_progress !== undefined) {
          setProgress(item.calib_progress);
        }

        // Update voltage (non-zero readings)
        const v = parseFloat(item.value);
        if (!isNaN(v) && v > 0) {
          setVoltage(v);

          // Only track history during waiting states for stability
          if (state === "waiting_ph4" || state === "waiting_ph7") {
            voltageHistory.current = [
              ...voltageHistory.current.slice(-(STABILITY_WINDOW - 1)),
              v,
            ];
            if (voltageHistory.current.length >= 4) {
              const max = Math.max(...voltageHistory.current);
              const min = Math.min(...voltageHistory.current);
              setStable(max - min <= STABILITY_THRESHOLD);
            }
          }
        }

        // Reset voltage history when entering a new waiting state
        if (state === "waiting_ph4" || state === "waiting_ph7") {
          if (v === 0 || isNaN(v)) {
            voltageHistory.current = [];
            setStable(false);
            setVoltage(null);
          }
        }
      }

      // Updater event — calibration result
      if (item.dId === deviceId && item.variable === "updater") {
        const val = item.value;
        if (val?.event_type === "ph_calib_complete") {
          setCalibResult({
            v1: val.sensor_value,
            v2: val.setpoint,
            slope: val.output,
          });
          setCalibState("complete");
        } else if (val?.event_type === "ph_calib_error") {
          setCalibState("error");
        }
      }
    });
  }, [recived, open, deviceId, phVariableId]);

  // ── MQTT publish helpers ─────────────────────────────────────────────────
  const publish = useCallback(
    (value) => {
      setSend({
        topic: `${userId}/${deviceId}/updater/actdata`,
        msg: { value },
      });
    },
    [userId, deviceId, setSend]
  );

  const handleStart = () => {
    setCalibState("starting");
    publish("calib_ph");
  };

  const handleConfirm = () => {
    publish("calib_confirm");
  };

  const handleCancel = () => {
    if (calibState !== "intro" && calibState !== "complete" && calibState !== "error") {
      publish("calib_cancel");
    }
    onOpenChange(false);
  };

  const handleRetry = () => {
    setCalibState("intro");
    setVoltage(null);
    setProgress(0);
    setStable(false);
    setCalibResult(null);
    voltageHistory.current = [];
    clearInterval(autoCloseInterval.current);
  };

  // ─── Render helpers ──────────────────────────────────────────────────────

  const isWaiting = calibState === "waiting_ph4" || calibState === "waiting_ph7";
  const isSampling = calibState === "sampling_ph4" || calibState === "sampling_ph7";
  const isStep1 = calibState === "waiting_ph4" || calibState === "sampling_ph4";
  const isStep2 = calibState === "waiting_ph7" || calibState === "sampling_ph7";
  const stepColor = isStep2 ? "#0ea5e9" : "#f59e0b";
  const stepNumber = isStep2 ? 2 : 1;

  // ─── Screen: Intro ───────────────────────────────────────────────────────
  if (calibState === "intro" || calibState === "starting") {
    return (
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Calibración de sonda de pH</DialogTitle>
            <DialogDescription className="sr-only">Proceso de calibración en dos puntos para la sonda de pH</DialogDescription>
          </DialogHeader>

          {/* Icon */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center px-4 pb-2">
            <h2 className="text-xl font-semibold">Calibración de pH</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los dos puntos de referencia para mediciones precisas
            </p>
          </div>

          {/* Steps overview */}
          <div className="mx-4 mb-3 rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Buffer pH 4.01</p>
                <p className="text-xs text-muted-foreground">
                  Sumerge la sonda y espera a que el voltaje se estabilice
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Buffer pH 6.86</p>
                <p className="text-xs text-muted-foreground">
                  Enjuaga con agua destilada, luego repite el proceso
                </p>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="mx-4 mb-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
            <span>
              Necesitarás: <strong>solución buffer pH 4.01</strong>,{" "}
              <strong>solución buffer pH 6.86</strong> y{" "}
              <strong>agua destilada</strong> para enjuagar.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 px-4 pb-4">
            <Button
              onClick={handleStart}
              disabled={calibState === "starting"}
              className="w-full"
            >
              {calibState === "starting" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Iniciando...
                </span>
              ) : (
                "Iniciar calibración"
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Screen: Waiting (pH 4 or pH 7) ─────────────────────────────────────
  if (isWaiting) {
    const isPH4 = calibState === "waiting_ph4";
    const bufferLabel = isPH4 ? "4.01" : "6.86";
    const flaskFill = isPH4 ? "#fcd34d" : "#38bdf8";
    const labelColor = isPH4 ? "#92400e" : "#0c4a6e";
    const accentColor = isPH4 ? "text-amber-600 dark:text-amber-400" : "text-sky-600 dark:text-sky-400";
    const accentBg = isPH4
      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      : "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800";

    return (
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Calibración pH {bufferLabel}</DialogTitle>
            <DialogDescription className="sr-only">Paso {stepNumber} de 2</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center justify-between px-1 pt-2">
            <StepDots current={stepNumber} />
            <span className="text-xs text-muted-foreground">Paso {stepNumber} de 2</span>
          </div>

          {/* Flask + probe visual */}
          <div className="flex justify-center items-end gap-3 py-2">
            <ProbeTip color={stepColor} />
            <FlaskSVG fillColor={flaskFill} label={bufferLabel} labelColor={labelColor} />
          </div>

          {/* Instruction */}
          <div className={`mx-4 rounded-xl border p-3.5 ${accentBg}`}>
            {isPH4 ? (
              <>
                <p className={`text-sm font-semibold ${accentColor}`}>
                  Sumerge la sonda en la solución pH 4.01
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mantén la sonda completamente sumergida y sin moverla.
                  Espera a que el voltaje se estabilice.
                </p>
              </>
            ) : (
              <>
                <p className={`text-sm font-semibold ${accentColor}`}>
                  1. Enjuaga la sonda con agua destilada
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Luego sumerge en la solución pH 6.86 y espera a que el
                  voltaje se estabilice.
                </p>
              </>
            )}
          </div>

          {/* pH stability panel */}
          <div className="mx-4 rounded-xl border bg-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Estabilidad de la sonda
              </span>
              <Badge
                variant="outline"
                className={
                  stable
                    ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "text-muted-foreground"
                }
              >
                {stable ? "✓ Estable" : "Estabilizando..."}
              </Badge>
            </div>

            {/* Sparkline */}
            <PhSparkline readings={voltageHistory.current} stable={stable} />

            <p className="text-[10px] text-muted-foreground mt-1">
              Confirma cuando la señal deje de variar
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-4 pb-4 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              {stable ? "✓ Confirmar" : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Screen: Sampling ────────────────────────────────────────────────────
  if (isSampling) {
    const isPH4 = calibState === "sampling_ph4";
    const color = isPH4 ? "#f59e0b" : "#0ea5e9";
    const label = isPH4 ? "pH 4.01" : "pH 6.86";

    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[440px]" hideClose>
          <DialogHeader>
            <DialogTitle className="sr-only">Midiendo {label}</DialogTitle>
            <DialogDescription className="sr-only">Muestreo en progreso</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center justify-between px-1 pt-2">
            <StepDots current={stepNumber} />
            <span className="text-xs text-muted-foreground">Paso {stepNumber} de 2</span>
          </div>

          {/* Label */}
          <div className="text-center mt-1">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: color + "22", color }}
            >
              Midiendo {label}
            </span>
          </div>

          {/* Progress ring */}
          <div className="flex justify-center py-2">
            <SamplingRing progress={progress} color={color} voltage={voltage} />
          </div>

          {/* Warning */}
          <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              No mover la sonda durante la medición
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Screen: Complete ────────────────────────────────────────────────────
  if (calibState === "complete") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Calibración completada</DialogTitle>
            <DialogDescription className="sr-only">La sonda de pH ha sido calibrada exitosamente</DialogDescription>
          </DialogHeader>

          {/* Success icon */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="text-center px-4">
            <h2 className="text-xl font-semibold">¡Calibración completada!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Los datos han sido guardados en la memoria del dispositivo
            </p>
          </div>

          {/* Results */}
          {calibResult && (
            <div className="mx-4 mt-2 rounded-xl border bg-muted/30 overflow-hidden">
              <div className="grid grid-cols-3 divide-x">
                <div className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Punto pH 4
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {calibResult.v1?.toFixed(3)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">V</span>
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Punto pH 7
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {calibResult.v2?.toFixed(3)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">V</span>
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Pendiente
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {calibResult.slope?.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">pH/V</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-close notice */}
          <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
            <p className="text-xs text-center text-muted-foreground">
              Cerrando automáticamente en{" "}
              <span className="font-semibold">{autoCloseLeft}s</span>...
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Screen: Error ───────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Error en la calibración</DialogTitle>
          <DialogDescription className="sr-only">La calibración no pudo completarse</DialogDescription>
        </DialogHeader>

        {/* Error icon */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="text-center px-4">
          <h2 className="text-xl font-semibold">Error en la calibración</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Los voltajes medidos son demasiado similares entre sí
          </p>
        </div>

        {/* Possible causes */}
        <div className="mx-4 mt-2 rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            Posibles causas
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              Conexiones flojas o corroídas de la sonda
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              Soluciones buffer contaminadas o vencidas
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              Módulo PH-4502C defectuoso o mal conectado
            </li>
          </ul>
        </div>

        <div className="flex gap-2 px-4 pb-4 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button className="flex-1" onClick={handleRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

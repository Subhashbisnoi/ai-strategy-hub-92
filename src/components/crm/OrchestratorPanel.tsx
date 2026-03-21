import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Workflow, Play, CheckCircle2, XCircle, Clock, Loader2,
  BarChart3, Package, ShieldCheck, CreditCard, Truck,
  Database, TrendingDown, Atom, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface OrchestratorPanelProps {
  sessionId: string;
}

function fmtK(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

interface StepDef {
  key: string;
  label: string;
  icon: any;
  color: string;
}

const PIPELINE_STEPS: StepDef[] = [
  { key: "forecast", label: "Forecast", icon: BarChart3, color: "indigo" },
  { key: "qubo_optimize", label: "QUBO Solve", icon: Atom, color: "violet" },
  { key: "create_pos", label: "Create POs", icon: Package, color: "blue" },
  { key: "risk_assessment", label: "Risk Assess", icon: ShieldCheck, color: "amber" },
  { key: "payments", label: "Pay", icon: CreditCard, color: "emerald" },
  { key: "dispatch", label: "Dispatch", icon: Truck, color: "indigo" },
  { key: "update_inventory", label: "Update Stock", icon: Database, color: "teal" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", light: "bg-violet-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200", light: "bg-amber-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50" },
  teal: { bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-200", light: "bg-teal-50" },
};

export default function OrchestratorPanel({ sessionId }: OrchestratorPanelProps) {
  const [pipeline, setPipeline] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // Variable delays per step for realistic feel (ms)
  const STEP_DELAYS: Record<string, number> = {
    forecast: 1200,
    qubo_optimize: 2400,
    create_pos: 900,
    risk_assessment: 1100,
    payments: 1800,
    dispatch: 700,
    update_inventory: 600,
  };

  const [stepProgress, setStepProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("");

  const STEP_MESSAGES: Record<string, string> = {
    forecast: "Analysing 18 months of transaction history...",
    qubo_optimize: "Running simulated annealing (80 reads, T₀=1000)...",
    create_pos: "Grouping reorder items by supplier...",
    risk_assessment: "Evaluating risk levels & approval thresholds...",
    payments: "Initiating A2P payment protocol via Paytm...",
    dispatch: "Triggering dispatch & tracking generation...",
    update_inventory: "Reconciling stock levels in real-time...",
  };

  const runPipeline = useCallback(async () => {
    setRunning(true);
    setPipeline(null);
    setSelectedStep(null);
    setActiveStep(0);
    setStepProgress(0);

    // Animate steps with variable delays
    const animateSteps = async () => {
      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        setActiveStep(i);
        setStepMessage(STEP_MESSAGES[PIPELINE_STEPS[i].key] || "");
        const delay = STEP_DELAYS[PIPELINE_STEPS[i].key] || 1000;
        // Animate progress bar within each step
        const ticks = 10;
        for (let t = 0; t <= ticks; t++) {
          setStepProgress(Math.round((t / ticks) * 100));
          await new Promise((r) => setTimeout(r, delay / ticks));
        }
      }
    };

    const animPromise = animateSteps();

    try {
      const res = await fetch(`${API}/orchestrator/run?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      await animPromise; // Wait for animation to finish
      setPipeline(data);
      setActiveStep(PIPELINE_STEPS.length);
      setStepMessage("");
    } catch (e) {
      console.error(e);
      await animPromise;
    } finally {
      setRunning(false);
      setStepProgress(0);
    }
  }, [sessionId]);

  // Fetch last pipeline status on mount
  useEffect(() => {
    fetch(`${API}/orchestrator/status?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "no_runs") {
          // Build a minimal pipeline from status
          setPipeline({ status: data.status, summary: data.details, steps: {} });
          setActiveStep(PIPELINE_STEPS.length);
        }
      })
      .catch(() => {});
  }, [sessionId]);

  const steps = pipeline?.steps || {};
  const summary = pipeline?.summary || {};

  const getStepStatus = (key: string, idx: number): "pending" | "running" | "completed" | "failed" => {
    if (pipeline && steps[key]) {
      return steps[key].status === "completed" ? "completed" : "failed";
    }
    if (running) {
      if (idx < activeStep) return "completed";
      if (idx === activeStep) return "running";
    }
    if (pipeline && !steps[key] && idx < activeStep) return "completed";
    return "pending";
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Agentic Orchestrator
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                PIPELINE
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              End-to-end autonomous: Forecast → Optimize → Approve → Pay → Dispatch
            </p>
          </div>
        </div>
        <Button
          onClick={runPipeline}
          disabled={running}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-6"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Pipeline...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Full Pipeline
            </>
          )}
        </Button>
      </div>

      {/* ── Pipeline Stepper ── */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const status = getStepStatus(step.key, idx);
            const colors = colorMap[step.color];
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => setSelectedStep(step.key)}
                  className={`flex flex-col items-center gap-1.5 px-2 cursor-pointer group ${
                    selectedStep === step.key ? "scale-110" : ""
                  } transition-transform`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      status === "completed"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : status === "running"
                        ? `${colors.bg} text-white shadow-lg animate-pulse`
                        : status === "failed"
                        ? "bg-red-500 text-white shadow-lg shadow-red-200"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : status === "running" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : status === "failed" ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${
                      status === "completed"
                        ? "text-emerald-600"
                        : status === "running"
                        ? colors.text
                        : status === "failed"
                        ? "text-red-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-0.5 mx-1 mt-[-12px] transition-colors duration-500 ${
                      status === "completed" ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Step Info Bar ── */}
      {running && (
        <motion.div
          className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
            <span className="text-sm font-semibold text-foreground">
              Step {activeStep + 1}/{PIPELINE_STEPS.length}: {PIPELINE_STEPS[activeStep]?.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{stepMessage}</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${stepProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Summary Cards ── */}
      {pipeline && pipeline.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Items Analysed",
              value: summary.items_analysed || 0,
              icon: BarChart3,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Reorder Items",
              value: summary.reorder_count || 0,
              icon: Zap,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Order Value",
              value: fmtK(summary.total_order_value || 0),
              icon: CreditCard,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Savings vs EOQ",
              value: fmtK(summary.savings_vs_eoq || 0),
              icon: TrendingDown,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline Metrics Strip ── */}
      {pipeline && pipeline.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "POs Created", value: summary.pos_created || 0 },
            { label: "Auto-Approved", value: summary.auto_approved || 0 },
            { label: "Pending Approval", value: summary.pending_approval || 0 },
            { label: "Payments Done", value: summary.payments_completed || 0 },
            { label: "Stock Updated", value: summary.stock_updates || 0 },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-gradient-to-br from-gray-50 to-white border border-border rounded-xl p-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Step Detail Panel ── */}
      {selectedStep && steps[selectedStep] && (
        <motion.div
          className="bg-white border border-border rounded-2xl p-5 shadow-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
            Step: {PIPELINE_STEPS.find((s) => s.key === selectedStep)?.label}
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                steps[selectedStep].status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {steps[selectedStep].status?.toUpperCase()}
            </span>
          </h3>
          <pre className="bg-gray-50 border border-border rounded-lg p-3 text-[10px] font-mono overflow-x-auto max-h-48 overflow-y-auto">
            {JSON.stringify(steps[selectedStep].result, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* ── Empty State ── */}
      {!pipeline && !running && (
        <div className="bg-white border border-border rounded-2xl p-10 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Workflow className="h-7 w-7 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Autonomous Pipeline Ready
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Click "Run Full Pipeline" to execute the full agentic flow end-to-end.
          </p>
        </div>
      )}


    </motion.div>
  );
}

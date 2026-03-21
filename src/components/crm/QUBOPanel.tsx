import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
  Atom, Zap, TrendingDown, CheckCircle2, XCircle,
  AlertTriangle, DollarSign, Loader2, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface QUBOPanelProps {
  sessionId: string;
}

function fmtK(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export default function QUBOPanel({ sessionId }: QUBOPanelProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState("");
  const [capacity, setCapacity] = useState("");

  const runOptimization = useCallback(async () => {
    setLoading(true);
    try {
      const body: any = {};
      if (budget) body.budget = parseFloat(budget);
      if (capacity) body.capacity = parseFloat(capacity);
      const res = await fetch(`${API}/qubo/optimize?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sessionId, budget, capacity]);

  const decisions = result?.decisions || [];
  const reorderItems = decisions.filter((d: any) => d.reorder);
  const skipItems = decisions.filter((d: any) => !d.reorder);

  // Chart: QUBO vs EOQ comparison using main result data
  const comparisonChart = result
    ? [
        { name: "EOQ (Traditional)", cost: result.eoq_baseline_cost || 0, fill: "#f43f5e" },
        { name: "QUBO (Quantum)", cost: result.total_reorder_cost || 0, fill: "#6366f1" },
      ]
    : [];

  // Heatmap data (simplified matrix visualization)
  const matrixData = result?.qubo_matrix || [];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl">
              <Atom className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Quantum Inventory Optimizer
                <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 rounded-full">
                  QUBO
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Quadratic Unconstrained Binary Optimization via Simulated Annealing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Optimization Parameters</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Budget Limit (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Warehouse Capacity (units)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
          <Button
            onClick={runOptimization}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 px-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Solving QUBO...
              </>
            ) : (
              <>
                <Atom className="h-4 w-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Items Analysed",
                value: result.qubo_matrix_size,
                icon: BarChart3,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Reorder Decisions",
                value: result.reorder_count,
                icon: Zap,
                color: "text-amber-600",
                bg: "bg-amber-50",
                sub: `${result.skip_count} skipped`,
              },
              {
                label: "Estimated Savings",
                value: fmtK(result.savings || 0),
                icon: TrendingDown,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                sub: `${result.savings_pct || 0}% vs EOQ`,
              },
              {
                label: "QUBO Energy",
                value: result.energy?.toFixed(2),
                icon: Atom,
                color: "text-violet-600",
                bg: "bg-violet-50",
                sub: "Lower = better",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white border border-border rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                {kpi.sub && (
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* QUBO vs EOQ Comparison */}
          {result.eoq_baseline_cost > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-1 text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                QUBO vs Traditional EOQ — Cost Comparison
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Quantum-inspired approach saves {fmtK(result.savings || 0)} ({result.savings_pct || 0}%)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tickFormatter={(v) => fmtK(v)} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, "Total Cost"]}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={36}>
                      {comparisonChart.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Decision Table */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-4 text-foreground">
              Optimization Decisions ({decisions.length} items)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Product</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Reorder</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Stock</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Reorder Pt</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Qty</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Cost</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d: any) => (
                    <tr
                      key={d.sku}
                      className={`border-b border-border/50 ${
                        d.reorder
                          ? d.urgency === "critical"
                            ? "bg-red-50/50"
                            : "bg-amber-50/30"
                          : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-muted-foreground">{d.sku}</p>
                      </td>
                      <td className="text-center py-2.5 px-3">
                        {d.reorder ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="text-right py-2.5 px-3 font-mono">{d.current_stock}</td>
                      <td className="text-right py-2.5 px-3 font-mono">{d.reorder_point}</td>
                      <td className="text-right py-2.5 px-3 font-mono font-semibold">
                        {d.reorder ? d.qty : "—"}
                      </td>
                      <td className="text-right py-2.5 px-3 font-mono">
                        {d.reorder ? fmtK(d.cost) : "—"}
                      </td>
                      <td className="text-center py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            d.urgency === "critical"
                              ? "bg-red-100 text-red-700"
                              : d.urgency === "high"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {d.urgency?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUBO Formulation Info */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-100 rounded-lg mt-0.5">
                <Atom className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-violet-900 mb-1">
                  How QUBO Works
                </h4>
                <p className="text-xs text-violet-700 leading-relaxed">
                  Each product reorder decision is modeled as a binary variable x<sub>i</sub> ∈ &#123;0,1&#125;.
                  The QUBO objective minimises: <strong>Σ HoldingCost·x<sub>i</sub> + Σ StockoutRisk·(1−x<sub>i</sub>) +
                  Σ ConstraintPenalty·x<sub>i</sub>·x<sub>j</sub></strong>. Solved via simulated annealing with
                  {" "}{result.qubo_matrix_size}×{result.qubo_matrix_size} Q-matrix across 80 annealing reads.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
          <Atom className="h-12 w-12 text-violet-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Ready to Optimize
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Configure constraints above and click "Run Optimization" to compute the
            optimal inventory reorder strategy using quantum-inspired QUBO solver.
          </p>
        </div>
      )}
    </motion.div>
  );
}

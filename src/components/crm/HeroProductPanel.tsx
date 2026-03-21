import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Crown, TrendingDown, AlertTriangle, ArrowUpRight, ShoppingCart,
  Lightbulb, Zap, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

function fmtK(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
}

interface HeroProductPanelProps {
  sessionId: string;
  onNavigate: (tab: string) => void;
}

export default function HeroProductPanel({ sessionId, onNavigate }: HeroProductPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string>("");

  useEffect(() => {
    fetch(`${API}/analytics/hero?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setAiNarrative(d.narrative || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const handleRefreshNarrative = async () => {
    setGenerating(true);
    try {
      const d = await fetch(`${API}/analytics/hero?session_id=${sessionId}`).then((r) => r.json());
      setData(d);
      setAiNarrative(d.narrative || "");
    } catch {}
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Analysing MVP products…</p>
        </div>
      </div>
    );
  }

  if (!data?.hero) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No product data available. Create invoices to see MVP product analysis.
      </div>
    );
  }

  const { hero, worst, all_products = [], concentration_risk, risk_label, hhi } = data;

  const riskColors: Record<string, string> = {
    low: "text-emerald-600 bg-emerald-50 border-emerald-200",
    moderate: "text-yellow-700 bg-yellow-50 border-yellow-200",
    high: "text-orange-700 bg-orange-50 border-orange-200",
    critical: "text-red-700 bg-red-50 border-red-200",
  };

  // Prepare chart data
  const chartData = all_products.slice(0, 8).map((p: any) => ({
    name: p.name.split(" ").slice(0, 3).join(" "),
    revenue: p.revenue,
    margin: p.margin,
  }));

  const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff", "#faf5ff"];

  return (
    <div className="space-y-6">
      {/* Hero + Worst Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hero Product */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 via-yellow-50 to-white border border-yellow-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-yellow-600 mb-0.5">MVP Product #1</p>
              <h3 className="text-lg font-bold text-foreground leading-tight">{hero.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{hero.sku}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Revenue", value: `₹${fmtK(hero.revenue)}`, color: "text-yellow-700" },
              { label: "Rev. Share", value: `${hero.revenue_share}%`, color: "text-indigo-600" },
              { label: "Margin", value: `${hero.margin}%`, color: hero.margin > 30 ? "text-emerald-600" : "text-orange-600" },
            ].map((m) => (
              <div key={m.label} className="bg-white/70 rounded-xl p-2.5 text-center">
                <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-xl text-xs h-8 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => onNavigate("forecasting")}
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Price Forecast
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-8 border-yellow-200"
              onClick={() => onNavigate("invoices")}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Create Bundle Invoice
            </Button>
          </div>
        </motion.div>

        {/* Worst Performer */}
        {worst && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-red-600 mb-0.5">Needs Attention</p>
                <h3 className="text-lg font-bold text-foreground leading-tight">{worst.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{worst.sku}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Revenue", value: `₹${fmtK(worst.revenue)}`, color: "text-red-600" },
                { label: "Rev. Share", value: `${worst.revenue_share}%`, color: "text-muted-foreground" },
                { label: "Margin", value: `${worst.margin}%`, color: worst.margin < 15 ? "text-red-600" : "text-orange-600" },
              ].map((m) => (
                <div key={m.label} className="bg-white/70 rounded-xl p-2.5 text-center">
                  <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-xl text-xs h-8 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => onNavigate("invoices")}
              >
                <Zap className="h-3.5 w-3.5 mr-1" /> Run Promotion
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs h-8 border-red-200"
                onClick={() => onNavigate("inventory")}
              >
                <Package className="h-3.5 w-3.5 mr-1" /> Review Stock
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Narrative */}
      {aiNarrative && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-700 mb-1">GPT-4o mini Analysis</p>
              <p className="text-sm text-foreground leading-relaxed">{aiNarrative}</p>
              <button
                onClick={handleRefreshNarrative}
                disabled={generating}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                {generating ? (
                  <span className="animate-pulse">Regenerating…</span>
                ) : (
                  <>
                    <Zap className="h-3 w-3" /> Regenerate insight
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Revenue Concentration Risk */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${riskColors[concentration_risk] || riskColors["low"]}`}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold text-sm">Revenue Concentration: </span>
          <span className="text-sm capitalize">{concentration_risk} risk — {risk_label}</span>
          <span className="ml-2 text-xs opacity-70">(HHI: {hhi})</span>
        </div>
      </motion.div>

      {/* All Products Revenue Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-border p-5"
        >
          <h4 className="font-semibold text-sm mb-4">Revenue by Product</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `₹${fmtK(v)}`} width={52} />
              <Tooltip formatter={(v: number) => [`₹${fmtK(v)}`, "Revenue"]} />
              <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

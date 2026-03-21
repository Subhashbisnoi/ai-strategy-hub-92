import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, IndianRupee, Users, AlertTriangle, CheckCircle2,
  Zap, ArrowRight, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface DashboardProps {
  sessionId: string;
  onNavigate: (tab: string) => void;
}

const AREA_COLORS = { revenue: "#6366f1", expenses: "#f43f5e", profit: "#10b981" };
const PIE_COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6"];

function fmtK(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-mono font-semibold">₹{fmtK(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function CRMDashboard({ sessionId, onNavigate }: DashboardProps) {
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [invoiceDash, setInvoiceDash] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = (path: string) =>
      fetch(`${API}${path}?session_id=${sessionId}`).then((r) => r.json());
    Promise.all([
      p("/analytics/summary"),
      p("/analytics/monthly"),
      p("/analytics/products"),
      p("/analytics/health-score"),
      p("/invoices/dashboard"),
      p("/inventory/alerts"),
    ]).then(([s, m, pr, h, id, al]) => {
      setSummary(s);
      setMonthly(m.slice(-12));              // last 12 months
      setProducts(pr.slice(0, 6));           // top 6
      setHealthScore(h);
      setInvoiceDash(id);
      setAlerts(al);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading live CRM data…</p>
        </div>
      </div>
    );
  }

  // Prepare radar data from health score
  const radarData = healthScore
    ? Object.values(healthScore.axes).map((ax: any) => ({
        subject: ax.label.split(" ")[0],
        score: ax.score,
        fullMark: 100,
      }))
    : [];

  // Status breakdown for pie
  const statusData = invoiceDash?.status_counts
    ? Object.entries(invoiceDash.status_counts).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        value: v as number,
      }))
    : [];

  const overdueCount = invoiceDash?.status_counts?.overdue || 0;

  return (
    <div className="space-y-6">
      {/* Actionable Alerts Strip */}
      {(overdueCount > 0 || alerts.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {overdueCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
            >
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="font-medium">{overdueCount} invoice{overdueCount > 1 ? "s" : ""} overdue</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-red-700 hover:bg-red-100 px-2"
                onClick={() => onNavigate("invoices")}
              >
                <Bell className="h-3 w-3 mr-1" /> Send Reminders
              </Button>
            </motion.div>
          )}
          {alerts.map((a: any) => (
            <motion.div
              key={a.sku}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm ${
                a.status === "critical"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{a.name}</span>
              <span className="text-xs opacity-70">{a.stock} units left</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2"
                onClick={() => onNavigate("inventory")}
              >
                <Zap className="h-3 w-3 mr-1" /> Reorder
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Revenue",
              value: `₹${fmtK(summary.total_revenue)}`,
              sub: `${summary.transaction_count} transactions`,
              color: "text-indigo-600",
              bg: "from-indigo-50 to-white",
              icon: IndianRupee,
              trend: "up",
            },
            {
              label: "Net Profit",
              value: `₹${fmtK(summary.net_profit)}`,
              sub: `${summary.profit_margin}% margin`,
              color: summary.net_profit > 0 ? "text-emerald-600" : "text-red-600",
              bg: "from-emerald-50 to-white",
              icon: summary.net_profit > 0 ? TrendingUp : TrendingDown,
              trend: summary.net_profit > 0 ? "up" : "down",
            },
            {
              label: "Total Invoiced",
              value: invoiceDash ? `₹${fmtK(invoiceDash.total_invoiced)}` : "—",
              sub: invoiceDash ? `${invoiceDash.collection_rate}% collected` : "",
              color: "text-purple-600",
              bg: "from-purple-50 to-white",
              icon: Users,
              trend: "up",
            },
            {
              label: "Overdue",
              value: invoiceDash ? `₹${fmtK(invoiceDash.total_overdue)}` : "—",
              sub: `${overdueCount} invoices at risk`,
              color: overdueCount > 0 ? "text-red-600" : "text-emerald-600",
              bg: overdueCount > 0 ? "from-red-50 to-white" : "from-emerald-50 to-white",
              icon: overdueCount > 0 ? AlertTriangle : CheckCircle2,
              trend: overdueCount > 0 ? "down" : "up",
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${kpi.bg} rounded-2xl border border-border p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.bg.replace("to-white", "to-transparent")}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revenue vs Expenses — AreaChart */}
      {monthly.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-sm">Revenue vs Expenses</h4>
              <p className="text-xs text-muted-foreground">Last 12 months — live CRM data</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => onNavigate("forecasting")}
            >
              View Forecast <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${fmtK(v)}`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#gradRev)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fill="url(#gradExp)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bottom row: Product Bar + Health Radar + Status Pie */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Top Products — custom styled list */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 bg-white rounded-2xl border border-border p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm">Top Products</h4>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {products.slice(0, 6).map((p: any, i: number) => {
                const maxRev = products[0]?.revenue || 1;
                const pct = Math.round((p.revenue / maxRev) * 100);
                const BAR_GRADIENTS = [
                  "from-indigo-500 to-indigo-400",
                  "from-rose-500 to-rose-400",
                  "from-emerald-500 to-emerald-400",
                  "from-amber-500 to-amber-400",
                  "from-violet-500 to-violet-400",
                  "from-cyan-500 to-cyan-400",
                ];
                return (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[55%]" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">₹{fmtK(p.revenue)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADIENTS[i % BAR_GRADIENTS.length]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Business Health RadarChart */}
        {radarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Business Health Score</h4>
              <span className={`text-lg font-bold ${
                healthScore.overall >= 70 ? "text-emerald-600" :
                healthScore.overall >= 45 ? "text-yellow-600" : "text-red-600"
              }`}>
                {healthScore.overall}/100
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Invoice Status Pie */}
        {statusData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Invoice Status</h4>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onNavigate("invoices")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData.filter((s: any) => s.value > 0)} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value" paddingAngle={2}>
                  {statusData.filter((s: any) => s.value > 0).map((s: any) => (
                    <Cell key={s.name} fill={PIE_COLORS[statusData.findIndex((d: any) => d.name === s.name) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusData.map((s: any, i: number) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

function fmtINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

interface PriceForecastPanelProps {
  sessionId: string;
}

export default function PriceForecastPanel({ sessionId }: PriceForecastPanelProps) {
  const [allSkus, setAllSkus] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [forecast, setForecast] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Load all SKUs
  useEffect(() => {
    fetch(`${API}/inventory?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((items) => {
        setAllSkus(items);
        if (items.length > 0) setSelected(items[0].sku);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  // Load forecast for selected SKU
  useEffect(() => {
    if (!selected) return;
    setLoadingForecast(true);
    fetch(`${API}/forecast/price?session_id=${sessionId}&sku=${selected}&periods=6`)
      .then((r) => r.json())
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : data;
        setForecast(item || null);
        setLoadingForecast(false);
      })
      .catch(() => setLoadingForecast(false));
  }, [selected, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Merge historical + forecast for chart
  const chartData = forecast
    ? [
        ...forecast.historical.map((h: any, idx: number) => {
          const isLast = idx === forecast.historical.length - 1;
          return {
            month: h.month.slice(5),
            historical: h.price,
            forecast: isLast ? h.price : undefined,
            lower: isLast ? h.price : undefined,
            upper: isLast ? h.price : undefined,
            isForecast: false,
          };
        }),
        ...forecast.forecast.map((f: any) => ({
          month: f.month.slice(5),
          forecast: f.price,
          lower: f.lower,
          upper: f.upper,
          isForecast: true,
        })),
      ]
    : [];

  const trendPct = forecast?.price_trend_pct ?? 0;
  const TrendIcon = trendPct > 1 ? TrendingUp : trendPct < -1 ? TrendingDown : Minus;
  const trendColor = trendPct > 1 ? "text-emerald-600" : trendPct < -1 ? "text-red-600" : "text-muted-foreground";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs min-w-[200px]">
        <p className="font-semibold mb-2 pb-1 border-b text-slate-800 tracking-tight">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any) => {
            if (p.value === undefined || p.value === null) return null;
            return (
              <div key={p.name} className="flex justify-between items-center gap-4">
                <span style={{ color: p.color }} className="font-medium">{p.name}</span>
                <span className="font-semibold">{fmtINR(p.value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // separator index between historical and forecast
  const sepIdx = forecast?.historical?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Product Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Price Forecast Model</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Holt-Winters time series prediction</p>
        </div>
        <div className="relative w-full sm:w-80">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white shadow-sm font-medium"
          >
            {allSkus.map((item) => (
              <option key={item.sku} value={item.sku}>
                {item.name} — {item.sku}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
          </div>
        </div>
      </div>

      {loadingForecast ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <div className="w-7 h-7 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Running Holt-Winters price model…</p>
          </div>
        </div>
      ) : forecast ? (
        <>
          {/* Current Price + Trend Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Current Price", value: fmtINR(forecast.current_price), sub: forecast.name },
              { label: "Unit Cost", value: fmtINR(forecast.unit_cost), sub: "Cost of goods" },
              { label: "Gross Margin", value: `${forecast.current_margin}%`, sub: "Current margin" },
              {
                label: "6-Month Trend",
                value: `${trendPct > 0 ? "+" : ""}${trendPct}%`,
                sub: "Price forecast direction",
                icon: <TrendIcon className={`h-4 w-4 ${trendColor}`} />,
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <div className="flex items-center gap-1.5">
                  {kpi.icon}
                  <p className={`text-xl font-bold ${kpi.label === "6-Month Trend" ? trendColor : ""}`}>{kpi.value}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Price Forecast Chart */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-sm">{forecast.name} — Price Forecast</h4>
                <p className="text-[11px] text-muted-foreground">Historical (solid) + 6-month forecast with 95% confidence band (shaded)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} width={64} />
                <Tooltip content={<CustomTooltip />} />
                {/* Confidence band */}
                <Area dataKey="upper" fill="#fce7f3" stroke="none" name="Upper band" />
                <Area dataKey="lower" fill="#fce7f3" stroke="none" name="Lower band" />
                {/* Historical line */}
                <Line type="monotone" dataKey="historical" stroke="#6366f1" strokeWidth={2} dot={false} name="Historical" />
                {/* Forecast line */}
                <Line type="monotone" dataKey="forecast" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Forecast" />
                {/* Separator */}
                {sepIdx > 0 && (
                  <ReferenceLine x={chartData[sepIdx - 1]?.month} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: "Today", position: "top", fontSize: 9 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-2 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-indigo-500 inline-block" /> Historical</span>
              <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-pink-500 inline-block border-b-2 border-dashed border-pink-500" style={{height:0}} /> Forecast</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-pink-100 inline-block rounded" /> 95% confidence</span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-pink-700 mb-1">AI Price Recommendation</p>
                <p className="text-sm text-foreground font-medium">{forecast.overall_recommendation}</p>
              </div>
            </div>
          </div>

          {/* Monthly Forecast Details */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-secondary/50 border-b border-border">
              <span className="text-sm font-semibold">6-Month Price Forecast</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Month</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Forecast Price</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Lower Bound</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Upper Bound</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.forecast.map((f: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-2.5 font-medium">{f.month}</td>
                      <td className="px-4 py-2.5 font-semibold text-pink-600">{fmtINR(f.price)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{fmtINR(f.lower)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{fmtINR(f.upper)}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px]">{f.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Select a product above to see price forecast.
        </div>
      )}
    </div>
  );
}

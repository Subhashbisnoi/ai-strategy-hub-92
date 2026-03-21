import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Package, AlertTriangle, CheckCircle2, ShoppingCart, Zap, ArrowRight, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface InventoryOptPanelProps {
  sessionId: string;
  onNavigate?: (tab: string) => void;
}

function fmtK(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
}

export default function InventoryOptPanel({ sessionId, onNavigate }: InventoryOptPanelProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draftingPO, setDraftingPO] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetch(`${API}/inventory/optimise?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const critical = items.filter((i) => i.action === "BUY_NOW");
  const watch = items.filter((i) => i.action === "BUY_SOON");
  const overstock = items.filter((i) => i.action === "OVERSTOCK");
  const healthy = items.filter((i) => i.action === "HEALTHY");

  // Chart data: current vs safety vs optimal
  const chartData = items.slice(0, 8).map((item) => {
    const short = item.name.length > 12 ? item.name.slice(0, 12) + "…" : item.name;
    return {
      name: short,
      fullName: item.name,
      stock: item.current_stock,
      safety_stock: item.safety_stock,
      eoq: item.eoq,
      reorder_point: item.reorder_point,
    };
  });

  const filteredItems = items.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const fullName = payload[0]?.payload?.fullName || label;
    return (
      <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold mb-1.5">{fullName}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-3">
            <span>{p.name}:</span>
            <span className="font-medium">{p.value} units</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Critical Stockouts", value: critical.length, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
          { label: "Reorder Soon", value: watch.length, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: Zap },
          { label: "Overstocked", value: overstock.length, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Package },
          { label: "Healthy Items", value: healthy.length, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} p-4 flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
              <p className={`text-xs font-semibold ${k.color}`}>{k.label}</p>
              <k.icon className={`h-4 w-4 ${k.color} opacity-80`} />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Stock Levels Chart */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="mb-4">
          <h4 className="font-semibold text-sm">Inventory Levels vs Optimal Targets</h4>
          <p className="text-[11px] text-muted-foreground">Current stock relative to Safety Stock and EOQ targets</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Bar dataKey="stock" name="Current Stock" fill="#6366f1" radius={[2, 2, 0, 0]} maxBarSize={40} />
            <Bar dataKey="safety_stock" name="Safety Stock (Min)" fill="#f43f5e" radius={[2, 2, 0, 0]} maxBarSize={40} />
            <Bar dataKey="reorder_point" name="Reorder Point" fill="#f59e0b" radius={[2, 2, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Actionable Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h4 className="font-semibold text-sm">Supply Chain Optimisation Recommendations</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Calculated using Economic Order Quantity (EOQ)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 transition-all bg-white"
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs bg-white">
              Export POs
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-white text-muted-foreground">
                <th className="px-5 py-3 font-semibold text-xs">Product</th>
                <th className="px-5 py-3 font-semibold text-xs whitespace-nowrap">Stock / Target</th>
                <th className="px-5 py-3 font-semibold text-xs">AI Recommendation</th>
                <th className="px-5 py-3 font-semibold text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {paginatedItems.map((item) => (
                <tr key={item.sku} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 align-top">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.sku}</p>
                  </td>
                  <td className="px-5 py-3 align-top whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${
                        item.current_stock <= item.safety_stock ? "text-red-600" :
                        item.current_stock <= item.reorder_point ? "text-yellow-600" :
                        item.action === "OVERSTOCK" ? "text-orange-600" : "text-emerald-600"
                      }`}>{item.current_stock}</span>
                      <span className="text-muted-foreground text-[10px]">/ {item.optimal_stock}</span>
                    </div>
                    <div className="w-20 h-1.5 bg-secondary rounded-full mt-1.5 overflow-hidden flex">
                      <div
                        className={`h-full ${
                          item.current_stock <= item.safety_stock ? "bg-red-500" :
                          item.current_stock <= item.reorder_point ? "bg-yellow-500" :
                          item.action === "OVERSTOCK" ? "bg-orange-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, item.stock_vs_optimal_pct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top min-w-[240px]">
                    <div className={`text-xs font-semibold mb-0.5 ${
                        item.urgency === "critical" ? "text-red-600" :
                        item.urgency === "high" ? "text-yellow-600" :
                        item.action === "OVERSTOCK" ? "text-orange-600" : "text-emerald-600"
                    }`}>
                      {item.action === "BUY_NOW" ? "Immediate Action Required" :
                       item.action === "BUY_SOON" ? "Watch closely" :
                       item.action === "OVERSTOCK" ? "Capital Tied Up" : "Healthy"}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.action_label}</p>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span title="Economic Order Quantity">EOQ: {item.eoq}</span>
                      <span title="Safety Stock">Safety: {item.safety_stock}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top text-right">
                    {item.action === "BUY_NOW" || item.action === "BUY_SOON" ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 text-[10px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                          disabled={draftingPO === item.sku}
                          onClick={async () => {
                            setDraftingPO(item.sku);
                            try {
                              const res = await fetch(`${API}/inventory/draft-po?session_id=${sessionId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  sku: item.sku,
                                  name: item.name,
                                  qty: item.qty_to_order,
                                  unit_cost: item.unit_cost,
                                }),
                              });
                              if (res.ok) {
                                onNavigate?.("a2p");
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setDraftingPO(null);
                            }
                          }}
                        >
                          {draftingPO === item.sku ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creating...</>
                          ) : (
                            <><ShoppingCart className="h-3 w-3 mr-1" /> Draft PO: {item.qty_to_order} units</>
                          )}
                        </Button>
                        <span className="text-[9px] text-muted-foreground font-medium">Est. ₹{fmtK(item.order_value)}</span>
                      </div>
                    ) : item.action === "OVERSTOCK" ? (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-3 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg">
                        <Zap className="h-3 w-3 mr-1" /> Run Flash Sale
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedItems.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground w-full bg-white">
              No recommendations match your search.
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-white">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </p>
            <div className="flex gap-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

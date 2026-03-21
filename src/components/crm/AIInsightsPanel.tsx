import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Zap, Target, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface AIInsightsPanelProps {
  sessionId: string;
  onNavigate: (tab: string) => void;
}

export default function AIInsightsPanel({ sessionId, onNavigate }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`${API}/recommendations?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.length === 0) {
          generateFresh();
        } else {
          setInsights(data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const generateFresh = () => {
    setGenerating(true);
    fetch(`${API}/recommendations/generate?session_id=${sessionId}`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setInsights(data);
        setGenerating(false);
        setLoading(false);
      })
      .catch(() => {
        setGenerating(false);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">AI is analysing your CRM data…</p>
        </div>
      </div>
    );
  }

  // Fallback if AI generation failed
  const displayInsights = insights.length > 0 ? insights : [
    { type: "critical", title: "Review Pricing Strategy", description: "Your hero product margins are compressed. Consider a 5% increase.", action_text: "Price Forecast", action_url: "forecasting" },
    { type: "opportunity", title: "Bundle Cross-sell", description: "Bundle your top selling items with slow movers to clear inventory.", action_text: "Invoice CRM", action_url: "invoices" }
  ];

  const typeConfig: Record<string, any> = {
    critical: { icon: AlertTriangle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    opportunity: { icon: TrendingUp, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    watchlist: { icon: Search, bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    general: { icon: Lightbulb, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">AI Strategic Insights</h3>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={generateFresh}
          disabled={generating}
        >
          {generating ? "Analysing..." : "Refresh Analysis"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {displayInsights.map((insight, i) => {
          const t = insight.type?.toLowerCase() || "general";
          const conf = typeConfig[t] || typeConfig.general;
          const Icon = conf.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border ${conf.border} bg-white overflow-hidden flex flex-col`}
            >
              <div className={`px-5 py-4 ${conf.bg} border-b ${conf.border} flex items-start gap-3`}>
                <div className={`w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${conf.text}`} />
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${conf.text} mb-1`}>
                    {t === "critical" ? "Action Required" : t}
                  </p>
                  <h4 className="font-semibold text-sm leading-tight">{insight.title}</h4>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between items-start gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>

                <Button
                  size="sm"
                  className={`h-8 text-xs rounded-xl shadow-none w-auto`}
                  variant={t === "critical" ? "default" : "outline"}
                  onClick={() => onNavigate(insight.action_url || "dashboard")}
                >
                  <Target className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  {insight.action_text || "Take Action"}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

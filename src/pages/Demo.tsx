import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Target, TrendingUp, PackageSearch, Receipt, Sparkles, Building2, Store, Briefcase, Atom, CreditCard, Workflow, Database, Bot, ArrowLeft } from "lucide-react";
import { API } from "@/api/index";

import CRMDashboard from "../components/crm/CRMDashboard";
import HeroProductPanel from "../components/crm/HeroProductPanel";
import PriceForecastPanel from "../components/crm/PriceForecastPanel";
import InventoryOptPanel from "../components/crm/InventoryOptPanel";
import InvoiceCRM from "../components/crm/InvoiceCRM";
import AIInsightsPanel from "../components/crm/AIInsightsPanel";
import QUBOPanel from "../components/crm/QUBOPanel";
import A2PPaymentPanel from "../components/crm/A2PPaymentPanel";
import OrchestratorPanel from "../components/crm/OrchestratorPanel";

type AppTab = "dashboard" | "hero_product" | "forecasting" | "inventory" | "invoices" | "insights" | "qubo" | "a2p" | "orchestrator";
type ActiveSection = null | "warehouse" | "agents";



export default function DemoPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("invoices");

  // Load session from localstorage
  useEffect(() => {
    const lsSid = localStorage.getItem("finai_session_id");
    const lsType = localStorage.getItem("finai_business_type");

    if (!lsSid || !lsType) {
      navigate("/login");
    } else {
      setSessionId(lsSid);
      setBusinessType(lsType);
    }
  }, [navigate]);

  const handleReset = () => {
    localStorage.removeItem("finai_session_id");
    localStorage.removeItem("finai_business_type");
    localStorage.removeItem("finai_username");
    navigate("/login");
  };

  const handleSectionSelect = (section: ActiveSection) => {
    setActiveSection(section);
    if (section === "warehouse") {
      setActiveTab("invoices");
    } else if (section === "agents") {
      setActiveTab("dashboard");
    }
  };

  if (!sessionId || !businessType) {
    return null;
  }

  const AGENT_TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "hero_product", label: "MVP Product", icon: Target },
    { id: "forecasting", label: "Price Forecast", icon: TrendingUp },
    { id: "inventory", label: "Supply Chain", icon: PackageSearch },
    { id: "qubo", label: "Inventory Optimizer", icon: Atom },
    { id: "a2p", label: "A2P Payments", icon: CreditCard },
    { id: "orchestrator", label: "Orchestrator", icon: Workflow },
    { id: "insights", label: "AI Insights", icon: Sparkles },
  ] as const;

  // Landing screen with 2 buttons
  if (activeSection === null) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        {/* Top Bar */}
        <div className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                FinAI CRM
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-muted-foreground mr-2 font-mono text-xs">Session: {sessionId.slice(0, 8)}...</span>
              <button onClick={handleReset} className="text-rose-600 hover:text-rose-700 transition-colors">
                Reset Demo
              </button>
            </div>
          </div>
        </div>

        {/* Section Selector */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome to FinAI CRM
              </h2>
              <p className="text-slate-500 text-lg">Choose a module to get started</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Data Warehouse Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSectionSelect("warehouse")}
                className="group flex flex-col items-center gap-4 px-10 py-10 bg-white rounded-2xl border-2 border-slate-200 shadow-md hover:border-indigo-400 hover:shadow-xl transition-all w-64"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-200">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">Data Warehouse</h3>
                  <p className="text-sm text-slate-500 mt-1">Invoices & billing data</p>
                </div>
              </motion.button>

              {/* Agents Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSectionSelect("agents")}
                className="group flex flex-col items-center gap-4 px-10 py-10 bg-white rounded-2xl border-2 border-slate-200 shadow-md hover:border-violet-400 hover:shadow-xl transition-all w-64"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-200">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">Agents</h3>
                  <p className="text-sm text-slate-500 mt-1">AI-powered analytics & tools</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top App Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              FinAI CRM
            </h1>
            <div className="h-6 w-px bg-border hidden md:block" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              {activeSection === "warehouse" ? (
                <><Database className="w-3.5 h-3.5" /> Data Warehouse</>
              ) : (
                <><Bot className="w-3.5 h-3.5" /> Agents</>
              )}
            </span>
            <div className="h-6 w-px bg-border hidden md:block" />
            <button
              onClick={() => handleSectionSelect(activeSection === "warehouse" ? "agents" : "warehouse")}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              {activeSection === "warehouse" ? (
                <><Bot className="w-3.5 h-3.5 text-violet-500" /> Agents</>
              ) : (
                <><Database className="w-3.5 h-3.5 text-indigo-500" /> Data Warehouse</>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-muted-foreground mr-2 font-mono text-xs">Session: {sessionId.slice(0, 8)}...</span>
            <button onClick={handleReset} className="text-rose-600 hover:text-rose-700 transition-colors">
              Reset Demo
            </button>
          </div>
        </div>
        
        {/* Tab Navigation - only for Agents section */}
        {activeSection === "agents" && (
          <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {AGENT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeSection === "warehouse" && (
            <motion.div
              key="warehouse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <InvoiceCRM sessionId={sessionId} />
            </motion.div>
          )}
          {activeSection === "agents" && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && <CRMDashboard sessionId={sessionId} onNavigate={(t) => setActiveTab(t as AppTab)} />}
              {activeTab === "hero_product" && <HeroProductPanel sessionId={sessionId} onNavigate={(t) => setActiveTab(t as AppTab)} />}
              {activeTab === "forecasting" && <PriceForecastPanel sessionId={sessionId} />}
              {activeTab === "inventory" && <InventoryOptPanel sessionId={sessionId} onNavigate={(t) => setActiveTab(t as AppTab)} />}
              {activeTab === "insights" && <AIInsightsPanel sessionId={sessionId} onNavigate={(t) => setActiveTab(t as AppTab)} />}
              {activeTab === "qubo" && <QUBOPanel sessionId={sessionId} />}
              {activeTab === "a2p" && <A2PPaymentPanel sessionId={sessionId} />}
              {activeTab === "orchestrator" && <OrchestratorPanel sessionId={sessionId} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
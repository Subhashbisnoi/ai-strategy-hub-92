import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, CreditCard, CheckCircle2, XCircle, Clock,
  AlertTriangle, ExternalLink, FileText, Loader2, Activity,
  DollarSign, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

interface A2PPaymentPanelProps {
  sessionId: string;
}

function fmtK(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function A2PPaymentPanel({ sessionId }: A2PPaymentPanelProps) {
  const [pos, setPos] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [posRes, appRes, payRes, auditRes] = await Promise.all([
        fetch(`${API}/a2p/purchase-orders?session_id=${sessionId}`),
        fetch(`${API}/a2p/approvals?session_id=${sessionId}`),
        fetch(`${API}/a2p/payments?session_id=${sessionId}`),
        fetch(`${API}/a2p/audit?session_id=${sessionId}&limit=20`),
      ]);
      setPos(await posRes.json());
      setApprovals(await appRes.json());
      setPayments(await payRes.json());
      setAudit(await auditRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (approvalId: number) => {
    setActionLoading(approvalId);
    try {
      await fetch(`${API}/a2p/approvals/${approvalId}/approve?session_id=${sessionId}`, {
        method: "PATCH",
      });
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (approvalId: number) => {
    setActionLoading(approvalId);
    try {
      await fetch(`${API}/a2p/approvals/${approvalId}/reject?session_id=${sessionId}`, {
        method: "PATCH",
      });
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  const handleInitiatePayment = async (poId: number) => {
    setActionLoading(poId + 10000);
    try {
      const res = await fetch(`${API}/a2p/payments/${poId}/initiate?session_id=${sessionId}`, {
        method: "POST",
      });
      const pmt = await res.json();
      // Auto-simulate callback for demo
      if (pmt.id) {
        await fetch(`${API}/a2p/payments/${pmt.id}/simulate-callback?session_id=${sessionId}`, {
          method: "POST",
        });
      }
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const completedPayments = payments.filter((p) => p.status === "success");
  const totalPaid = completedPayments.reduce((s, p) => s + p.amount, 0);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_approval: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    payment_initiated: "bg-violet-100 text-violet-700",
    paid: "bg-emerald-100 text-emerald-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const riskColor: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Agent-to-Payment Protocol
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
              A2P
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Autonomous payment execution with human-in-the-loop approval
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Approvals",
            value: pendingApprovals.length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Total POs",
            value: pos.length,
            icon: FileText,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Payments Completed",
            value: completedPayments.length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Total Paid",
            value: fmtK(totalPaid),
            icon: DollarSign,
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

      {/* ── Approval Queue ── */}
      {pendingApprovals.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Approval Queue ({pendingApprovals.length} pending)
          </h3>
          <div className="grid gap-3">
            {pendingApprovals.map((appr) => {
              const po = appr.po;
              return (
                <div
                  key={appr.id}
                  className="border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Package className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {po?.po_number || `PO #${appr.po_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {po?.supplier_name || "Supplier"} · {po?.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">
                      {fmtK(po?.total_amount || 0)}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${riskColor[appr.risk_level] || ""}`}>
                      {appr.risk_level?.toUpperCase()} RISK
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(appr.id)}
                      disabled={actionLoading === appr.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                    >
                      {actionLoading === appr.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(appr.id)}
                      disabled={actionLoading === appr.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Purchase Orders Table ── */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-500" />
          Purchase Orders ({pos.length})
        </h3>
        {pos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No purchase orders yet. Run the inventory Optimizer or Orchestrator to generate POs.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">PO #</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Supplier</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Items</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {po.po_number}
                    </td>
                    <td className="py-2.5 px-3 text-foreground">{po.supplier_name}</td>
                    <td className="text-center py-2.5 px-3">{po.items?.length || 0}</td>
                    <td className="text-right py-2.5 px-3 font-mono font-semibold">
                      {fmtK(po.total_amount)}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColor[po.status] || "bg-gray-100"}`}>
                        {po.status?.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      {po.status === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleInitiatePayment(po.id)}
                          disabled={actionLoading === po.id + 10000}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-2 py-1 h-auto"
                        >
                          {actionLoading === po.id + 10000 ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay via Paytm
                            </>
                          )}
                        </Button>
                      )}
                      {po.status === "paid" && po.paid_at && (
                        <span className="text-emerald-600 text-[10px]">Paid ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment History ── */}
      {payments.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            Payment History
          </h3>
          <div className="space-y-2">
            {payments.slice(0, 10).map((pmt) => (
              <div
                key={pmt.id}
                className="flex items-center justify-between border border-border/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${pmt.status === "success" ? "bg-emerald-50" : "bg-amber-50"}`}>
                    {pmt.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{pmt.reference_id}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {pmt.payment_method} · {pmt.initiated_at ? timeAgo(pmt.initiated_at) : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmtK(pmt.amount)}</p>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    pmt.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {pmt.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Audit Log ── */}
      {audit.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            Audit Trail
          </h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {audit.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30"
              >
                <span className="text-muted-foreground w-20 shrink-0 font-mono">
                  {log.timestamp ? timeAgo(log.timestamp) : ""}
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium shrink-0">
                  {log.agent}
                </span>
                <span className="text-foreground truncate">
                  {log.action?.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {pos.length === 0 && payments.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg mt-0.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 mb-1">
                A2P Protocol Ready
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                The Agent-to-Payment protocol enables AI agents to securely initiate and execute
                financial transactions. Run the <strong>Inventory Optimizer</strong> or{" "}
                <strong>Orchestrator Pipeline</strong> to generate purchase orders, then approve and
                pay via Paytm here.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

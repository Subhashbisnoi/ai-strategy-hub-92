import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, FileImage, Search, Plus, Filter, Download, PenLine, FileUp, MessageSquareText, Trash2, Sparkles, CheckCircle2, X, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "/api";

type CreateMode = "manual" | "pdf" | "english";

interface InvoiceCRMProps {
  sessionId: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  sku: string;
}

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0, sku: "" });

export default function InvoiceCRM({ sessionId }: InvoiceCRMProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("manual");

  // Manual form state
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // PDF upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Plain English state
  const [englishText, setEnglishText] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);

  // Detail view state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const refreshInvoices = () => {
    fetch(`${API}/invoices?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setInvoices(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`${API}/invoices?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  // ── Manual form helpers ──
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const gstAmount = Math.round(subtotal * gstRate / 100 * 100) / 100;
  const total = Math.round((subtotal + gstAmount) * 100) / 100;

  const resetForm = () => {
    setCustomerName("");
    setCustomerGstin("");
    setItems([emptyItem()]);
    setGstRate(18);
    setNotes("");
    setPaymentTerms(30);
    setExtractedData(null);
    setEnglishText("");
  };

  const handleManualSubmit = async () => {
    if (!customerName.trim() || items.every((it) => !it.description.trim())) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/invoices?session_id=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_gstin: customerGstin,
          items: items.filter((it) => it.description.trim()),
          gst_rate: gstRate,
          notes,
          payment_terms_days: paymentTerms,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Invoice ${data.invoice_number} created for ₹${data.total.toLocaleString()}`);
        resetForm();
        refreshInvoices();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── PDF upload handlers ──
  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) await handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileChange = async (e: any) => {
    e.preventDefault();
    if (e.target.files?.[0]) await handleFileUpload(e.target.files[0]);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setExtractedData(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/invoices/extract?session_id=${sessionId}`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedData(data);
        // Pre-fill manual form with extracted data so user can review & submit
        setCustomerName(data.customer_name || "");
        setCustomerGstin(data.customer_gstin || "");
        setItems(
          (data.items || []).map((it: any) => ({
            description: it.description || "",
            quantity: it.quantity || 1,
            unit_price: it.unit_price || 0,
            sku: it.sku || "",
          }))
        );
        setNotes(data.notes || "");
        setPaymentTerms(data.payment_terms_days || 30);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ── Plain English handler ──
  const handleEnglishSubmit = async () => {
    if (!englishText.trim()) return;
    setAiProcessing(true);
    setExtractedData(null);
    try {
      const fd = new FormData();
      fd.append("raw_text", englishText);
      const res = await fetch(`${API}/invoices/extract?session_id=${sessionId}`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedData(data);
        setCustomerName(data.customer_name || "");
        setCustomerGstin(data.customer_gstin || "");
        setItems(
          (data.items || []).map((it: any) => ({
            description: it.description || "",
            quantity: it.quantity || 1,
            unit_price: it.unit_price || 0,
            sku: it.sku || "",
          }))
        );
        setNotes(data.notes || "");
        setPaymentTerms(data.payment_terms_days || 30);
        setCreateMode("manual"); // Switch to manual to review
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const MODE_TABS: { id: CreateMode; label: string; icon: typeof PenLine }[] = [
    { id: "manual", label: "Manual Entry", icon: PenLine },
    { id: "pdf", label: "Upload PDF / Image", icon: FileUp },
    { id: "english", label: "Plain English (AI)", icon: MessageSquareText },
  ];

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Invoice Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Invoices</h2>
        <Button
          onClick={() => { setShowCreate(!showCreate); if (showCreate) { resetForm(); setExtractedData(null); } }}
          className={showCreate ? "bg-slate-600 hover:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"}
          size="sm"
        >
          {showCreate ? "Cancel" : <><Plus className="w-4 h-4 mr-1.5" /> Create Invoice</>}
        </Button>
      </div>

      {/* Create Invoice Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-border shadow-sm">
              {/* Mode Tabs */}
              <div className="flex border-b border-border">
                {MODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCreateMode(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                      createMode === tab.id
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── Mode: Plain English ── */}
                {createMode === "english" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Describe the invoice in plain English
                      </label>
                      <textarea
                        value={englishText}
                        onChange={(e) => setEnglishText(e.target.value)}
                        rows={5}
                        placeholder="e.g. Create an invoice for Rahul Electronics for 5 USB-C cables at ₹250 each and 2 laptop stands at ₹1800 each. GSTIN is 27AABCU9603R1ZM. Payment due in 15 days."
                        className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleEnglishSubmit}
                        disabled={aiProcessing || !englishText.trim()}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {aiProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            AI Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1.5" />
                            Convert to Invoice
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-slate-400">AI will extract details and open the form for review</span>
                    </div>
                  </div>
                )}

                {/* ── Mode: PDF Upload ── */}
                {createMode === "pdf" && (
                  <div className="space-y-4">
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
                        dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-border/60 hover:border-indigo-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                          {uploading ? (
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-7 h-7 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Drop your PDF or image here</p>
                          <p className="text-xs text-muted-foreground mt-1">AI will extract invoice data automatically</p>
                        </div>
                        <Button disabled={uploading} size="sm" variant="outline">
                          {uploading ? "Extracting..." : "Browse Files"}
                        </Button>
                      </div>
                    </div>

                    {extractedData && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>Data extracted! Switch to <button onClick={() => setCreateMode("manual")} className="font-bold underline underline-offset-2">Manual Entry</button> to review and submit.</span>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Mode: Manual Entry ── */}
                {createMode === "manual" && (
                  <div className="space-y-5">
                    {extractedData && (
                      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-4 py-2 text-xs font-medium">
                        <Sparkles className="w-4 h-4" />
                        AI-extracted data loaded — review and edit before submitting
                      </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer Name *</label>
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Rahul Electronics"
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">GSTIN</label>
                        <input
                          value={customerGstin}
                          onChange={(e) => setCustomerGstin(e.target.value)}
                          placeholder="e.g. 27AABCU9603R1ZM"
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">GST %</label>
                          <input
                            type="number"
                            value={gstRate}
                            onChange={(e) => setGstRate(Number(e.target.value))}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Days</label>
                          <input
                            type="number"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(Number(e.target.value))}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-600">Line Items</label>
                        <button onClick={addItem} className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>
                      </div>
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                          <span>Description</span>
                          <span>Qty</span>
                          <span>Unit Price (₹)</span>
                          <span>SKU</span>
                          <span></span>
                        </div>
                        {items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2">
                            <input
                              value={item.description}
                              onChange={(e) => updateItem(idx, "description", e.target.value)}
                              placeholder="Item description"
                              className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                              min={1}
                              className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                              min={0}
                              className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                              value={item.sku}
                              onChange={(e) => updateItem(idx, "sku", e.target.value)}
                              placeholder="SKU"
                              className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => removeItem(idx)}
                              disabled={items.length <= 1}
                              className="rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={2}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    {/* Totals & Submit */}
                    <div className="flex items-end justify-between pt-2 border-t border-border">
                      <div className="text-sm space-y-1">
                        <p className="text-slate-500">Subtotal: <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span></p>
                        <p className="text-slate-500">GST ({gstRate}%): <span className="font-semibold text-slate-800">₹{gstAmount.toLocaleString()}</span></p>
                        <p className="text-base font-bold text-slate-900">Total: ₹{total.toLocaleString()}</p>
                      </div>
                      <Button
                        onClick={handleManualSubmit}
                        disabled={submitting || !customerName.trim() || items.every((it) => !it.description.trim())}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Create Invoice
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold px-2">Recent Invoices</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {invoices.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Invoice # / Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.map((inv) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={inv.id}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{inv.invoice_number}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(inv.date || inv.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="font-medium text-foreground">{inv.customer_name || "Unknown"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {inv.items?.length || 0} items
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top font-semibold text-foreground">
                    ₹{(inv.total || inv.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      (inv.status || "").toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-700" :
                      (inv.status || "").toLowerCase() === "overdue" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {(inv.status || "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedInvoice(inv)}>
                      View Details
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <FileImage className="w-12 h-12 text-border mx-auto mb-3" />
                    <p>No invoices yet. Click "Create Invoice" above to add one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedInvoice.invoice_number}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(selectedInvoice.date || selectedInvoice.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedInvoice(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Customer & Status */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bill To</p>
                  <p className="font-semibold text-foreground">{selectedInvoice.customer_name}</p>
                  {selectedInvoice.customer_gstin && <p className="text-[10px] text-muted-foreground font-mono">{selectedInvoice.customer_gstin}</p>}
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                  (selectedInvoice.status || "").toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-700" :
                  (selectedInvoice.status || "").toLowerCase() === "overdue" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {(selectedInvoice.status || "").toUpperCase()}
                </span>
              </div>

              {/* Line Items */}
              <div className="px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(selectedInvoice.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5">
                          <p className="font-medium text-foreground text-xs">{it.description}</p>
                          {it.sku && <p className="text-[10px] text-muted-foreground font-mono">{it.sku}</p>}
                        </td>
                        <td className="py-2.5 text-right text-xs">{it.quantity}</td>
                        <td className="py-2.5 text-right text-xs">₹{(it.unit_price || 0).toLocaleString()}</td>
                        <td className="py-2.5 text-right text-xs font-medium">₹{((it.quantity || 0) * (it.unit_price || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-6 py-4 space-y-1.5 border-t border-border mt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{(selectedInvoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST ({selectedInvoice.gst_rate || 18}%)</span>
                  <span>₹{(selectedInvoice.gst_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
                  <span>Total</span>
                  <span>₹{(selectedInvoice.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Link & Due Date */}
              <div className="px-6 py-4 bg-secondary/30 rounded-b-2xl flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Due: {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                </div>
                {selectedInvoice.payment_link && (
                  <span className="text-[10px] text-indigo-600 font-mono truncate max-w-[200px]" title={selectedInvoice.payment_link}>
                    {selectedInvoice.payment_link}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

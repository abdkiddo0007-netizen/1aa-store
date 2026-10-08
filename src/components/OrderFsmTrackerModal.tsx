import { useState, useEffect } from "react";
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ShieldAlert, 
  Radio, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";
import { 
  OrderFsmState, 
  OrderLinearState, 
  FsmStateTransitionLog 
} from "../types/orderFsm";
import { 
  LINEAR_FSM_STAGES, 
  FSM_STATE_METADATA, 
  canTransitionFsm, 
  executeFsmTransition 
} from "../utils/orderFSM";
import { 
  handleLogistics3PLWebhook, 
  generateWebhookSignature, 
  getDlqItems, 
  retryDlqItem,
  DeadLetterQueueItem 
} from "../utils/idempotencyAndWebhooks";
import { 
  dispatchTransactionalEmail, 
  dispatchWhatsAppMessage, 
  generateDispatchAlertWhatsApp, 
  generateOutForDeliveryWhatsApp, 
  generateReturnConfirmationEmailHtml,
  generateRefundCreditNoteEmailHtml,
  OWNER_PHONE
} from "../utils/notificationMatrix";
import { haptics } from "../utils/haptics";

interface OrderFsmTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderRef?: string;
  initialState?: OrderFsmState;
}

export default function OrderFsmTrackerModal({
  isOpen,
  onClose,
  orderRef = "1AA-892182",
  initialState = "ORDER_CONFIRMED",
}: OrderFsmTrackerModalProps) {
  const [currentState, setCurrentState] = useState<OrderFsmState>(initialState);
  const [history, setHistory] = useState<FsmStateTransitionLog[]>([
    {
      id: "LOG-INIT-1",
      fromState: "DRAFT",
      toState: "PENDING_PAYMENT",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      reason: "Buyer submitted master carton order checkout",
      actor: "buyer",
    },
    {
      id: "LOG-INIT-2",
      fromState: "PENDING_PAYMENT",
      toState: "PAYMENT_AUTHORIZED",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      reason: "Axis Bank verified IMPS remittance and UTR clearing",
      actor: "gateway",
    },
    {
      id: "LOG-INIT-3",
      fromState: "PAYMENT_AUTHORIZED",
      toState: "ORDER_CONFIRMED",
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      reason: "Commercial GST Tax Invoice generated & inventory locked",
      actor: "system",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"fsm" | "timeline" | "webhook_lab" | "dlq">("fsm");
  const [deliveryOtp, setDeliveryOtp] = useState<string>("7406");
  const [driverName] = useState<string>("Manjunath Swamy");
  const [driverPhone] = useState<string>("9845211982");
  const [awbDocket] = useState<string>(`BD-MYS-${orderRef.replace(/\D/g, "")}`);
  const [dlqList, setDlqList] = useState<DeadLetterQueueItem[]>([]);
  const [webhookFeedback, setWebhookFeedback] = useState<string | null>(null);

  // Sync state if initial changes
  useEffect(() => {
    if (initialState) {
      setCurrentState(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    if (isOpen) {
      setDlqList(getDlqItems());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMeta = FSM_STATE_METADATA[currentState];
  const linearIndex = LINEAR_FSM_STAGES.indexOf(currentState as OrderLinearState);

  /**
   * Transition to next legal state
   */
  const handleTransition = (target: OrderFsmState, reason: string) => {
    haptics.selection();
    const result = executeFsmTransition(history, currentState, target, reason, "admin");
    if (!result.success) {
      alert(result.error);
      return;
    }

    setCurrentState(result.newState);
    setHistory(result.history);

    // Trigger Notification Matrix events based on FSM milestone
    if (target === "SHIPPED") {
      dispatchWhatsAppMessage({
        type: "DISPATCH_AWB",
        recipientPhone: OWNER_PHONE,
        messageText: generateDispatchAlertWhatsApp({
          orderRef,
          customerName: "Valued Merchant",
          awbNumber: awbDocket,
          carrier: "BlueDart Express Cargo",
          eta: "2-3 Business Days",
        }),
        orderRef,
        awb: awbDocket,
      });
    } else if (target === "OUT_FOR_DELIVERY") {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setDeliveryOtp(otp);

      dispatchWhatsAppMessage({
        type: "OUT_FOR_DELIVERY",
        recipientPhone: OWNER_PHONE,
        messageText: generateOutForDeliveryWhatsApp({
          orderRef,
          customerName: "Valued Merchant",
          driverName,
          driverPhone,
          otp,
        }),
        orderRef,
        otp,
      });
    } else if (target === "RETURN_REQUESTED") {
      dispatchTransactionalEmail({
        type: "RETURN_CONFIRMATION",
        recipient: "1aaavailablealways@gmail.com",
        recipientName: "1AA Central Returns",
        subject: `RMA Return Filed for ${orderRef}`,
        htmlContent: generateReturnConfirmationEmailHtml({
          orderRef,
          returnRef: `RMA-${orderRef}`,
          customerName: "Valued Merchant",
          reason: "Carton specification inspection requested",
        }),
        orderRef,
      });
    } else if (target === "REFUNDED") {
      dispatchTransactionalEmail({
        type: "REFUND_CREDIT_NOTE",
        recipient: "1aaavailablealways@gmail.com",
        recipientName: "1AA Accounts Desk",
        subject: `Credit Note CN-${orderRef} Settled`,
        htmlContent: generateRefundCreditNoteEmailHtml({
          orderRef,
          creditNoteRef: `CN-${orderRef}`,
          customerName: "Valued Merchant",
          refundAmount: 18500,
          axisBankUtr: `AXIS-REF-${Date.now().toString().slice(-8)}`,
        }),
        orderRef,
      });
    }

    haptics.success();
  };

  /**
   * Test Webhook Signature & Replay Simulation
   */
  const handleSimulateCarrierWebhook = () => {
    const payload = {
      orderRef,
      awb: awbDocket,
      carrier: "BlueDart Express",
      status: "OUT_FOR_DELIVERY",
      location: "Mysore Kesare Delivery Branch",
    };
    const payloadStr = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadStr);

    const webhookEvent = {
      id: `EVT-${Date.now()}`,
      topic: "carrier.out_for_delivery" as const,
      timestamp: Date.now(),
      nonce: `nonce-${Date.now()}-${Math.random()}`,
      payload,
      signature,
    };

    const response = handleLogistics3PLWebhook(webhookEvent);
    if (response.status === 200) {
      setWebhookFeedback(`✅ 3PL Webhook Verified & Processed: Status 200 OK. Stage updated.`);
      handleTransition("OUT_FOR_DELIVERY", "Verified 3PL Carrier Webhook: OUT_FOR_DELIVERY");
    } else {
      setWebhookFeedback(`❌ Webhook Rejected with status ${response.status}: ${response.body.message}`);
      setDlqList(getDlqItems());
    }
  };

  const handleSimulateTamperedWebhook = () => {
    const payload = {
      orderRef,
      awb: awbDocket,
      carrier: "Rogue Carrier",
      status: "DELIVERED",
      location: "Unknown",
    };
    const webhookEvent = {
      id: `EVT-TAMPER-${Date.now()}`,
      topic: "carrier.delivered" as const,
      timestamp: Date.now(),
      nonce: `nonce-fake-${Date.now()}`,
      payload,
      signature: "sha256=invalid_tampered_signature_99999",
    };

    const response = handleLogistics3PLWebhook(webhookEvent);
    setWebhookFeedback(`🚨 Tampered Webhook intercepted! Status ${response.status}. Automatically diverted to Dead-Letter Queue (DLQ).`);
    setDlqList(getDlqItems());
    haptics.error();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-obsidian-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94dvh] sm:max-h-[92vh] backdrop-blur-3xl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center text-brand-blue-light shadow-glow-blue shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Order Finite State Machine (FSM)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange font-mono text-xs font-bold">
                  #{orderRef}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                12-Stage strict deterministic lifecycle with zero orphan states & automated DLQ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 sm:p-3 bg-obsidian-950/70 border-b border-white/[0.06] flex gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("fsm")}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "fsm"
                ? "bg-brand-blue text-white shadow-glow-blue"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FSM Stage Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "timeline"
                ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Trail ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("webhook_lab")}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "webhook_lab"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Webhook Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dlq")}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "dlq"
                ? "bg-red-600 text-white shadow-md"
                : "bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Dead-Letter Queue ({dlqList.length})</span>
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">

          {/* TAB 1: 12-STAGE LINEAR STATE MACHINE TRACKER */}
          {activeTab === "fsm" && (
            <div className="space-y-6">
              
              {/* CURRENT ACTIVE STATE HERO CARD */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-obsidian-950 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Current Active FSM State</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <span>{currentMeta.label}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${currentMeta.color}`}>
                      {currentState}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    {currentMeta.shortDesc}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/10 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Stage SLA</span>
                    <span className="text-white font-mono font-bold text-sm">
                      {currentMeta.slaHours ? `${currentMeta.slaHours} Hours Max` : "Completed"}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                    Terminal: {currentMeta.isTerminal ? "YES" : "NO"}
                  </div>
                </div>
              </div>

              {/* COMPLETE 12-STAGE LINEAR TIMELINE BAR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    12-Stage Linear Progression:
                  </span>
                  <span className="font-mono text-emerald-400">
                    Step {linearIndex >= 0 ? linearIndex + 1 : 1} of 12
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {LINEAR_FSM_STAGES.map((st, idx) => {
                    const meta = FSM_STATE_METADATA[st];
                    const isDone = linearIndex > idx;
                    const isCurrent = currentState === st;

                    return (
                      <div
                        key={st}
                        className={`p-2.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? "bg-brand-orange/20 border-brand-orange shadow-glow-orange"
                            : isDone
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-obsidian-950/60 border-white/[0.06] text-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] font-bold">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <div className={`font-bold text-xs truncate ${isCurrent ? "text-white" : isDone ? "text-slate-200" : "text-slate-500"}`}>
                          {meta.label}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                          {st}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OUT FOR DELIVERY SPECIAL CARD (OTP & DRIVER DETAILS) */}
              {currentState === "OUT_FOR_DELIVERY" && (
                <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-brand-orange/10 to-transparent border-2 border-brand-orange/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-brand-orange" />
                      <span>Van Delivery Agent Active on Local Route</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      DELIVERY IN PROGRESS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                      <span className="text-slate-400 text-[10px] block">Courier Driver</span>
                      <span className="text-white font-bold text-xs">{driverName}</span>
                      <span className="text-slate-400 text-[10px] block font-mono mt-0.5">Ph: +91 {driverPhone}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                      <span className="text-slate-400 text-[10px] block">Carrier Docket</span>
                      <span className="text-brand-blue-light font-bold text-xs font-mono">{awbDocket}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">BlueDart Express Cargo</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border-2 border-brand-orange/40 text-center">
                      <span className="text-brand-orange text-[10px] block font-bold uppercase tracking-wider">
                        Secure Delivery OTP
                      </span>
                      <span className="text-2xl font-black font-mono text-white tracking-widest">
                        {deliveryOtp}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Share with driver upon arrival</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FSM TRANSITION CONTROLS (DEMONSTRATE VALID STATE MOVES) */}
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Permitted FSM Next Stage Transitions:
                  </span>
                  <span className="text-[10px] text-slate-400">Strictly follows linear graph</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Step forward in linear order if available */}
                  {linearIndex >= 0 && linearIndex < LINEAR_FSM_STAGES.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleTransition(
                        LINEAR_FSM_STAGES[linearIndex + 1],
                        `Advanced along linear sequence to ${LINEAR_FSM_STAGES[linearIndex + 1]}`
                      )}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-orange hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Proceed to {FSM_STATE_METADATA[LINEAR_FSM_STAGES[linearIndex + 1]].label}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Exception paths */}
                  {canTransitionFsm(currentState, "FAILED_DELIVERY_ATTEMPT_1") && (
                    <button
                      type="button"
                      onClick={() => handleTransition("FAILED_DELIVERY_ATTEMPT_1", "Driver reported shop closed")}
                      className="py-2.5 px-3.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 font-bold text-xs cursor-pointer"
                    >
                      Trigger Delivery Attempt #1 Failed
                    </button>
                  )}

                  {canTransitionFsm(currentState, "RETURN_REQUESTED") && (
                    <button
                      type="button"
                      onClick={() => handleTransition("RETURN_REQUESTED", "Buyer requested carton return inspection")}
                      className="py-2.5 px-3.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 font-bold text-xs cursor-pointer"
                    >
                      File Return Request (RMA)
                    </button>
                  )}

                  {canTransitionFsm(currentState, "REFUNDED") && (
                    <button
                      type="button"
                      onClick={() => handleTransition("REFUNDED", "Axis Bank commercial refund remitted")}
                      className="py-2.5 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer"
                    >
                      Issue Full Refund via Axis Bank
                    </button>
                  )}
                </div>
              </div>

              {/* REAL-WORLD 3PL CARRIER QUICK LINKS */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="font-bold text-slate-300">Carrier Verification Portals:</span>
                <a
                  href={`https://www.bluedart.com/tracking?trackNumber=${awbDocket}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-brand-blue-light border border-white/10 flex items-center gap-1.5"
                >
                  <span>BlueDart Express</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://www.delhivery.com/track/package/${awbDocket}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-brand-orange border border-white/10 flex items-center gap-1.5"
                >
                  <span>Delhivery Surface</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          )}

          {/* TAB 2: AUDIT TRAIL TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="font-bold text-white text-xs uppercase tracking-wider pb-1 border-b border-white/[0.08]">
                Finite State Machine Transition Log
              </div>

              <div className="space-y-3">
                {history.map((log, idx) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 text-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-mono text-[10px] text-slate-300 shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span className="text-slate-400">{log.fromState}</span>
                          <span className="text-brand-orange">→</span>
                          <span className="text-emerald-400">{log.toState}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString("en-IN")} IST
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300">{log.reason}</p>

                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-500">
                        <span>Actor: <strong className="text-slate-400 uppercase">{log.actor}</strong></span>
                        <span>•</span>
                        <span>Log ID: {log.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOK SIMULATOR & SECURITY VERIFICATION */}
          {activeTab === "webhook_lab" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <div className="font-bold text-purple-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Webhook Security & Replay Shield</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  All incoming webhooks from Payment Gateways and 3PL Logistics Providers must contain a valid HMAC-SHA256 signature and fall within a 300-second timestamp window. Duplicate nonces are blocked to prevent replay attacks.
                </p>
              </div>

              {webhookFeedback && (
                <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 text-slate-200 font-mono text-xs leading-relaxed animate-in fade-in">
                  {webhookFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSimulateCarrierWebhook}
                  className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-emerald-400 flex items-center justify-between mb-1">
                    <span>Valid Carrier Webhook</span>
                    <Radio className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sends valid HMAC SHA-256 signature with fresh nonce. Triggers OUT_FOR_DELIVERY state.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateTamperedWebhook}
                  className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-red-400 flex items-center justify-between mb-1">
                    <span>Simulate Tampered Webhook</span>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sends fake signature to test signature rejection and DLQ automatic dead-letter diversion.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DEAD-LETTER QUEUE (DLQ) */}
          {activeTab === "dlq" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Dead-Letter Queue (DLQ) for Failed Webhooks</span>
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  {dlqList.length} items logged
                </span>
              </div>

              {dlqList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-xs">DLQ is Clean</p>
                  <p className="text-[11px] text-slate-500 mt-1">Zero unhandled webhook anomalies in queue.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dlqList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-red-300">{item.id}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.receivedAt}</span>
                      </div>
                      <p className="text-white font-medium text-xs">Reason: {item.errorReason}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">Topic: {item.event.topic}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const res = retryDlqItem(item.id);
                            alert(res.message);
                            setDlqList(getDlqItems());
                          }}
                          className="py-1 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry Event</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

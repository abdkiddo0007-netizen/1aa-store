import { OrderFsmState, OrderLinearState, FsmStateTransitionLog, FsmActor, FsmStateMetadata } from "../types/orderFsm";

/**
 * Strict Linear Order State Machine Sequence
 * DRAFT -> PENDING_PAYMENT -> PAYMENT_AUTHORIZED -> ORDER_CONFIRMED -> 
 * ALLOCATED_TO_FC -> PICKING -> PACKED -> MANIFESTED -> SHIPPED -> 
 * OUT_FOR_DELIVERY -> DELIVERED -> CLOSED
 */
export const LINEAR_FSM_STAGES: OrderLinearState[] = [
  "DRAFT",
  "PENDING_PAYMENT",
  "PAYMENT_AUTHORIZED",
  "ORDER_CONFIRMED",
  "ALLOCATED_TO_FC",
  "PICKING",
  "PACKED",
  "MANIFESTED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CLOSED",
];

/**
 * Permitted transitions graph for the strict Finite State Machine
 */
export const PERMITTED_FSM_TRANSITIONS: Record<OrderFsmState, OrderFsmState[]> = {
  // Linear sequence
  DRAFT: ["PENDING_PAYMENT", "EXPIRED_CART_HOLD", "CANCELLED_BY_BUYER"],
  PENDING_PAYMENT: ["PAYMENT_AUTHORIZED", "PAYMENT_FAILED", "EXPIRED_CART_HOLD", "CANCELLED_BY_BUYER"],
  PAYMENT_AUTHORIZED: ["ORDER_CONFIRMED", "PAYMENT_FAILED", "CANCELLED_OUT_OF_STOCK", "REFUNDED"],
  ORDER_CONFIRMED: ["ALLOCATED_TO_FC", "CANCELLED_BY_BUYER", "CANCELLED_OUT_OF_STOCK", "REFUNDED"],
  ALLOCATED_TO_FC: ["PICKING", "CANCELLED_OUT_OF_STOCK", "QC_REJECTED"],
  PICKING: ["PACKED", "QC_REJECTED", "CANCELLED_OUT_OF_STOCK"],
  PACKED: ["MANIFESTED", "QC_REJECTED"],
  MANIFESTED: ["SHIPPED", "RETURN_REQUESTED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "FAILED_DELIVERY_ATTEMPT_1", "RETURN_REQUESTED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY_ATTEMPT_1", "FAILED_DELIVERY_ATTEMPT_2", "FAILED_DELIVERY_ATTEMPT_3"],
  DELIVERED: ["CLOSED", "RETURN_REQUESTED"],
  CLOSED: ["RETURN_REQUESTED"],

  // Exception states
  PAYMENT_FAILED: ["PENDING_PAYMENT", "EXPIRED_CART_HOLD", "CANCELLED_BY_BUYER"],
  EXPIRED_CART_HOLD: ["DRAFT"],
  CANCELLED_BY_BUYER: ["REFUNDED", "CLOSED"],
  CANCELLED_OUT_OF_STOCK: ["REFUNDED", "CLOSED"],
  FAILED_DELIVERY_ATTEMPT_1: ["OUT_FOR_DELIVERY", "FAILED_DELIVERY_ATTEMPT_2", "RETURN_REQUESTED"],
  FAILED_DELIVERY_ATTEMPT_2: ["OUT_FOR_DELIVERY", "FAILED_DELIVERY_ATTEMPT_3", "RETURN_REQUESTED"],
  FAILED_DELIVERY_ATTEMPT_3: ["RETURN_REQUESTED", "RETURN_PICKED_UP"],
  RETURN_REQUESTED: ["RETURN_PICKED_UP", "CANCELLED_BY_BUYER"],
  RETURN_PICKED_UP: ["QC_REJECTED", "REFUNDED"],
  QC_REJECTED: ["REFUNDED", "ALLOCATED_TO_FC"],
  REFUNDED: ["CLOSED"],
};

/**
 * Human-readable metadata and visual cues for every FSM state
 */
export const FSM_STATE_METADATA: Record<OrderFsmState, FsmStateMetadata> = {
  DRAFT: {
    label: "Draft Cart",
    shortDesc: "Buyer assembling master carton manifest",
    color: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    iconName: "ShoppingCart",
    isTerminal: false,
    isException: false,
    stepIndex: 0,
    slaHours: 2,
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    shortDesc: "Awaiting Axis Bank / UPI / NetBanking settlement",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    iconName: "Clock",
    isTerminal: false,
    isException: false,
    stepIndex: 1,
    slaHours: 4,
  },
  PAYMENT_AUTHORIZED: {
    label: "Payment Authorized",
    shortDesc: "Payment gateway authorized; UTR verified",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    iconName: "CheckCircle",
    isTerminal: false,
    isException: false,
    stepIndex: 2,
    slaHours: 0.5,
  },
  ORDER_CONFIRMED: {
    label: "Order Confirmed",
    shortDesc: "Official commercial invoice created; inventory locked",
    color: "text-brand-blue-light border-brand-blue/30 bg-brand-blue/10",
    iconName: "ShieldCheck",
    isTerminal: false,
    isException: false,
    stepIndex: 3,
    slaHours: 1,
  },
  ALLOCATED_TO_FC: {
    label: "Allocated to FC",
    shortDesc: "Dispatched to 1AA Mysore Central Hub (Kesare)",
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    iconName: "Building2",
    isTerminal: false,
    isException: false,
    stepIndex: 4,
    slaHours: 2,
  },
  PICKING: {
    label: "Picking in Bay",
    shortDesc: "Staff picking units from warehouse aisles",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    iconName: "Boxes",
    isTerminal: false,
    isException: false,
    stepIndex: 5,
    slaHours: 3,
  },
  PACKED: {
    label: "Bench QA & Packed",
    shortDesc: "100% bench tested, bubble-wrapped in heavy carton",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    iconName: "PackageCheck",
    isTerminal: false,
    isException: false,
    stepIndex: 6,
    slaHours: 2,
  },
  MANIFESTED: {
    label: "Manifested",
    shortDesc: "AWB Docket generated, Lorry Receipt (LR) sealed",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    iconName: "FileText",
    isTerminal: false,
    isException: false,
    stepIndex: 7,
    slaHours: 2,
  },
  SHIPPED: {
    label: "Shipped (In-Transit)",
    shortDesc: "BlueDart / Delhivery long-haul carrier transit active",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    iconName: "Truck",
    isTerminal: false,
    isException: false,
    stepIndex: 8,
    slaHours: 72,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    shortDesc: "Local commercial van on destination route with OTP",
    color: "text-brand-orange border-brand-orange/30 bg-brand-orange/10",
    iconName: "Navigation",
    isTerminal: false,
    isException: false,
    stepIndex: 9,
    slaHours: 12,
  },
  DELIVERED: {
    label: "Delivered",
    shortDesc: "Handed over at buyer doorstep via verified 4-digit OTP",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/20",
    iconName: "BadgeCheck",
    isTerminal: false,
    isException: false,
    stepIndex: 10,
    slaHours: 0,
  },
  CLOSED: {
    label: "Order Closed",
    shortDesc: "Commercial reconciliation completed; warranty logged",
    color: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    iconName: "Archive",
    isTerminal: true,
    isException: false,
    stepIndex: 11,
    slaHours: 0,
  },

  // Exceptions
  PAYMENT_FAILED: {
    label: "Payment Failed",
    shortDesc: "Transaction rejected by issuing bank / gateway timeout",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    iconName: "AlertTriangle",
    isTerminal: false,
    isException: true,
  },
  EXPIRED_CART_HOLD: {
    label: "Expired Cart Hold",
    shortDesc: "Inventory hold expired due to payment dormancy",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    iconName: "TimerOff",
    isTerminal: true,
    isException: true,
  },
  CANCELLED_BY_BUYER: {
    label: "Cancelled by Buyer",
    shortDesc: "Order revoked by merchant before fulfillment cutoff",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    iconName: "XCircle",
    isTerminal: true,
    isException: true,
  },
  CANCELLED_OUT_OF_STOCK: {
    label: "Cancelled (Out of Stock)",
    shortDesc: "Warehouse inventory discrepancy; auto-refund triggered",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    iconName: "PackageX",
    isTerminal: true,
    isException: true,
  },
  FAILED_DELIVERY_ATTEMPT_1: {
    label: "Delivery Attempt 1 Failed",
    shortDesc: "Consignee shop closed / customer unavailable at site",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    iconName: "AlertCircle",
    isTerminal: false,
    isException: true,
  },
  FAILED_DELIVERY_ATTEMPT_2: {
    label: "Delivery Attempt 2 Failed",
    shortDesc: "Second courier delivery attempt missed; driver scheduled call",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    iconName: "AlertCircle",
    isTerminal: false,
    isException: true,
  },
  FAILED_DELIVERY_ATTEMPT_3: {
    label: "Delivery Attempt 3 Failed",
    shortDesc: "Final courier delivery attempt failed; returning to hub",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    iconName: "AlertOctagon",
    isTerminal: false,
    isException: true,
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    shortDesc: "Buyer filed return within warranty terms",
    color: "text-pink-400 border-pink-500/30 bg-pink-500/10",
    iconName: "RotateCcw",
    isTerminal: false,
    isException: true,
  },
  RETURN_PICKED_UP: {
    label: "Return Picked Up",
    shortDesc: "3PL courier retrieved return carton from buyer site",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    iconName: "Truck",
    isTerminal: false,
    isException: true,
  },
  QC_REJECTED: {
    label: "QC Rejected",
    shortDesc: "Quality check failed on bench testing; replaced or credited",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
    iconName: "ShieldAlert",
    isTerminal: false,
    isException: true,
  },
  REFUNDED: {
    label: "Refunded to Buyer",
    shortDesc: "Axis Bank credit remittance returned to buyer account",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    iconName: "CreditCard",
    isTerminal: true,
    isException: true,
  },
};

/**
 * Validates if transition from currentState to targetState is legal
 */
export function canTransitionFsm(current: OrderFsmState, target: OrderFsmState): boolean {
  const allowed = PERMITTED_FSM_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Executes a valid state transition and appends to the audit history
 */
export function executeFsmTransition(
  currentHistory: FsmStateTransitionLog[],
  currentState: OrderFsmState,
  targetState: OrderFsmState,
  reason: string,
  actor: FsmActor = "system",
  metadata?: Record<string, any>
): { success: boolean; newState: OrderFsmState; history: FsmStateTransitionLog[]; error?: string } {
  if (!canTransitionFsm(currentState, targetState)) {
    return {
      success: false,
      newState: currentState,
      history: currentHistory,
      error: `Illegal FSM transition: Cannot transition from ${currentState} to ${targetState}`,
    };
  }

  const newLog: FsmStateTransitionLog = {
    id: `FSM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fromState: currentState,
    toState: targetState,
    timestamp: new Date().toISOString(),
    reason,
    actor,
    metadata,
  };

  return {
    success: true,
    newState: targetState,
    history: [...currentHistory, newLog],
  };
}

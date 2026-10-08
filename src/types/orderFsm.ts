/**
 * 1AA Store - Order Finite State Machine (FSM) Type Definitions
 * Strict linear state machine ensuring zero data corruption or orphan states
 */

export type OrderLinearState = 
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAYMENT_AUTHORIZED"
  | "ORDER_CONFIRMED"
  | "ALLOCATED_TO_FC"
  | "PICKING"
  | "PACKED"
  | "MANIFESTED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CLOSED";

export type OrderExceptionState = 
  | "PAYMENT_FAILED"
  | "EXPIRED_CART_HOLD"
  | "CANCELLED_BY_BUYER"
  | "CANCELLED_OUT_OF_STOCK"
  | "FAILED_DELIVERY_ATTEMPT_1"
  | "FAILED_DELIVERY_ATTEMPT_2"
  | "FAILED_DELIVERY_ATTEMPT_3"
  | "RETURN_REQUESTED"
  | "RETURN_PICKED_UP"
  | "QC_REJECTED"
  | "REFUNDED";

export type OrderFsmState = OrderLinearState | OrderExceptionState;

export type FsmActor = "buyer" | "system" | "gateway" | "fc_operator" | "courier_3pl" | "admin";

export interface FsmStateTransitionLog {
  id: string;
  fromState: OrderFsmState;
  toState: OrderFsmState;
  timestamp: string;
  reason: string;
  actor: FsmActor;
  metadata?: Record<string, any>;
}

export interface FsmStateMetadata {
  label: string;
  shortDesc: string;
  color: string;
  iconName: string;
  isTerminal: boolean;
  isException: boolean;
  stepIndex?: number; // 0 to 11 for linear states
  slaHours?: number;
}

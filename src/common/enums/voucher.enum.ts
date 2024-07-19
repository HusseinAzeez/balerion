export enum VoucherStatus {
  APPROVED = 'approved',
  WAITING_APPROVAL = 'waiting_approval',
  ON_HOLD = 'on_hold',
  AVAILABLE = 'available',
  EXPIRED = 'expired',
  USED = 'used',
  ACTIVATED = 'activated',
}

export enum VoucherType {
  CARSMEUP_CERTIFIED = 'carsmeup_certified',
  ROADSIDE_ASSIST = 'roadside_assist',
  B_QUIK_BENZINE = 'b_quik_benzine',
  B_QUIK_DIESEL = 'b_quik_diesel',
}

export const VoucherTypeNonReviewable = {
  roadside_assist: VoucherType.ROADSIDE_ASSIST,
  b_quik_benzine: VoucherType.B_QUIK_BENZINE,
  b_quik_diesel: VoucherType.B_QUIK_DIESEL,
};

export enum UserStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  INVITED = 'invited',
  WAITING_APPROVE = 'waiting_approve',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
}

export enum UserRole {
  PRIVATE = 'private',
  DEALER = 'dealer',
  AGENT = 'agent',
  VENDOR = 'vendor',
}

export enum UserReviewStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserAuthProvider {
  EMAIL = 'email',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

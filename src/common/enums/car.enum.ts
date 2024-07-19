export enum CarStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTION_REQUIRED = 'action_required',
  PUBLISHED = 'published',
  PENDING_EDIT_APPROVAL = 'pending_edit_approval',
  NEED_ACTION = 'need_action',
  NOT_APPROVED = 'not_approved',
  RESERVED = 'reserved',
  SOLD_OUT = 'sold_out',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export enum CarOwnership {
  FIRST = 'first',
  SECOND = 'second',
  THIRD = 'third',
  MORE = 'more',
}

export enum CarColor {
  BLACK = 'black',
  RED = 'red',
  BLUE = 'blue',
  BROWN = 'brown',
  SILVER = 'silver',
  BRONZE = 'bronze',
  WHITE = 'white',
  GREY = 'grey',
  YELLOW = 'yellow',
  PINK = 'pink',
  PURPLE = 'purple',
  ORANGE = 'orange',
  GREEN = 'green',
  VIOLET = 'violet',
  LIGHT_BLUE = 'light_blue',
  OTHERS = 'others',
}

export enum CarSoldOnPlatform {
  CARSMEUP = 'carsmeup',
  CLASSIFIEDS = 'classifieds',
  FACEBOOK = 'facebook',
  OTHER = 'other',
}

export enum CarType {
  PRIVATE = 'private',
  DEALER = 'dealer',
  CARSMEUP_CERTIFIED = 'carsmeup_certified',
}

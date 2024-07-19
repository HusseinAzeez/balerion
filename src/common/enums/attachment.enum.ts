export enum AttachmentType {
  REGISTRATION_CARD = 'registration_card',
  SERVICE_CARD = 'service_card',
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  DEFECT = 'defect',
  PROFILE = 'profile',
  PP20 = 'pp20',
  VIDEO = 'video',
  COCKPIT_DOCUMENT = 'cockpit_document',
  OTHER = 'other',
}

export const AttachmentTypeCar = {
  registration_card: AttachmentType.REGISTRATION_CARD,
  service_card: AttachmentType.SERVICE_CARD,
  exterior: AttachmentType.EXTERIOR,
  interior: AttachmentType.INTERIOR,
  defect: AttachmentType.DEFECT,
  video: AttachmentType.VIDEO,
  other: AttachmentType.OTHER,
};

export const AttachmentTypeUser = {
  pp20: AttachmentType.PP20,
};

export const AttachmentTypeCMUCertified = {
  cockpitDocument: AttachmentType.COCKPIT_DOCUMENT,
};

export enum AttachmentTypeVoucherDetail {
  EXTERIOR = AttachmentType.EXTERIOR,
  INTERIOR = AttachmentType.INTERIOR,
  REGISTRATION_CARD = AttachmentType.REGISTRATION_CARD,
}

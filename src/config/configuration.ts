export default () =>
  ({
    mode: process.env.MODE || 'development',
    port: parseInt(process.env.PORT, 10) || 8080,
    cmuStaffUrl: process.env.CMU_STAFF_URL,
    cmuClientUrl: process.env.CMU_CLIENT_URL,
    s3: {
      accessKey: process.env.AWS_ACCESS_KEY,
      secretKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION || 'ap-southeast-1',
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'carsmeup-api-stg',
    },
    database: {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      name: process.env.POSTGRES_DATABASE || 'carsmeup',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      senderEmail: process.env.SENDGRID_SENDER_EMAIL,
      verifyEmailAddressTemplateId:
        process.env.VERIFY_EMAIL_ADDRESS_TEMPLATE_ID,
      resetPasswordTemplateId: process.env.RESET_PASSWORD_TEMPLATE_ID,
      otpVerificationTemplateId: process.env.OTP_VERIFICATION_TEMPLATE_ID,
      userVoucherTemplateId: process.env.SENDGRID_USER_VOUCHER_TEMPLATE_ID,
      providerVoucherTemplateId:
        process.env.SENDGRID_PROVIDER_VOUCHER_TEMPLATE_ID,
      roadsideAssistProviderEmail: process.env.SENDGRID_RSA_PROVIDER_EMAIL,
      bQuikProviderEmail: process.env.SENDGRID_B_QUIK_PROVIDER_EMAIL,
      carsmeupCertifiedProviderEmail:
        process.env.SENDGRID_CMU_CERTIFIED_PROVIDER_EMAIL,
      onHoldCmuCertificationTemplateId:
        process.env.SENDGRID_ONHOLD_CMU_CERTIFICATION_TEMPLATE_ID,
      approvalCmuCertificationTemplateId:
        process.env.SENDGRID_APPROVAL_CMU_CERTIFICATION_TEMPLATE_ID,
      contactFormTemplateId: process.env.SENDGRID_CONTACT_FORM_TEMPLATE_ID,
      contactFormReceiverEmail:
        process.env.SENDGRID_CONTACT_FORM_RECEIVER_EMAIL,
      staffInvitationTemplateId:
        process.env.SENDGRID_STAFF_INVITATION_TEMPLATE_ID,
      userInvitationTemplateId:
        process.env.SENDGRID_USER_INVITATION_TEMPLATE_ID,
      dealerApprovedTemplateId:
        process.env.SENDGRID_DEALER_APPROVED_TEMPLATE_ID,
      dealerRejectedTemplateId:
        process.env.SENDGRID_DEALER_REJECTED_TEMPLATE_ID,
      applyForLoanInformationTemplateId:
        process.env.SENDGRID_APPLY_FOR_LOAN_INFORMATION_TEMPLATE_ID,
      applyForLoadProviderEmail:
        process.env.SENDGRID_APPLY_FOR_LOAD_PROVIDER_EMAIL,
      carsmeupAdminEmail: process.env.SENDGRID_CARSMEUP_ADMIN_EMAIL,
    },
    car: {
      publishedDaysLimit: process.env.CAR_PUBLISHED_DAYS_LIMIT || '180',
      expiredDaysLimit: process.env.CAR_EXPIRED_DAYS_LIMIT || '60',
      deletedDaysLimit: process.env.CAR_DELETED_DAYS_LIMIT || '60',
      hotDealedDaysLimit: process.env.CAR_HOT_DEALED_DAYS_LIMIT || '7',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET_KEY,
      apiVersion: process.env.STRIPE_API_VERSION || '2022-11-15',
      currency: process.env.STRIPE_CURRENCY || 'thb',
    },
    car4sure: {
      appId: process.env.CAR4SURE_APP_ID,
      clientId: process.env.CAR4SURE_CLIENT_ID,
      pageLimit: process.env.CAR4SURE_PAGE_LIMIT || 5,
      clearProcessedPosts:
        process.env.CAR4SURE_CLEAR_PROCESSED_POSTS || 'false',
    },
    voucher: {
      expiredYearsLimit: process.env.VOUCHER_EXPIRED_YEARS_LIMIT || '1',
    },
    thaiBulkSMS: {
      apiKey: process.env.THAI_BULK_SMS_API_KEY,
      apiSecret: process.env.THAI_BULK_SMS_API_SECRET,
      sender: process.env.THAI_BULK_SMS_SENDER,
      otpService: {
        apiKey: process.env.THAI_BULK_SMS_OTP_SERVICE_API_KEY,
        apiSecret: process.env.THAI_BULK_SMS_OTP_SERVICE_API_SECRET,
      },
    },
    bolt: {
      sftp: {
        host: process.env.BOLT_SFTP_HOST,
        port: parseInt(process.env.BOLT_SFTP_PORT, 10) || 22,
        username: process.env.BOLT_SFTP_USERNAME,
        privateKey: process.env.BOLT_SFTP_PRIVATE_KEY,
        decryptKey: process.env.BOLT_SFTP_DECRYPT_PRIVATE_KEY,
        decryptKeyPassphrase:
          process.env.BOLT_SFTP_DECRYPT_PRIVATE_KEY_PASSPHRASE,
      },
    },
  } as const);

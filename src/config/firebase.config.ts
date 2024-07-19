import { registerAs } from '@nestjs/config';

export default registerAs('firebaseAdmin', () => ({
  type: process.env.FBA_TYPE || '',
  projectId: process.env.FBA_PROJECT_ID || '',
  privateKeyId: process.env.FBA_PRIVATE_KEY_ID || '',
  privateKey: process.env.FBA_PRIVATE_KEY || '',
  clientEmail: process.env.FBA_CLIENT_EMAIL || '',
  clientId: process.env.FBA_CLIENT_ID || '',
  authUri: process.env.FBA_AUTH_URI || '',
  tokenUri: process.env.FBA_TOKEN_URI || '',
  authProviderCertUrl: process.env.FBA_AUTH_PROVIDER_CERT_URL || '',
  clientCertUrl: process.env.FBA_CLIENT_CERT_URL || '',
  universeDomain: process.env.FBA_UNIVERSE_DOMAIN || '',
}));

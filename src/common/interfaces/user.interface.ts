import { UserAuthProvider } from '../enums/user.enum';

export interface ISocialProfile {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  pictureUrl?: string;
  providerType: UserAuthProvider;
}

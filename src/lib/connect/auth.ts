// Stacks Connect authentication helpers
/** Auth options passed to openAuth */
export interface AuthOptions {
  appDetails: { name: string; icon: string };
  onFinish?: (payload: UserSessionData) => void;
  onCancel?: () => void;
  network?: string;
}
/** User session data returned after auth */
export interface UserSessionData {
  username?: string;
  profile?: UserProfile;
  identityAddress?: string;
  appPrivateKey?: string;
  hubUrl?: string;
}
/** User profile data */
export interface UserProfile {
  stxAddress: { mainnet: string; testnet: string };
  btcAddress?: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
}

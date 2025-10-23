export type RootStackParamList = {
  KYC: undefined;
  Voter: {
    address?: string;
    kycVerified?: boolean;
  };
  Admin: {
    address?: string;
  };
  Tally: undefined;
  WalletConnect: undefined;
};

export type BottomTabParamList = {
  Vote: undefined;
  Results: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 
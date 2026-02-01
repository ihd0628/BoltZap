export type RootStackParamList = {
  MainTabs: undefined;
  SendAmount: { destination: string; paymentType?: 'lightning' | 'onchain' };
  ImportSeed: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  Transactions: undefined;
  Node: undefined;
};

export type SendStackParamList = {
  SendMain: undefined;
};

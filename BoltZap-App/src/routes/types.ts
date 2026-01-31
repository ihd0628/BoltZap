export type RootTabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  Transactions: undefined;
  Node: undefined;
};

export type SendStackParamList = {
  SendMain: undefined;
  SendAmount: { destination: string; paymentType?: 'lightning' | 'onchain' };
};

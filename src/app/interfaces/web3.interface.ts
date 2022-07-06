export interface ICreateToken {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  tokenDecimals: number;
  TxFeePercentToHolders: number;
  TxFeePercentToLP: number;
  TxFeePercentToBurned: number;
  TxFeePercentToWallet: number;
  TxFeePercentToBuybackTokens: number;
  MaxWalletPercent: number;
  MaxTxPercent: number;
  FeeReceiverWallet: number;
  RouterAddress: string;
}

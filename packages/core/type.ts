export type TokenInRoute = {
  address: string;
  chainId: number;
  symbol: string;
  decimals: string;
  buyFeeBps?: string;
  sellFeeBps?: string;
};

export type V3PoolInRoute = {
  type: "v3-pool";
  address: string;
  tokenIn: TokenInRoute;
  tokenOut: TokenInRoute;
  sqrtRatioX96: string;
  liquidity: string;
  tickCurrent: string;
  fee: string;
  amountIn?: string;
  amountOut?: string;
};

export type QuoteResponse = {
  quoteId: string;
  amount: string;
  amountDecimals: string;
  quote: string;
  quoteDecimals: string;
  quoteGasAdjusted: string;
  quoteGasAdjustedDecimals: string;
  quoteGasAndPortionAdjusted?: string;
  quoteGasAndPortionAdjustedDecimals?: string;
  gasUseEstimate: string;
  gasUseEstimateQuote: string;
  gasUseEstimateQuoteDecimals: string;
  gasUseEstimateGasToken?: string;
  gasUseEstimateGasTokenDecimals?: string;
  gasUseEstimateUSD: string;
  simulationError?: boolean;
  simulationStatus: SimulationStatus;
  gasPriceWei: string;
  blockNumber: string;
  route: Array<V3PoolInRoute[]>;
  routeString: string;
  hitsCachedRoutes?: boolean;
  portionBips?: number;
  portionRecipient?: string;
  portionAmount?: string;
  portionAmountDecimals?: string;
};

export enum SimulationStatus {
  NotSupported = 0,
  Failed = 1,
  Succeeded = 2,
  InsufficientBalance = 3,
  NotApproved = 4,
}

export enum TradeTypeParam {
  ExactIn = "exactIn",
  ExactOut = "exactOut",
}

import { computePoolAddress } from "@uniswap/v3-sdk";
import QuoterV2 from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { BigNumber, ethers, providers } from "ethers";
import { FeeAmount } from "@uniswap/v3-sdk";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Decimal } from "decimal.js";
import { getProvider, getToken } from "@arsenswap-quoter/core/utils";
import {
  V3PoolInRoute,
  TradeTypeParam,
  QuoteResponse,
  SimulationStatus,
} from "@arsenswap-quoter/core/type";

const POOL_FACTORY_CONTRACT_ADDRESS =
  "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const QUOTER_CONTRACT_ADDRESS = "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);
  const {
    tokenInAddress,
    tokenInChainId,
    tokenOutAddress,
    tokenOutChainId,
    amount,
  } = body;
  const type = body.type as TradeTypeParam;

  if (tokenInChainId !== tokenOutChainId) {
    return {
      statusCode: 400,
      errorCode: "TOKEN_CHAINS_DIFFERENT",
      detail: `Cannot request quotes for tokens on different chains`,
    };
  }

  const tokenIn = await getToken(tokenInChainId, tokenInAddress);
  const tokenOut = await getToken(tokenOutChainId, tokenOutAddress);

  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    QuoterV2.abi,
    getProvider()
  );

  const v3Route: V3PoolInRoute[] = [];
  for (const feeAmount of [
    FeeAmount.MEDIUM,
    FeeAmount.LOW,
    FeeAmount.HIGH,
    FeeAmount.LOWEST,
  ]) {
    try {
      const currentPoolAddress = computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: tokenIn,
        tokenB: tokenOut,
        fee: feeAmount,
      });
      let response;
      let sqrtPriceX96After;
      switch (type) {
        case TradeTypeParam.ExactIn:
          response = await quoterContract.callStatic.quoteExactInputSingle([
            tokenIn.address,
            tokenOut.address,
            new Decimal(+amount).mul(Decimal.pow(10, tokenIn.decimals)).toHex(),
            feeAmount,
            0,
          ]);
          const quotedAmountOut = response.amountOut as BigNumber;
          sqrtPriceX96After = response.sqrtPriceX96After as BigNumber;

          v3Route.push({
            type: "v3-pool",
            address: currentPoolAddress,
            tokenIn: {
              address: tokenIn.address,
              chainId: tokenIn.chainId,
              symbol: tokenIn.symbol as string,
              decimals: tokenIn.decimals.toString(),
            },
            tokenOut: {
              address: tokenOut.address,
              chainId: tokenOut.chainId,
              symbol: tokenOut.symbol as string,
              decimals: tokenOut.decimals.toString(),
            },
            sqrtRatioX96: sqrtPriceX96After.toHexString(),
            liquidity: "0",
            tickCurrent: "0",
            fee: feeAmount.toString(),
            amountIn: amount,
            amountOut: quotedAmountOut.toString(),
          });
          break;
        case TradeTypeParam.ExactOut:
          response = await quoterContract.callStatic.quoteExactOutputSingle([
            tokenIn.address,
            tokenOut.address,
            new Decimal(amount).mul(Decimal.pow(10, tokenOut.decimals)).toHex(),
            feeAmount,
            0,
          ]);
          const quotedAmountIn = response.amountIn as BigNumber;
          sqrtPriceX96After = response.sqrtPriceX96After as BigNumber;

          v3Route.push({
            type: "v3-pool",
            address: currentPoolAddress,
            tokenIn: {
              address: tokenIn.address,
              chainId: tokenIn.chainId,
              symbol: tokenIn.symbol as string,
              decimals: tokenIn.decimals.toString(),
            },
            tokenOut: {
              address: tokenOut.address,
              chainId: tokenOut.chainId,
              symbol: tokenOut.symbol as string,
              decimals: tokenOut.decimals.toString(),
            },
            sqrtRatioX96: sqrtPriceX96After.toHexString(),
            liquidity: "0",
            tickCurrent: "0",
            fee: feeAmount.toString(),
            amountIn: quotedAmountIn.toString(),
            amountOut: amount,
          });
      }
    } catch (error) {
      console.error(error);
    }
  }
  const result: QuoteResponse = {
    quoteId: "0",
    amount: amount,
    amountDecimals: tokenIn.decimals.toString(),
    quote: "0",
    quoteDecimals: tokenOut.decimals.toString(),
    quoteGasAdjusted: "0",
    quoteGasAdjustedDecimals: "0",
    gasUseEstimate: "0",
    gasUseEstimateQuote: "0",
    gasUseEstimateQuoteDecimals: "0",
    gasUseEstimateUSD: "0",
    simulationStatus: SimulationStatus.Succeeded,
    gasPriceWei: "0",
    blockNumber: "0",
    route: [v3Route],
    routeString: "0",
  };
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

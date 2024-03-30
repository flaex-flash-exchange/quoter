import { Token } from "@uniswap/sdk-core";
import { ethers, providers } from "ethers";

export const getToken = async (chainId: number, address: string) => {
  // TODO: Fetch decimals from the blockchain
  return new Token(chainId, address, 18);
};

export function getProvider(): providers.Provider {
  return new ethers.providers.StaticJsonRpcProvider({
    url: "https://eth-sepolia.g.alchemy.com/v2/_8hM_H2lFo-7ub_l5x8x01AhpdUMkRJm",
    skipFetchSetup: true,
  });
}

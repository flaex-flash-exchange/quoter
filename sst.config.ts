import { SSTConfig } from "sst";
import { QuoteStack } from "./stacks/QuoteStack";

export default {
  config(_input) {
    return {
      name: "arsenswap-quoter",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(QuoteStack);
  },
} satisfies SSTConfig;

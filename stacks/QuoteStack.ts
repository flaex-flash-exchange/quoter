import { Api, StackContext } from "sst/constructs";

export function QuoteStack({ stack }: StackContext) {
  // Create the HTTP API
  const api = new Api(stack, "Api", {
    routes: {
      "POST /quote": "packages/functions/src/quote.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

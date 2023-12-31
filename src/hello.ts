import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda/mod.ts";
import { DynamoDBClient, GetItemCommand } from "npm:@aws-sdk/client-dynamodb";

// deno-lint-ignore require-await
export async function handler(
  _event: APIGatewayProxyEventV2,
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    headers: { "content-type": "text/html;charset=utf8" },
    body: [
      `Hello World! Sent from AWS CDK deno ${Deno.version.deno} 🦕`,
      JSON.stringify(
        await new DynamoDBClient({}).send(
          new GetItemCommand({
            TableName: Deno.env.get("TABLE_NAME"),
            Key: { id: { S: "foo" } },
          })
        ),
        null,
        2
      ),
    ].join("\n"),
  };
}

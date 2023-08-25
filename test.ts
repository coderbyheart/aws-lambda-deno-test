import { STSClient, GetCallerIdentityCommand } from "npm:@aws-sdk/client-sts";

console.log(await new STSClient({}).send(new GetCallerIdentityCommand()));

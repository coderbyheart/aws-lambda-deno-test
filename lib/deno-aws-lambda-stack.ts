import {
  App,
  aws_lambda as Lambda,
  Stack,
  StackProps,
  Duration,
  aws_dynamodb as DynamoDB,
  RemovalPolicy,
} from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { CfnApplication } from "aws-cdk-lib/aws-sam";
export class DenoStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const db = new DynamoDB.Table(this, "table", {
      billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: DynamoDB.AttributeType.STRING,
      },
      pointInTimeRecovery: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const denoRuntime = new CfnApplication(this, "DenoRuntime", {
      location: {
        applicationId:
          "arn:aws:serverlessrepo:us-east-1:390065572566:applications/deno",
        semanticVersion: "1.32.5",
      },
    });

    // Deno Layer
    const layer = Lambda.LayerVersion.fromLayerVersionArn(
      this,
      "denoRuntimeLayer",
      denoRuntime.getAtt("Outputs.LayerArn").toString()
    );

    const name = new Lambda.Function(this, "HelloHandler", {
      runtime: Lambda.Runtime.PROVIDED_AL2,
      code: Lambda.Code.fromAsset("src"),
      handler: "hello.handler",
      layers: [layer],
      timeout: Duration.seconds(60),
      environment: {
        TABLE_NAME: db.tableName,
        DENO_PERMISSIONS: "--allow-all",
      },
    });

    db.grantReadData(name);

    // API Gateway
    new LambdaRestApi(this, "Endpoint", {
      handler: name,
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  readonly crossAccId: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    // Grant access for client account to call Api Gateway in this account
    const apiGwPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.AccountPrincipal(props?.crossAccId),
      ],
      actions: [
        'execute-api:Invoke',
      ],
      resources: [
        this.formatArn({
          service: 'execute-api',
          resource: '*', // CDK doesn't support updating policy of REST API after initializing it - https://github.com/aws/aws-cdk/issues/8781
        }),
      ],
    });

    const orderRestApi = new apigw.RestApi(this, 'rest-api-order', {
      deployOptions: {
        stageName: 'prod',
      },
      deploy: true,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.IAM,
      },
      defaultCorsPreflightOptions: {
        allowMethods: ['GET', 'OPTIONS'],
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
      policy: new iam.PolicyDocument({
        statements: [
          apiGwPolicy,
        ],
      }),
    });

    const orderApiLambda = new lambdaNodejs.NodejsFunction(this, 'order-api-lambda', {
      entry: './src/order-api-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    // /order
    orderRestApi.root.addMethod('GET', new apigw.LambdaIntegration(orderApiLambda));

    new cdk.CfnOutput(this, 'api-gateway-rest-api-id', {
      value: orderRestApi.restApiId,
      description: 'Api Id of the rest api',
      exportName: 'apiGwRestApiId',
    });
  }
}

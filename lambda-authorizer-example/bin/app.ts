import * as cdk from 'aws-cdk-lib';
import { LambdaAuthorizerMainStack } from '../lib/lambda-authorizer-main-stack';

const app = new cdk.App();
new LambdaAuthorizerMainStack(app, 'LambdaAuthorizerMainStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

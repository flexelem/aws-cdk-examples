import * as cdk from 'aws-cdk-lib';
import { CognitoUserPoolStack } from '../lib/cognito-user-pool-stack';

const app = new cdk.App();
new CognitoUserPoolStack(app, 'CognitoUserPoolStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

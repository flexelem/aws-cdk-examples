import * as cdk from 'aws-cdk-lib';
import { AuthCodeFlowStack } from '../lib/auth-code-flow-stack';

const app = new cdk.App();
new AuthCodeFlowStack(app, 'AuthCodeFlowStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

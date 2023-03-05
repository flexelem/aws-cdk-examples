import * as cdk from 'aws-cdk-lib';
import { ClientCredsFlowStack } from '../lib/client-creds-flow-stack';

const app = new cdk.App();
new ClientCredsFlowStack(app, 'ClientCredentialsFlowStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

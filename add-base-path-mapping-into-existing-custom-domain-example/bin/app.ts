import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();
const infrastructureStack = new InfrastructureStack(app, 'InfrastuctureStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const appStack = new AppStack(app, 'AppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
appStack.addDependency(infrastructureStack);

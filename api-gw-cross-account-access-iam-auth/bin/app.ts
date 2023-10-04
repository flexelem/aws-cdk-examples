import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { ClientStack } from '../lib/client-stack';

const apiGwAccount = '548754742764';
const clientAccount = '329380440465';

const app = new cdk.App();
const apiStack = new ApiStack(app, 'ApiStack', {
  env: {
    account: apiGwAccount,
    region: 'us-east-1',
  },
  crossAccId: clientAccount,
});

const clientStack = new ClientStack(app, 'ClientStack', {
  env: {
    account: clientAccount,
    region: 'us-east-1',
  },
  apiGwAccId: apiGwAccount,
  apiGwApiId: 'API_GW_API_ID_FROM_SOURCE_ACCOUNT',
});

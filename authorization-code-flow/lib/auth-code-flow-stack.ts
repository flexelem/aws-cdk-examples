import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoStack } from './cognito-stack';
import { ApiGatewayStack } from './api-gateway-stack';

export class AuthCodeFlowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoStack = new CognitoStack(this, 'CognitoStack');
    const apiGatewayStack = new ApiGatewayStack(this, 'ApiGatewayStack', cognitoStack.cognitoUserPool);
    apiGatewayStack.addDependency(cognitoStack);
  }
}

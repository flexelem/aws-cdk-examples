import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ClientStackProps extends cdk.StackProps {
  readonly apiGwAccId: string;
  readonly apiGwApiId: string;
}

export class ClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ClientStackProps) {
    super(scope, id, props);

    const clientLambda = new lambdaNodejs.NodejsFunction(this, 'client-lambda', {
      entry: './src/client-account-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        API_GW_ENDPOINT: `https://${props.apiGwApiId}.execute-api.${this.region}.amazonaws.com/prod`,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    clientLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'execute-api:Invoke',
      ],
      resources: [
        this.formatArn({
          account: props.apiGwAccId,
          service: 'execute-api',
          resource: props.apiGwApiId,
          resourceName: '*',
        }),
      ],
    }));
  }
}

import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackProps = this.node.tryGetContext('stackProps');

    // Import existing hosted zone (registered domain)
    const hostedZone = route53.HostedZone.fromLookup(this, 'hosted-zone', { domainName: stackProps.domainName });

    // Import domainName we created in 'InfrastuctureStack'
    const domainName = apigw.DomainName.fromDomainNameAttributes(this, 'domain-name', {
      domainName: stackProps.domainName,
      domainNameAliasHostedZoneId: hostedZone.hostedZoneId,
      domainNameAliasTarget: cdk.Fn.importValue('domainNameAliasDomainName'),
    });

    const orderRestApi = new apigw.RestApi(this, 'rest-api-order', {
      deployOptions: {
        stageName: 'prod',
      },
      deploy: true,
      defaultCorsPreflightOptions: {
        allowMethods: ['GET', 'OPTIONS'],
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    // add '/order' base path mapping
    new apigw.BasePathMapping(this, 'base-path-mapping-order', {
      basePath: 'order',
      domainName: domainName,
      restApi: orderRestApi,
    });

    const orderApiLambda = new lambdaNodejs.NodejsFunction(this, 'awesome-api-lambda', {
      entry: './src/order-api-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    // /order
    orderRestApi.root.addMethod('GET', new apigw.LambdaIntegration(orderApiLambda));
  }
}

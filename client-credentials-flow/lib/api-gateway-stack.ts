import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cognitoUserPool: cognito.IUserPool, props?: cdk.StackProps) {
    super(scope, id, props);

    const awesomeApi = new apigw.RestApi(this, 'awesome-api', {
      endpointTypes: [apigw.EndpointType.REGIONAL],
      deploy: true,
      deployOptions: {
        stageName: 'prod',
      },
    });
    
    const cognitoUserPoolAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'cognito-userpool-authorizer', {
      cognitoUserPools: [cognitoUserPool],
    });

    // /awesomeapi
    const awesomeApiResource = awesomeApi.root.addResource('awesomeapi');
    awesomeApiResource.addMethod(
      'GET',
      new apigw.MockIntegration({
        integrationResponses: [{
          statusCode: '200',
          responseTemplates: {
            'application/json': JSON.stringify({
              statusCode: 200,
              message: 'Hello From Protected Resource',
            }),
          },
          responseParameters: {
            'method.response.header.Content-Type': "'application/json'",
          },
        }],
        requestTemplates: {
          'application/json': "{ 'statusCode': 200 }",
        },
      }), {
        methodResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        }],
        authorizer: cognitoUserPoolAuthorizer,
        authorizationType: apigw.AuthorizationType.COGNITO,
        authorizationScopes: ['awesomeapi-resource-server/awesomeapi.read'],
      },
    );
  }
}

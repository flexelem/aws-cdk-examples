import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigw2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigw2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionTable = new dynamodb.Table(this, 'main-dynamo-table', {
      partitionKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const wsConnectLambda = new lambdaNodejs.NodejsFunction(this, 'ws-connect-lambda', {
      entry: './src/ws-connect-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        CONN_TABLE_NAME: connectionTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });
    connectionTable.grantWriteData(wsConnectLambda);

    const wsDisconnectLambda = new lambdaNodejs.NodejsFunction(this, 'ws-disconnect-lambda', {
      entry: './src/ws-disconnect-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        CONN_TABLE_NAME: connectionTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });
    connectionTable.grantWriteData(wsDisconnectLambda);

    const webSocketApi = new apigw2.WebSocketApi(this, 'websocket-api', {
      connectRouteOptions: {
        integration: new apigw2Integrations.WebSocketLambdaIntegration('ws-connect-integration', wsConnectLambda),
      },
      disconnectRouteOptions: {
        integration: new apigw2Integrations.WebSocketLambdaIntegration('ws-disconnect-integration', wsDisconnectLambda),
      },
    });

    const webSocketStage = new apigw2.WebSocketStage(this, 'websocket-stage', {
      webSocketApi: webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    const restApi = new apigw.RestApi(this, 'rest-api', {
      deployOptions: {
        stageName: 'prod',
      },
      deploy: true,
      defaultCorsPreflightOptions: {
        allowMethods: ['POST', 'OPTIONS'],
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    const apiLambda = new lambdaNodejs.NodejsFunction(this, 'api-lambda', {
      entry: './src/api-lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        WS_API_ENDPOINT: `https://${webSocketApi.apiId}.execute-api.${props?.env?.region}.amazonaws.com/${webSocketStage.stageName}`,
        CONN_TABLE_NAME: connectionTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });
    connectionTable.grantReadData(apiLambda);
    webSocketApi.grantManageConnections(apiLambda);

    restApi.root.addMethod('POST', new apigw.LambdaIntegration(apiLambda));
  }
}

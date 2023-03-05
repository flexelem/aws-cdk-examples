import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoStack extends cdk.Stack {
  readonly cognitoUserPool: cognito.IUserPool;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    this.cognitoUserPool = new cognito.UserPool(this, 'awesome-cognito-user-pool', {
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const awesomeApiReadScope = new cognito.ResourceServerScope({
      scopeName: 'awesomeapi.read',
      scopeDescription: 'awesomeapi read scope',
    });

    const resourceServer = new cognito.UserPoolResourceServer(this, 'awesome-resource-server', {
      identifier: 'awesomeapi-resource-server',
      userPool: this.cognitoUserPool,
      scopes: [awesomeApiReadScope],
    });

    const userPoolAppClient = new cognito.UserPoolClient(this, 'awesome-app-client', {
      userPool: this.cognitoUserPool,
      accessTokenValidity: cdk.Duration.minutes(60),
      generateSecret: true,
      refreshTokenValidity: cdk.Duration.days(1),
      enableTokenRevocation: true,
      oAuth: {
        flows: {
          clientCredentials: true,
        },
        scopes: [cognito.OAuthScope.resourceServer(resourceServer, awesomeApiReadScope)],
      },
    });

    this.cognitoUserPool.addDomain('awesome-cognito-domain', {
      cognitoDomain: {
        domainPrefix: 'buraktas-awesome-domain',
      },
    });
  }
}

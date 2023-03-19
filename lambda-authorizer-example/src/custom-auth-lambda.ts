import { PolicyDocument } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer';
import 'source-map-support/register';

const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USERPOOL_ID || '',
  clientId: process.env.CLIENT_ID,
  tokenUse: 'access',
});

export const handler = async function (event: any): Promise<APIGatewayAuthorizerResult> {
  console.log(`event => ${JSON.stringify(event)}`);

  // authentication step by getting and validating JWT token
  const authToken = event.headers['authorization'] || '';
  try {
    // @ts-ignore
    const decodedJWT = await cognitoJwtVerifier.verify(authToken);

    // After the token is verified we can do Authorization check here if needed.
    // If the request doesn't meet authorization conditions then we should return a Deny policy.

    const policyDocument: PolicyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event['methodArn'],
        },
      ],
    };

    // This is the place you inject custom data into request context which will be available inside `event.requestContext.authorizer`
    // in API Lambdas.
    const context = {
      'userId': 123,
      'companyId': 456,
      'role': 'ADMIN',
    };

    const response: APIGatewayAuthorizerResult = {
      principalId: decodedJWT.sub,
      policyDocument,
      context,
    };
    console.log(`response => ${JSON.stringify(response)}`);

    return response;
  } catch (err) {
    console.error('Invalid auth token. err => ', err);
    throw new Error('Unauthorized');
  }
};

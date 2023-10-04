import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import fetch from 'node-fetch';

export const handler = async function (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  console.log(`event => ${JSON.stringify(event)}`);

  const endpointUrl = new URL(`${process.env.API_GW_ENDPOINT}/`);
  const request = new HttpRequest({
    hostname: endpointUrl.hostname,
    path: endpointUrl.pathname,
    protocol: endpointUrl.protocol,
    method: 'GET',
    headers: {
      host: endpointUrl.host,
      accept: 'application/json',
      'content-type': 'application/json',
    },
  });

  const requestSigner = new SignatureV4({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
    service: 'execute-api',
    region: 'us-east-1',
    sha256: Sha256,
  });

  const signedRequest = await requestSigner.sign(request);
  const response = await fetch(endpointUrl.href, signedRequest);
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json()),
  };
};

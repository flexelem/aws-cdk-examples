### Description
CDK project to provision related resources for OAuth Client Credentials Flow explained in my [tutorial](http://buraktas.com/oauth-client-credentials-flow-aws-cdk/)

Resources;
- Cognito UserPool
- Cognito AppClient
- Cognito Resource Server
- Api Gateway

<br/>

### Install dependencies
> yarn install

<br/>

### Synth Stacks
> cdk synth

```
Supply a stack id (ClientCredentialsFlowStack, ClientCredentialsFlowStack/CognitoStack, ClientCredentialsFlowStack/ApiGatewayStack) to display its template.
```

<br/>

### List Stacks
> cdk ls

```
ClientCredentialsFlowStack
ClientCredentialsFlowStack/CognitoStack
ClientCredentialsFlowStack/ApiGatewayStack
```

<br/>

### Deploy Stacks
> cdk deploy --all

<br/>

### Destroy Stacks
> cdk destroy --all

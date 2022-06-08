### Description
CDK project to provision related resources for OAuth Authorization Code Flow explained in my [tutorial](http://buraktas.com/oauth-authorization-code-flow-aws-cdk/)

Resources;
- Cognito UserPool
- Cognito AppClient
- Cognito Resource Server 
- Api Gateway

<br/>

### Create Python Virtual Env
> poetry shell

<br/>

### Install dependencies
> poetry install

<br/>

### Synth Stacks
> cdk synth

```
Supply a stack id (AuthCodeFlowStack, AuthCodeFlowStack/CognitoStack, AuthCodeFlowStack/ApiGatewayStack) to display its template
```

<br/>

### List Stacks
> cdk ls

```
AuthCodeFlowStack
AuthCodeFlowStack/CognitoStack
AuthCodeFlowStack/ApiGatewayStack
```

<br/>

### Deploy Stacks
> cdk deploy --all

<br/>

### Destroy Stacks
> cdk destroy --all

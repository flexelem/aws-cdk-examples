import json
from aws_cdk import (
    core,
    aws_cognito as cognito,
    aws_apigateway as api_gateway
)


class ApiGatewayStack(core.Stack):
    def __init__(self, scope: core.Construct,
                 id: str,
                 cognito_user_pool: cognito.IUserPool,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        awesome_api = api_gateway.RestApi(
            self,
            "awesome-api",
            endpoint_types=[api_gateway.EndpointType.REGIONAL],
            deploy=True,
            deploy_options=api_gateway.StageOptions(
                stage_name="prod",
            ),
        )

        cognito_userpool_authorizer = api_gateway.CognitoUserPoolsAuthorizer(
            self,
            "cognito-userpool-authorizer",
            cognito_user_pools=[cognito_user_pool]
        )

        # /awesomeapi
        awesome_api_resource = awesome_api.root.add_resource("awesomeapi")

        awesome_api_resource.add_method(
            "GET",
            api_gateway.MockIntegration(
                integration_responses=[api_gateway.IntegrationResponse(
                    status_code="200",
                    response_templates={
                        "application/json": json.dumps({
                            "statusCode": 200,
                            "message": "Hello From Protected Resource",
                        })
                    },
                    response_parameters={
                        "method.response.header.Content-Type": "'application/json'",
                    }
                )],
                request_templates={
                    "application/json": "{ 'statusCode': 200 }"
                }
            ),
            method_responses=[api_gateway.MethodResponse(
                status_code="200",
                response_parameters={
                    "method.response.header.Content-Type": True,
                }
            )],
            authorizer=cognito_userpool_authorizer,
            authorization_type=api_gateway.AuthorizationType.COGNITO,
            authorization_scopes=["awesomeapi-resource-server/awesomeapi.read"]
        )

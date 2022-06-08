from aws_cdk import (
    core
)

from lib.api_gateway_stack import ApiGatewayStack
from lib.cognito_stack import CognitoStack


class ClientCredsFlowStack(core.Stack):
    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        cognito_stack = CognitoStack(self, "CognitoStack")

        api_gateway_stack = ApiGatewayStack(self, "ApiGatewayStack", cognito_stack.cognito_user_pool)
        api_gateway_stack.add_dependency(cognito_stack)

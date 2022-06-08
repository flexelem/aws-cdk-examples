from aws_cdk import (
    core,
    aws_cognito as cognito,
)


class CognitoStack(core.Stack):
    def __init__(self, scope: core.Construct,
                 id: str,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.cognito_user_pool = cognito.UserPool(self, "awesome-cognito-user-pool",
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=core.RemovalPolicy.DESTROY
        )

        awesome_api_read_scope = cognito.ResourceServerScope(scope_name="awesomeapi.read", scope_description="awesomeapi read scope")

        resource_server = cognito.UserPoolResourceServer(
            self,
            "awesome-resource-server",
            identifier="awesomeapi-resource-server",
            user_pool=self.cognito_user_pool,
            scopes=[awesome_api_read_scope]
        )

        user_pool_app_client = cognito.UserPoolClient(
            self,
            "awesome-app-client",
            user_pool=self.cognito_user_pool,
            access_token_validity=core.Duration.minutes(60),
            generate_secret=True,
            refresh_token_validity=core.Duration.days(1),
            enable_token_revocation=True,
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(
                    client_credentials=True,
                ),
                scopes=[cognito.OAuthScope.resource_server(resource_server, awesome_api_read_scope)],
            )
        )

        self.cognito_user_pool.add_domain("awesome-cognito-domain",
            cognito_domain=cognito.CognitoDomainOptions(
                domain_prefix="buraktas-awesome-domain"
            )
        )

        core.CfnOutput(self, "CognitoUserPoolID", value=self.cognito_user_pool.user_pool_id)
        core.CfnOutput(self, "CognitoUserPoolAppClientID", value=user_pool_app_client.user_pool_client_id)

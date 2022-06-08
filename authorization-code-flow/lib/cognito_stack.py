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
            sign_in_aliases=cognito.SignInAliases(
                email=True
            ),
            self_sign_up_enabled=True,
            auto_verify=cognito.AutoVerifiedAttrs(
                email=True
            ),
            user_verification=cognito.UserVerificationConfig(
                email_subject="You need to verify your email",
                email_body="Thanks for signing up Your verification code is {####}",
                email_style=cognito.VerificationEmailStyle.CODE
            ),
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
            id_token_validity=core.Duration.minutes(60),
            generate_secret=False,
            refresh_token_validity=core.Duration.days(1),
            enable_token_revocation=True,
            prevent_user_existence_errors=True,
            auth_flows=cognito.AuthFlow(
                user_password=True,
            ),
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(
                    authorization_code_grant=True,
                ),
                scopes=[cognito.OAuthScope.OPENID,
                        cognito.OAuthScope.resource_server(resource_server, awesome_api_read_scope)
                ],
                callback_urls=["http://localhost:3000/dashboard"],
            )
        )

        self.cognito_user_pool.add_domain("awesome-cognito-domain",
            cognito_domain=cognito.CognitoDomainOptions(
                domain_prefix="buraktas-awesome-domain"
            )
        )

        core.CfnOutput(self, "CognitoUserPoolID", value=self.cognito_user_pool.user_pool_id)
        core.CfnOutput(self, "CognitoUserPoolAppClientID", value=user_pool_app_client.user_pool_client_id)

from aws_cdk import (
    core,
    aws_cognito as cognito
)


class CognitoUserPoolStack(core.Stack):
    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        cognito_user_pool = cognito.UserPool(self, "awesome-user-pool",
            user_pool_name="awesome-user-pool",
            sign_in_aliases=cognito.SignInAliases(
                email=True
            ),
            self_sign_up_enabled=True,
            auto_verify=cognito.AutoVerifiedAttrs(
                email=True  # This is True by default if email is defined in SignInAliases
            ),
            user_verification=cognito.UserVerificationConfig(
                email_subject="You need to verify your email",
                email_body="Thanks for signing up Your verification code is {####}",  # This placeholder is a must if code is selected as preferred verification method
                email_style=cognito.VerificationEmailStyle.CODE
            ),
            standard_attributes=cognito.StandardAttributes(
                family_name=cognito.StandardAttribute(
                    required=True,
                    mutable=False,
                ),
                address=cognito.StandardAttribute(
                    required=False,
                    mutable=True
                )
            ),
            custom_attributes={
                "tenant_id": cognito.StringAttribute(min_len=10, max_len=15, mutable=False),
                "created_at": cognito.DateTimeAttribute(),
                "employee_id": cognito.NumberAttribute(min=1, max=100, mutable=False),
                "is_admin": cognito.BooleanAttribute(mutable=True),
            },
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=True
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=core.RemovalPolicy.DESTROY
        )

        app_client = cognito_user_pool.add_client(
            "awesome-app-client",
            user_pool_client_name="awesome-app-client",
            auth_flows=cognito.AuthFlow(
                user_password=True
            )
        )
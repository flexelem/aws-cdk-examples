import os
from aws_cdk import core

from lib.cognito_userpool_stack import CognitoUserPoolStack

app = core.App()
main_env = core.Environment(account=os.environ["CDK_DEFAULT_ACCOUNT"], region=os.environ["CDK_DEFAULT_REGION"])
cognito_user_pool_stack = CognitoUserPoolStack(app, 'CognitoUserPoolStack', env=main_env)

app.synth()

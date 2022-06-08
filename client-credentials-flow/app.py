import os
from aws_cdk import core

from lib.auth_code_flow_stack import ClientCredsFlowStack

app = core.App()
main_env = core.Environment(account=os.environ["CDK_DEFAULT_ACCOUNT"], region=os.environ["CDK_DEFAULT_REGION"])
client_creds_flow_stack = ClientCredsFlowStack(app, 'ClientCredentialsFlowStack', env=main_env)

app.synth()

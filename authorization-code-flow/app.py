import os
from aws_cdk import core

from lib.auth_code_flow_stack import AuthCodeFlowStack

app = core.App()
main_env = core.Environment(account=os.environ["CDK_DEFAULT_ACCOUNT"], region=os.environ["CDK_DEFAULT_REGION"])
auth_code_flow_stack = AuthCodeFlowStack(app, 'AuthCodeFlowStack', env=main_env)

app.synth()

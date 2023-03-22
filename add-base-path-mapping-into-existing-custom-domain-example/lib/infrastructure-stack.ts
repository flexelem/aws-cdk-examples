import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackProps = this.node.tryGetContext('stackProps');

    // Import existing hosted zone (registered domain)
    const hostedZone = route53.HostedZone.fromLookup(this, 'hosted-zone', { domainName: stackProps.domainName });

    // create a new certificate which will be auto approved since we own the domain
    const certificate = new acm.Certificate(this, 'main-domain-certificate', {
      domainName: stackProps.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // create an API Gateway custom domain which will be added into ARecord
    const domainName = new apigw.DomainName(this, 'domain-name', {
      domainName: stackProps.domainName,
      certificate: certificate,
      endpointType: apigw.EndpointType.REGIONAL,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
    });

    // add a new ARecord into our hosted zone DNS records to point API Gateway domain
    const aRecord = new route53.ARecord(this, 'domain-name-arecord', {
      zone: hostedZone,
      recordName: stackProps.domainName,
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(domainName)),
    });

    new cdk.CfnOutput(this, 'domain-name-alias-domain-name', {
      value: domainName.domainNameAliasDomainName,
      description: 'alias domain name of the domain name',
      exportName: 'domainNameAliasDomainName',
    });
  }
}

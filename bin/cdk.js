#!/usr/bin/env node

const CDK = require('@aws-cdk/core');
const { S3WebsiteStack } = require('../lib/S3WebsiteStack');
const { ServerlessAPIStack } = require('../lib/ServerlessAPIStack');

const app = new CDK.App();
new S3WebsiteStack(app, 'S3WebsiteStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

  appName: "example",
  domainName: "example.com"
});

new ServerlessAPIStack(app, 'ServerlessAPIStack', {});
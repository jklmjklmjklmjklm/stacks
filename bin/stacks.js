#!/usr/bin/env node

const { App }                = require('@aws-cdk/core'),
      { S3WebsiteStack }     = require('../lib/S3WebsiteStack'),
      { ServerlessAPIStack } = require('../lib/ServerlessAPIStack'),
      { MFAServiceStack }    = require('../lib/MFAServiceStack');

const app = new App();

new MFAServiceStack(app, "MFAServiceStack", {
  env: {
    account: "525155335568",
    region: "ap-southeast-1"
  },
  vpcId: "vpc-cd9522aa",
  clusterArn: "arn:aws:ecs:ap-southeast-1:525155335568:cluster/default",
  loadBalancerArn: "arn:aws:elasticloadbalancing:ap-southeast-1:525155335568:loadbalancer/app/alb/68068e2590373106"
});

new S3WebsiteStack(app, "S3WebsiteStack", {
  env: {
    account: "525155335568",
    region: "ap-southeast-1"
  },
  appName: "example",
  domainName: "example.com"
});

new ServerlessAPIStack(app, "ServerlessAPIStack", {});
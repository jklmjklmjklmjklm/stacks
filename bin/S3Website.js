// Prerequisites
// - Domain name purchased from other registrar (e.g. GoDaddy or NameCheap)
// - DNS service migrated to Route53 (Public Hosted Zone already created)

const { App }              = require('@aws-cdk/core'),
      { S3WebsiteStack }   = require('../lib/S3WebsiteStack'),
      { CertificateStack } = require('../lib/CertificateStack');

const app = new App();

new CertificateStack(app, "CertificateStack", {
  env: {
    account: "525155335568",
    region: "us-east-1"
  },
  domain: "jklm.dev"
});

new S3WebsiteStack(app, "S3WebsiteStack", {
  env: {
    account: "525155335568",
    region: "ap-southeast-1"
  },
  domain: "jklm.dev"
});
const { Stack }                              = require("@aws-cdk/core"),
      { Certificate, CertificateValidation } = require("@aws-cdk/aws-certificatemanager");

class CertificateStack extends Stack {

  // Features
  // - SEO Optimization: redirect non-www to www (option flag)
  // - redirect HTTP to HTTPS (option)
  // - OAI
  // - ACM (SSL Certificate)
  // - Route53 (Domain)
  // - Security Headers
  // - CloudFront Distribution

  constructor(scope, id, props) {
    super(scope, id, props);

    const nakedDomain   = props.domain,
          websiteDomain = `www.${nakedDomain}`;

    // Route53 Hosted Zone
    const publicHostedZone = new PublicHostedZone(this, "S3WebsitePublicHostedZone", { zoneName: nakedDomain });

    // ACM Certificate
    const wwwCertificate = new Certificate(this, "S3WebsiteWwwCertificate", {
      domainName: websiteDomain,
      validation: CertificateValidation.fromDns(publicHostedZone)
    });
    const nonWwwCertificate = new Certificate(this, "S3WebsiteNonWwwCertificate", {
      domainName: nakedDomain,
      validation: CertificateValidation.fromDns(publicHostedZone)
    });
  }
}

module.exports = { CertificateStack };

const { Stack }                                   = require("@aws-cdk/core"),
      { Bucket, RedirectProtocol }                = require("@aws-cdk/aws-s3"),
      { PublicHostedZone, ARecord, RecordTarget } = require("@aws-cdk/aws-route53"),
      { Certificate, CertificateValidation }      = require("@aws-cdk/aws-certificatemanager"),
      { Distribution }                            = require("@aws-cdk/aws-cloudfront"),
      { S3Origin }                                = require("@aws-cdk/aws-cloudfront-origins"),
      { CloudFrontTarget }                        = require("@aws-cdk/aws-route53-targets");

class S3WebsiteStack extends Stack {

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

    // S3 Buckets (www, non-www)
    const wwwBucket = new Bucket(this, "S3WebsiteWwwBucket", {
      bucketName: websiteDomain,
      publicReadAccess: true,
      websiteErrorDocument: "404.html",
      websiteIndexDocument: "index.html"
    });
    const nonWwwBucket = new Bucket(this, "S3WebsiteNonWwwBucket", {
      bucketName: nakedDomain,
      websiteRedirect: {
        hostName: `http://${websiteDomain}`,
        protocol: RedirectProtocol.HTTP
      }
    });

    // CloudFront Distributions
    const wwwDistribution = new Distribution(this, "S3WebsiteWwwDistribution", {
      defaultBehavior: { origin: new S3Origin(wwwBucket) },
      certificate: wwwCertificate,
      domainNames: [ nakedDomain ]
    });
    const nonWwwDistribution = new Distribution(this, "S3WebsiteNonWwwDistribution", {
      defaultBehavior: { origin: new S3Origin(nonWwwBucket) },
      certificate: nonWwwCertificate,
      domainNames: [ websiteDomain ]
    });

    // Route53 Records
    new ARecord(this, "S3WebsiteARecord", {
      recordName: nakedDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(nonWwwDistribution)),
      zone: publicHostedZone
    });

    new ARecord(this, "S3WebsiteCnameRecord", {
      recordName: websiteDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(wwwDistribution)),
      zone: publicHostedZone
    });
  }
}

module.exports = { S3WebsiteStack };

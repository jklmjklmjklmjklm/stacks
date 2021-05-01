const { Stack }                                   = require("@aws-cdk/core"),
      { Bucket, RedirectProtocol }                = require("@aws-cdk/aws-s3"),
      { PublicHostedZone, ARecord, RecordTarget } = require("@aws-cdk/aws-route53"),
      { Certificate, CertificateValidation }      = require("@aws-cdk/aws-certificatemanager"),
      { Distribution }                            = require("@aws-cdk/aws-cloudfront"),
      { S3Origin }                                = require("@aws-cdk/aws-cloudfront-origins"),
      { CloudFrontTarget }                        = require("@aws-cdk/aws-route53-targets");

class S3WebsiteStack extends Stack {

  // Features
  // - redirect www to non-www (option)
  // - redirect HTTP to HTTPS (option)
  // - OAI
  // - ACM (SSL Certificate)
  // - Route53 (Domain)
  // - Security Headers
  // - CloudFront Distribution

  constructor(scope, id, props) {
    super(scope, id, props);

    const appName    = props.appName,
          domainName = props.domainName;

    // Route53 Hosted Zone
    const publicHostedZone = new PublicHostedZone(this, "S3WebsitePublicHostedZone", { zoneName: domainName });

    // ACM Certificate
    const wwwCertificate = new Certificate(this, "S3WebsiteWwwCertificate", {
      domainName: `www.${domainName}`,
      validation: CertificateValidation.fromDns(publicHostedZone)
    });
    const nonWwwCertificate = new Certificate(this, "S3WebsiteNonWwwCertificate", {
      domainName,
      validation: CertificateValidation.fromDns(publicHostedZone)
    });

    // S3 Buckets (www, non-www)
    const wwwBucket = new Bucket(this, "S3WebsiteWwwBucket", {
      bucketName: `${appName}-www`,
      websiteRedirect: {
        hostName: "",
        protocol: RedirectProtocol.HTTP
      }
    });
    const nonWwwBucket = new Bucket(this, "S3WebsiteNonWwwBucket", {
      bucketName: `${appName}`,
      publicReadAccess: true,
      websiteErrorDocument: "404.html",
      websiteIndexDocument: "index.html"
    });

    // CloudFront Distributions
    const wwwDistribution = new Distribution(this, "S3WebsiteWwwDistribution", {
      defaultBehavior: { origin: new S3Origin(wwwBucket) },
      certificate: wwwCertificate,
      domainNames: [ domainName ]
    });
    const nonWwwDistribution = new Distribution(this, "S3WebsiteNonWwwDistribution", {
      defaultBehavior: { origin: new S3Origin(nonWwwBucket) },
      certificate: nonWwwCertificate,
      domainNames: [ `www.${domainName}` ]
    });

    // Route53 Records
    new ARecord(this, "S3WebsiteARecord", {
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(nonWwwDistribution)),
      zone: publicHostedZone
    });

    new ARecord(this, "S3WebsiteCnameRecord", {
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(wwwDistribution)),
      zone: publicHostedZone
    });
  }
}

module.exports = { S3WebsiteStack };

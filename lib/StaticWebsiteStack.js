const CDK = require('@aws-cdk/core');

class StaticWebsiteStack extends CDK.Stack {
  /**
   *
   * @param {CDK.Construct} scope
   * @param {string} id
   * @param {CDK.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
  }
}

module.exports = { StaticWebsiteStack }
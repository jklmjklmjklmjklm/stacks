const { Stack } = require("@aws-cdk/core"),
      { Cluster } = require("@aws-cdk/aws-ecs");

class ECSClusterStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
  }
}

module.exports = { ECSClusterStack };

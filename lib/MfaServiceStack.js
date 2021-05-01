const { Stack } = require("@aws-cdk/core"),
      { Cluster, Ec2Service, TaskDefinition } = require("@aws-cdk/aws-ecs");

class MFAServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const cluster = Cluster.fromClusterAttributes(this, "cluster", {
      clusterArn: ""
    });
    const taskDefinition = TaskDefinition.fromTaskDefinitionArn(this, "taskDefinition", "");

    const ec2Service = new Ec2Service(this, "ec2Service", {
      cluster,
      taskDefinition,
      desiredCount: 1
    });
  }
}

module.exports = { MFAServiceStack };

const { Stack, Duration } = require("@aws-cdk/core"),
      { ApplicationLoadBalancer } = require("@aws-cdk/aws-elasticloadbalancingv2"),
      { Cluster, Ec2Service, TaskDefinition, DeploymentControllerType, PlacementStrategy } = require("@aws-cdk/aws-ecs");

class MFAServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const cluster = Cluster.fromClusterAttributes(this, "cluster", {
      clusterArn: ""
    });
    const taskDefinition = TaskDefinition.fromTaskDefinitionArn(this, "taskDefinition", "");

    const ec2Service = new Ec2Service(this, "ec2Service", {
      serviceName: "mfa-service",
      cluster,
      taskDefinition,
      deploymentController: DeploymentControllerType.ECS,
      desiredCount: 1,
      healthCheckGracePeriod: Duration.seconds(600),
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      placementStrategies: PlacementStrategy.packedByMemory()
    });

    const alb = ApplicationLoadBalancer.fromLookup(this, "loadBalancer", {
      loadBalancerArn: ""
    });
  }
}

module.exports = { MFAServiceStack };

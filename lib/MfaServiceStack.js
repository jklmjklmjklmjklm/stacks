const { Stack, Duration }                                                                                     = require("@aws-cdk/core"),
      { Vpc }                                                                                                 = require("@aws-cdk/aws-ec2"),
      { ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, TargetType, Protocol }          = require("@aws-cdk/aws-elasticloadbalancingv2"),
      { Cluster, Ec2Service, Ec2TaskDefinition, DeploymentControllerType, PlacementStrategy, ContainerImage } = require("@aws-cdk/aws-ecs");

class MFAServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const vpcId             = props.vpcId,
          clusterArn        = props.clusterArn,
          loadBalancerArn   = props.loadBalancerArn;

    // Get ECS Cluster by ARN
    const cluster = Cluster.fromClusterAttributes(this, "cluster", { clusterArn });

    // Create ECS Task Definition
    const taskDefinition = new Ec2TaskDefinition(this, "taskDefinition", {
      family: "mfa-service"
    });

    // Add container to task definition
    taskDefinition.addContainer("mfa-service", {
      image: ContainerImage.fromRegistry("nginx:latest"),
      cpu: 256,
      memoryReservationMiB: 256,
      essential: true,
      portMappings: [
        {
          containerPort: 80
        }
      ]
    });

    // Create ECS Service with EC2 launch type
    const ec2Service = new Ec2Service(this, "ec2Service", {
      serviceName: "mfa-service",
      cluster,
      taskDefinition,
      deploymentController: { type: DeploymentControllerType.ECS },
      desiredCount: 1,
      healthCheckGracePeriod: Duration.seconds(600),
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      placementStrategies: [ PlacementStrategy.packedByMemory() ]
    });

    // Create Target Group with health check
    const targetGroup = new ApplicationTargetGroup(this, "targetGroup", {
      vpc: Vpc.fromLookup(this, "vpc", { vpcId }),
      deregistrationDelay: Duration.seconds(300),
      healthCheck: {
        enabled: true,
        healthyHttpCodes: "200",
        healthyThresholdCount: 2,
        interval: Duration.seconds(60),
        path: "/actuator/health-check",
        port: "traffic-port",
        protocol: Protocol.HTTP,
        timeout: Duration.seconds(30),
        unhealthyThresholdCount: 2
      },
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targetGroupName: "mfa-service-tg",
      targetType: TargetType.INSTANCE,
      targets: [
        ec2Service.loadBalancerTarget({
          containerName: "mfa-service",
          containerPort: 80
        })
      ]
    });

    // Get Load Balancer by ARN then add listener
    const alb = ApplicationLoadBalancer.fromLookup(this, "loadBalancer", { loadBalancerArn });
    alb.addListener("listener", {
      port: 8000,
      protocol: ApplicationProtocol.HTTP,
      defaultTargetGroups: [ targetGroup ]
    });
  }
}

module.exports = { MFAServiceStack };

import {
  aws_ec2,
  aws_ecs,
  aws_elasticloadbalancingv2,
  aws_logs, aws_route53, aws_route53_targets,
  Duration,
  Stack
} from "aws-cdk-lib";
import {existingResources, Resources} from "../existingResources";
import {Envs} from "../common";
import {Cluster, PropagatedTagSource} from "aws-cdk-lib/aws-ecs";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {ApplicationTargetGroup} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {PrivateHostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";

type Parameters = {
  envIdentifier: Envs,
  imageTag: string,
  taskCount: number,
  cluster: Cluster,
  vpc: IVpc,
  newtonApiProxyRepository: Repository,
  privateHostedZone: PrivateHostedZone
};

const SERVICE_NAME = "newton-api-proxy";

export const createNewtonApiProxy = (stack: Stack, param: Parameters) => {
  const existingResource: Resources = existingResources.envs[param.envIdentifier];

  // platform-pri-1(2)-sub
  const subnets = existingResource.priSubnetIds.map(subnetId =>
    aws_ec2.Subnet.fromSubnetId(stack, subnetId, subnetId));

  const taskDef = new aws_ecs.FargateTaskDefinition(stack, "NewtonApiProxyTaskDef", {
    cpu: 512,
    memoryLimitMiB: 1024,
  });

  const logGroup = new aws_logs.LogGroup(stack, "NewtonApiProxyLogGroup", {
    logGroupName: SERVICE_NAME,
    retention: aws_logs.RetentionDays.SIX_MONTHS,
  });
  taskDef.addContainer("NewtonApiProxyContainer", {
    image: aws_ecs.ContainerImage.fromEcrRepository(param.newtonApiProxyRepository, param.imageTag),
    logging: new aws_ecs.AwsLogDriver({
      logGroup,
      streamPrefix: SERVICE_NAME,
    }),
    portMappings: [{containerPort: 80}],
    essential: true,
    containerName: SERVICE_NAME,
    environment: {
      PROXY_PASS: existingResource.newtonApiFqdn,
      SERVER_NAME: `api.${param.privateHostedZone.zoneName}`,
    }
  });

  const sg = createSg(stack, param.vpc.vpcId, existingResource);

  const service = new aws_ecs.FargateService(stack, "NewtonApiProxyService", {
    circuitBreaker: {rollback: true},
    maxHealthyPercent: 200,
    minHealthyPercent: 100,
    propagateTags: PropagatedTagSource.SERVICE,
    cluster: param.cluster,
    assignPublicIp: false,
    vpcSubnets: {subnets},
    platformVersion: aws_ecs.FargatePlatformVersion.VERSION1_4,
    taskDefinition: taskDef,
    desiredCount: param.taskCount,
    serviceName: SERVICE_NAME,
    securityGroups: [sg]
  });

  const alb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(stack, "NewtonApiProxyAlb", {
    internetFacing: false,
    loadBalancerName: SERVICE_NAME,
    vpc: param.vpc,
    vpcSubnets: {subnets},
    securityGroup: sg
  });

  const target = new ApplicationTargetGroup(stack, "NewtonApiProxyTarget", {
    port: 80,
    vpc: param.vpc,
    protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    targets: [service.loadBalancerTarget({
      containerPort: 80,
      containerName: SERVICE_NAME,
    })],
    healthCheck: {
      enabled: true,
      path: "/health",
      interval: Duration.seconds(5),
      port: "80",
      timeout: Duration.seconds(3),
      healthyThresholdCount: 3,
      unhealthyThresholdCount: 3,
    }
  });
  alb.addListener("NginxHttpListener", {
    port: 80,
    defaultTargetGroups: [target]
  });

  new aws_route53.ARecord(stack, "NewtonApiLocalName", {
    zone: param.privateHostedZone,
    recordName: `api.${param.privateHostedZone.zoneName}`,
    target: RecordTarget.fromAlias(new aws_route53_targets.LoadBalancerTarget(alb)),
  });
};

// 一度L1で作ってからmutable:falseで作り直さないと勝手にルールが追加されてしまう
const createSg = (stack: Stack, vpcId: string, existingResource: Resources) => {
  const _sg = new aws_ec2.CfnSecurityGroup(stack, "_NewtonApiProxySg", {
    vpcId,
    groupName: SERVICE_NAME,
    groupDescription: SERVICE_NAME,
    securityGroupIngress: [
      {
        ipProtocol: "tcp",
        fromPort: 443,
        toPort: 443,
        sourcePrefixListId: existingResource.prefixList.plInternalSystemMep.id,
        description: existingResource.prefixList.plInternalSystemMep.name
      },
      {
        ipProtocol: "tcp",
        fromPort: 80,
        toPort: 80,
        sourcePrefixListId: existingResource.prefixList.plInternalSystemMep.id,
        description: existingResource.prefixList.plInternalSystemMep.name
      }
    ],
    securityGroupEgress: [
      {
        ipProtocol: "tcp",
        fromPort: 0,
        toPort: 65535,
        destinationPrefixListId: existingResource.prefixList.plExternalAll.id,
        description: existingResource.prefixList.plExternalAll.name
      }
    ]
  });
  return aws_ec2.SecurityGroup.fromSecurityGroupId(stack, "NewtonApiProxySg", _sg.ref, {mutable: false});
}
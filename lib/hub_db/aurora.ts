import * as cdk from "aws-cdk-lib";
import {aws_ec2, aws_rds, aws_route53, Duration, RemovalPolicy, SecretValue, Stack} from "aws-cdk-lib";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Envs} from "../common";
import {DatabaseCluster, DatabaseClusterEngine} from "aws-cdk-lib/aws-rds";
import {InstanceType} from "aws-cdk-lib/aws-ec2";
import {existingResources, Resources} from "../existingResources";

type Parameters = {
  envIdentifier: Envs,
  namePrefix: string,
  adminPasswordSsmPath: string,
  readerCount: 0 | 1, // writer + readerの2台体制か、 writerのみ
  instanceType: InstanceType,
};

export const createNewtonHubDb = (newtonHubDbStack:Stack, param: Parameters) => {
  const existingResource: Resources = existingResources.envs[param.envIdentifier];

  const db = makeDb(newtonHubDbStack, param, existingResource);
  addCaCertificate(db);
  allowFromVpcCidr(existingResource, db);
  addCName(newtonHubDbStack, existingResource, param, db);
};

// L2 constructorにpropertyが存在しないのでこういう書き方
const addCaCertificate = (dbCluster: DatabaseCluster) => dbCluster.node.children.forEach((children) => {
    if (children.node.defaultChild instanceof aws_rds.CfnDBInstance) {
      (
        children.node.defaultChild as aws_rds.CfnDBInstance
      ).addPropertyOverride("CACertificateIdentifier", "rds-ca-rsa4096-g1");
    }
  });

const addCName = (newtonHubDbStack: Stack, existingResource: Resources, param: Parameters, db: DatabaseCluster) => {
  const namePrefix = `${param.namePrefix}-newton-hub`;
  const zone = aws_route53.HostedZone.fromHostedZoneAttributes(
    newtonHubDbStack, existingResource.privateHostedZoneId, {
      hostedZoneId: existingResource.privateHostedZoneId,
      zoneName: `${param.envIdentifier}.local`
    });

  new aws_route53.CnameRecord(newtonHubDbStack, `${namePrefix}-cname`, {
    recordName: `${namePrefix}.${zone.zoneName}`,
    zone,
    domainName: db.clusterEndpoint.hostname,
    ttl: Duration.seconds(60),
  });

  new aws_route53.CnameRecord(newtonHubDbStack, `${namePrefix}-reader-cname`, {
    recordName: `read.${namePrefix}.${zone.zoneName}`,
    zone,
    domainName: db.clusterReadEndpoint.hostname,
    ttl: Duration.seconds(60),
  });
};

const allowFromVpcCidr = (existingResource: Resources, db: DatabaseCluster) => {
  db.connections.allowFrom(
    aws_ec2.Peer.prefixList(existingResource.prefixList.plInternalSystemMep.id),
    aws_ec2.Port.tcp(3306),
    existingResource.prefixList.plInternalSystemMep.name
  );
};

const makeDb = (newtonHubDbStack: Stack, param: Parameters, existingResource: Resources) => {
  const clusterIdentifier = `${param.envIdentifier}-${param.namePrefix}-newton-hub`;

  // platform-infra
  const vpc = aws_ec2.Vpc.fromVpcAttributes(newtonHubDbStack, existingResource.vpcId, {
    vpcId: existingResource.vpcId,
    availabilityZones: [existingResource.region],
  });

  // platform-iso-1(2)-sub
  const subnets = existingResource.dbSubnetIds.map(subnetId =>
    aws_ec2.Subnet.fromSubnetId(newtonHubDbStack, subnetId, subnetId));

  return new aws_rds.DatabaseCluster(newtonHubDbStack, clusterIdentifier, {
    clusterIdentifier,
    engine: DatabaseClusterEngine.auroraMysql({
      version: aws_rds.AuroraMysqlEngineVersion.VER_2_11_3
    }),
    writer: aws_rds.ClusterInstance.provisioned("writer", {instanceType: param.instanceType}),
    readers: param.readerCount === 1 ?
      [aws_rds.ClusterInstance.provisioned("reader", {instanceType: param.instanceType})] : [],
    vpc,
    vpcSubnets: {
      subnets
    },

    backup: {
      retention: Duration.days(2),
      preferredWindow: "14:00-15:00"
    },
    cloudwatchLogsExports: ["error", "general", "slowquery", "audit"],
    cloudwatchLogsRetention: RetentionDays.SIX_MONTHS,
    copyTagsToSnapshot: true,
    credentials: aws_rds.Credentials.fromPassword("admin", SecretValue.ssmSecure(param.adminPasswordSsmPath)), // Use password from SSM
    deletionProtection: true,
    monitoringInterval: cdk.Duration.seconds(60),
    parameters: {
      character_set_client: "utf8mb4",
      character_set_connection: "utf8mb4",
      character_set_results: "utf8mb4",
      character_set_database: "utf8mb4",
      character_set_server: "utf8mb4",
    },
    removalPolicy: RemovalPolicy.DESTROY,
    storageEncrypted: true,
  });
};
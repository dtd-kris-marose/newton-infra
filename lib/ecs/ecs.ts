import {aws_ecs, Stack} from "aws-cdk-lib";
import {Envs, restoreExistingVpc} from "../common";
import {existingResources} from "../existingResources";
import {createNewtonApiProxy} from "./newtonApiProxy";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {PrivateHostedZone} from "aws-cdk-lib/aws-route53";

type Parameters = {
  envIdentifier: Envs,
  newtonApiProxyRepository: Repository,
  hostedZone: PrivateHostedZone,
};

export const createServices = (newtonEcsStack: Stack, param: Parameters) => {
  const vpc = restoreExistingVpc(newtonEcsStack, existingResources.envs[param.envIdentifier].platformVpcId);

  // 共通cluster
  const cluster = new aws_ecs.Cluster(newtonEcsStack, "DefaultCluster", {
    vpc,
    clusterName: `default`,
    containerInsights: true,
  });

  // newton-api-proxy
  const PROXY_IMAGE_TAG = "1.0.1";
  const taskCount = param.envIdentifier === "prd" ? 2 : 1;

  createNewtonApiProxy(newtonEcsStack, {
    envIdentifier: param.envIdentifier,
    imageTag: PROXY_IMAGE_TAG,
    taskCount,
    cluster,
    vpc,
    newtonApiProxyRepository: param.newtonApiProxyRepository,
    privateHostedZone: param.hostedZone,
  });
}
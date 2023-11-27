import {Stack} from "aws-cdk-lib";
import {Envs} from "../common";
import {createNewtonApiProxy} from "./newtonApiProxy";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {IPrivateHostedZone} from "aws-cdk-lib/aws-route53";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import {Cluster} from "aws-cdk-lib/aws-ecs";

type Parameters = {
  envIdentifier: Envs,
  newtonApiProxyRepository: Repository,
  hostedZone: IPrivateHostedZone,
  cluster: Cluster,
  vpc: IVpc
};

export const createServices = (newtonEcsStack: Stack, param: Parameters) => {
  // newton-api-proxy
  const PROXY_IMAGE_TAG = "1.0.1";
  const taskCount = param.envIdentifier === "prd" ? 2 : 1;

  createNewtonApiProxy(newtonEcsStack, {
    envIdentifier: param.envIdentifier,
    imageTag: PROXY_IMAGE_TAG,
    taskCount,
    cluster: param.cluster,
    vpc: param.vpc,
    newtonApiProxyRepository: param.newtonApiProxyRepository,
    privateHostedZone: param.hostedZone,
  });
}
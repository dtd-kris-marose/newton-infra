import {aws_ecs, Stack} from "aws-cdk-lib";
import {createRepositories} from "./ecr/ecr";
import {Envs, restoreExistingVpc} from "../common";
import {existingResources} from "../existingResources";

// 共通リソースがあったらここで定義する
export const createBase = (stack: Stack, envIdentifier: Envs) => {
  const {newtonApiProxyRepository} = createRepositories(stack);
  const vpc = restoreExistingVpc(stack, existingResources.envs[envIdentifier].platformVpcId);

  // 共通cluster
  const cluster = new aws_ecs.Cluster(stack, "DefaultCluster", {
    vpc,
    clusterName: `default`,
    containerInsights: true,
  });

  return {newtonApiProxyRepository, cluster, vpc};
}
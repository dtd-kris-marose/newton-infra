import {aws_ecs, Stack} from "aws-cdk-lib";
import {createRepositories} from "./ecr/ecr";
import {IVpc} from "aws-cdk-lib/aws-ec2";

// 共通リソースがあったらここで定義する
export const createBase = (stack: Stack, vpc: IVpc) => {
  const {newtonApiProxyRepository} = createRepositories(stack);

  // 共通cluster
  const cluster = new aws_ecs.Cluster(stack, "DefaultCluster", {
    vpc,
    clusterName: `default`,
    containerInsights: true,
  });

  return {newtonApiProxyRepository, cluster, vpc};
}
import {Stack} from "aws-cdk-lib";
import {Envs, restoreExistingVpc} from "../common";
import {existingResources} from "../existingResources";
import {createPrivateHostedZone} from "./route53/privateHostedZone";
import {createRepositories} from "./ecr/ecr";

type Parameters = {
  envIdentifier: Envs,
};

export const createBase = (stack: Stack, param: Parameters) => {
  const vpc = restoreExistingVpc(stack, existingResources.envs[param.envIdentifier].platformVpcId);
  const hostedZone = createPrivateHostedZone(stack, {envIdentifier: param.envIdentifier, vpc});
  const {newtonApiProxyRepository} = createRepositories(stack);
  return {hostedZone, newtonApiProxyRepository};
}
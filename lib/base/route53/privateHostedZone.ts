import {aws_route53, Stack} from "aws-cdk-lib";
import {Envs, restoreExistingVpc} from "../../common";
import {existingResources} from "../../existingResources";
import {IVpc} from "aws-cdk-lib/aws-ec2";

type Parameters = {
  envIdentifier: Envs,
  vpc: IVpc
};
export const createPrivateHostedZone = (newtonPrivateZoneStack: Stack, param: Parameters) => {
  const additionalVpc = restoreExistingVpc(newtonPrivateZoneStack, existingResources.envs[param.envIdentifier].mepVpcId)
  const zone = new aws_route53.PrivateHostedZone(newtonPrivateZoneStack, "newtonPrivateHostedZone", {
    vpc: param.vpc,
    zoneName: "newton.local",
    comment: "zone for... newton-internal-api and hub-db."
  });
  zone.addVpc(additionalVpc);
  return zone;
}
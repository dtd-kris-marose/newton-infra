import {aws_ec2, Tags} from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import {PrivateHostedZone} from "aws-cdk-lib/aws-route53";
import {existingResources} from "./existingResources";

export type Envs = "dev" | "stg" | "prd";
export const isValidEnv = (env: string) => env === "dev" || env === "stg" || env === "prd";

export const InstanceType = {
  t4gMedium: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.T4G, aws_ec2.InstanceSize.MEDIUM),
  t4gLarge: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.T4G, aws_ec2.InstanceSize.LARGE),
  r6gLarge: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.R6G, aws_ec2.InstanceSize.LARGE),
  r6gXLarge: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.R6G, aws_ec2.InstanceSize.XLARGE),
}

export const createStack = (app: cdk.App, id: string, envIdentifier: Envs) => {
  const stack = new cdk.Stack(app, id, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION
    }
  });
  // mep用のタグ付け、個別につけたい場合は各リソースで
  Tags.of(stack).add("System", "mep");
  Tags.of(stack).add("Subsystem", "-");
  Tags.of(stack).add("Company", "misumi");
  Tags.of(stack).add("Global", "jp");
  Tags.of(stack).add("Env", envIdentifier);
  Tags.of(stack).add("CostCenter", "2467");
  Tags.of(stack).add("EnvNumber", "01");
  return stack;
};

export const restoreExistingVpc = (stack: cdk.Stack, vpcId: string) =>
  aws_ec2.Vpc.fromVpcAttributes(stack, vpcId, {
    vpcId: vpcId,
    availabilityZones: [stack.region],
  });

export const restoreExistingPrivateZone = (stack: cdk.Stack, envIdentifier: Envs) =>
  PrivateHostedZone.fromHostedZoneAttributes(
    stack,
    existingResources.envs[envIdentifier].privateHostedZoneId,
    {
      hostedZoneId: existingResources.envs[envIdentifier].privateHostedZoneId,
      zoneName: `${envIdentifier}.local`
    }
  );
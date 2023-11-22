import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {createNewtonHubDb} from "../lib/hub_db/aurora";
import {
  createStack,
  Envs,
  InstanceType,
  isValidEnv,
  restoreExistingPrivateZone,
  restoreExistingVpc
} from "../lib/common";
import {createBase} from "../lib/base/base";
import {existingResources} from "../lib/existingResources";
import {createNewtonApiProxy} from "../lib/ecs/newtonApiProxy";

const app = new cdk.App();

const envIdentifier: Envs = process.env.ENV as Envs;
if (!isValidEnv(envIdentifier)) {
  throw new Error("export ENV, before exec cdk. ENV...[dev or stg or prd]");
}

///////////////////////// ベースリソース /////////////////////////
const mepNewtonBaseStack = createStack(app, "MepNewtonBaseResourceStack", envIdentifier);
const vpc = restoreExistingVpc(mepNewtonBaseStack, existingResources.envs[envIdentifier].platformVpcId);
const {newtonApiProxyRepository, cluster} = createBase(mepNewtonBaseStack, vpc);
const hostedZone = restoreExistingPrivateZone(mepNewtonBaseStack, envIdentifier);

/////////////////////////   hub db   /////////////////////////
const instanceType = envIdentifier === "prd" ? InstanceType.r6gLarge : InstanceType.t4gMedium;
const readerCount = envIdentifier === "prd" ? 1 : 0;
const mepNewtonHubDbStack = createStack(app, "MepNewtonHubDbStack", envIdentifier);
createNewtonHubDb(mepNewtonHubDbStack, {
  adminPasswordSsmPath: "/mep/newtonHub/admin/DB_PASSWORD",
  namePrefix: "mep",
  envIdentifier,
  instanceType,
  readerCount,
  hostedZone: hostedZone,
});

///////////////////////// newton用proxy /////////////////////////
const newtonEcsStack = createStack(app, "MepNewtonEcsStack", envIdentifier);
const PROXY_IMAGE_TAG = "1.0.1";
const taskCount = envIdentifier === "prd" ? 2 : 1;
createNewtonApiProxy(newtonEcsStack, {
  envIdentifier,
  imageTag: PROXY_IMAGE_TAG,
  taskCount,
  cluster,
  vpc,
  newtonApiProxyRepository,
  privateHostedZone: hostedZone,
});
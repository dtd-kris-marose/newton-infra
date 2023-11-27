import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {createNewtonHubDb} from "../lib/hub_db/aurora";
import {createStack, Envs, InstanceType, isValidEnv, restoreExistingPrivateZone} from "../lib/common";
import {createServices} from "../lib/ecs/ecs";
import {createBase} from "../lib/base/base";

const app = new cdk.App();

const envIdentifier: Envs = process.env.ENV as Envs;
if (!isValidEnv(envIdentifier)) {
  throw new Error("export ENV, before exec cdk. ENV...[dev or stg or prd]");
}

///////////////////////// ベースリソース /////////////////////////
const mepNewtonBaseStack = createStack(app, "MepNewtonBaseResourceStack", envIdentifier);
const {newtonApiProxyRepository, cluster, vpc} = createBase(mepNewtonBaseStack, envIdentifier);
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
createServices(newtonEcsStack, {envIdentifier, newtonApiProxyRepository, hostedZone: hostedZone, cluster, vpc});

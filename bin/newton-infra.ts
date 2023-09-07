import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {createNewtonHubDb} from "../lib/hub_db/aurora";
import {createStack, Envs, InstanceType, isValidEnv} from "../lib/common";

const app = new cdk.App();

const envIdentifier: Envs = process.env.ENV as Envs;
if (!isValidEnv(envIdentifier)) {
  throw new Error("export ENV, before exec cdk. ENV...[dev or stg or prd]");
}

// 本番はlarge, それ以外はmediumにしとく
// arm系でコスト削減
const instanceType = envIdentifier === "prd" ? InstanceType.r6gLarge : InstanceType.t4gMedium;
// 本番writerは1台 + reader1台、それ以外はwriterのみ
const readerCount = envIdentifier === "prd" ? 1 : 0;

const mepNewtonHubDbStack = createStack(app, "MepNewtonHubDbStack", envIdentifier);
createNewtonHubDb(mepNewtonHubDbStack, {
  adminPasswordSsmPath: "/mep/newtonHub/admin/DB_PASSWORD",
  namePrefix: "mep",
  envIdentifier,
  instanceType,
  readerCount
});

const mepOpNewtonHubDbStack = createStack(app, "MepOpNewtonHubDbStack", envIdentifier);
createNewtonHubDb(mepOpNewtonHubDbStack, {
  adminPasswordSsmPath: "/mepop/newtonHub/admin/DB_PASSWORD",
  namePrefix: "mepop",
  envIdentifier,
  instanceType,
  readerCount
});
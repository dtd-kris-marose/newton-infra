import {aws_ecr, Stack} from "aws-cdk-lib";

export const createRepositories = (ecrStack: Stack) => {
  const newtonApiProxy = new aws_ecr.Repository(ecrStack, "NewtonEcrStack", {
    repositoryName: "newton-api-proxy",
    encryption: aws_ecr.RepositoryEncryption.KMS,
    imageScanOnPush: true,
    lifecycleRules: [{maxImageCount: 5}]
  });

  return {
    newtonApiProxyRepository: newtonApiProxy
  };
}
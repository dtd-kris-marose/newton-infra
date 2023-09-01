import {Envs} from "./common";

export const existingResources: { envs: { [key in Envs]: Resources } } = {
  envs: {
    dev: {
      region: "ap-northeast-1",
      vpcId: "vpc-060eb156b22e12560", // platform-vpc
      subnetIds: ["subnet-0a870d7d179aea7b9", "subnet-0236322b7458f793b"], // platform-iso-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-0b7757addb8aa7b9d", name: "pl-internal-system-meviy_rnd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z09713201XQXNNIBYQV54"
    },
    stg: {
      region: "ap-northeast-1",
      vpcId: "vpc-05f8fadaf82495594", // platform-vpc
      subnetIds: ["subnet-07bae736b2aa43c70", "subnet-0738fbcf04dea792e"], // platform-iso-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-04fd1d3e11846b7d4", name: "pl-internal-system-mep_stg"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z10427463GW5VWU8CO0CI"
    },
    prd: {
      region: "ap-northeast-1",
      vpcId: "vpc-0a51c73b58c8cf49d", // platform-vpc
      subnetIds: ["subnet-02d4373026647b626", "subnet-0af637c418c942852"], // platform-iso-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-0ba836fa4e7fcba73", name: "pl-internal-system-mep_prd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z09515511BGE22M6K0OU0"
    }
  }
};

export type Resources = {
  region: string,
  vpcId: string,
  subnetIds: Array<string>,
  prefixList: {
    [key in string]: { id: string, name: string }
  },
  privateHostedZoneId: string,
};
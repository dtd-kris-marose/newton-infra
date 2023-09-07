import {Envs} from "./common";

export const existingResources: { envs: { [key in Envs]: Resources } } = {
  envs: {
    dev: {
      region: "ap-northeast-1",
      // 既存vpc関連はplatform-infra/additional_cloudformation/platform-vpc.ymlで作成されている
      vpcId: "vpc-060eb156b22e12560", // platform-vpc
      dbSubnetIds: ["subnet-0a870d7d179aea7b9", "subnet-0236322b7458f793b"], // platform-iso-1(2)-sub
      priSubnetIds: ["subnet-01bb76c61a756739e", "subnet-05bff167a81585505"],
      prefixList: {
        plInternalSystemMep: {id: "pl-0b7757addb8aa7b9d", name: "pl-internal-system-meviy_rnd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z09713201XQXNNIBYQV54",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      }
    },
    stg: {
      region: "ap-northeast-1",
      vpcId: "vpc-05f8fadaf82495594", // platform-vpc
      dbSubnetIds: ["subnet-07bae736b2aa43c70", "subnet-0738fbcf04dea792e"], // platform-iso-1(2)-sub
      priSubnetIds: [""], // platform-dx-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-04fd1d3e11846b7d4", name: "pl-internal-system-mep_stg"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z10427463GW5VWU8CO0CI",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      }
    },
    prd: {
      region: "ap-northeast-1",
      vpcId: "vpc-0a51c73b58c8cf49d", // platform-vpc
      dbSubnetIds: ["subnet-02d4373026647b626", "subnet-0af637c418c942852"], // platform-iso-1(2)-sub
      priSubnetIds: [""], // platform-dx-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-0ba836fa4e7fcba73", name: "pl-internal-system-mep_prd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"}
      },
      privateHostedZoneId: "Z09515511BGE22M6K0OU0",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      }
    }
  }
};

export type Resources = {
  region: string,
  vpcId: string,
  dbSubnetIds: Array<string>,
  priSubnetIds: Array<string>,
  prefixList: {
    [key in string]: { id: string, name: string }
  },
  privateHostedZoneId: string,
  transitGatewayIds: {
    sys: string,
    dx: string
  }
};
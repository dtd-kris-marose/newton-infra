import {Envs} from "./common";

export const existingResources: { envs: { [key in Envs]: Resources } } = {
  envs: {
    dev: {
      // 既存vpcの実態はplatform-infra/additional_cloudformation/platform-vpc.ymlで作成されている
      platformVpcId: "vpc-060eb156b22e12560",
      mepVpcId: "vpc-0a7c81573cbdec102",
      dbSubnetIds: ["subnet-0a870d7d179aea7b9", "subnet-0236322b7458f793b"], // platform-iso-1(2)-sub
      priSubnetIds: ["subnet-01bb76c61a756739e", "subnet-05bff167a81585505"], // platform-pri-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-0b7757addb8aa7b9d", name: "pl-internal-system-meviy_rnd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", name: "pl-external-all"},
        plInternalSystemNewtonAn1: {id: "pl-020420d1e27a28512", name: "pl-internal-system-newton_an1_stg"}
      },
      privateHostedZoneId: "Z09713201XQXNNIBYQV54",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      },
      newtonApiFqdn: "stg02-api-newton-jp.internal.misumi-ec.com"
    },
    stg: {
      platformVpcId: "vpc-05f8fadaf82495594",
      mepVpcId: "vpc-0655d312725f8bd26",
      dbSubnetIds: ["subnet-07bae736b2aa43c70", "subnet-0738fbcf04dea792e"], // platform-iso-1(2)-sub
      priSubnetIds: ["subnet-068b5edf450171f8e", "subnet-02e1f1a394d0cf36b"], // platform-pri-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-04fd1d3e11846b7d4", name: "pl-internal-system-mep_stg"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"},
        plInternalSystemNewtonAn1: {id: "pl-020420d1e27a28512", name: "pl-internal-system-newton_an1_stg"}
      },
      privateHostedZoneId: "Z10427463GW5VWU8CO0CI",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      },
      newtonApiFqdn: "stg02-api-newton-jp.internal.misumi-ec.com"
    },
    prd: {
      platformVpcId: "vpc-0a51c73b58c8cf49d",
      mepVpcId: "vpc-0da380a25f48f711f",
      dbSubnetIds: ["subnet-02d4373026647b626", "subnet-0af637c418c942852"], // platform-iso-1(2)-sub
      priSubnetIds: ["subnet-0312726e88b9c705f", "subnet-0ca778d6586be9aa4"], // platform-pri-1(2)-sub
      prefixList: {
        plInternalSystemMep: {id: "pl-0ba836fa4e7fcba73", name: "pl-internal-system-mep_prd"},
        plExternalAll: {id: "pl-016abd63c5573ec42", "name": "pl-external-all"},
        plInternalSystemNewtonAn1: {id: "pl-0df0da8dd0481aa88", name: "pl-internal-system-newton_an1_prd"}
      },
      privateHostedZoneId: "Z09515511BGE22M6K0OU0",
      transitGatewayIds: {
        sys: "tgw-0e114e9cc1a7bcd3a",
        dx: "tgw-0b5484e54a8af8332"
      },
      newtonApiFqdn: "api-newton-jp.internal.misumi-ec.com" // TODO?これで良いか本番リリース前に確認
    }
  }
};

export type Resources = {
  platformVpcId: string,
  mepVpcId: string,
  dbSubnetIds: Array<string>,
  priSubnetIds: Array<string>,
  prefixList: {
    [key in string]: { id: string, name: string }
  },
  privateHostedZoneId: string,
  transitGatewayIds: {
    sys: string,
    dx: string
  },
  newtonApiFqdn: string
};
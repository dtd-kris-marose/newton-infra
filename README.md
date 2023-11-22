## newton用インフラ
- 既存コードがpythonで入り組んでいるためnewton用HUB DB構築時に分離

## 実行
```shell
# 事前準備
# - aws cliが使えるようにしておく
# - cdkをインストールする
# - mepの3環境でssoできるようにしておく

# 環境変数のexport
export ENV={dev|stg|prd}

# ログイン(mep-dev, mep-stg, mep-prdでaws profile作っている前提)
aws sso login --profile mep-${ENV}

# diff確認
cdk diff --profile mep-${ENV}

# 実行
cdk deploy --profile mep-${ENV} --require-approval never
```

## ディレクトリ構成
- 基本的にlib内にdirを切って定義する

```text
├── README.md
├── bin
│   └── newtonInfra.ts # cdkのentrypoint
├── cdk.json
├── docker
│   └── proxy
│       ├── Dockerfile
│       ├── build_and_push.sh
│       └── default.conf.template
├── jest.config.js
├── lib
│   ├── base
│   │   ├── base.ts # 共通リソース作成関数
│   │   └── ecr
│   │       └── ecr.ts
│   ├── common.ts # 共通定数や便利関数とか
│   ├── ecs
│   │   ├── ecs.ts
│   │   └── newtonApiProxy.ts
│   ├── existingResources.ts # 既存リソースのarnとかをベタ書きするところ
│   └── hub_db
│       └── aurora.ts
├── package.json
├── test
│   └── newton-infra.test.ts
└── tsconfig.json
```

## 手で作成したリソース
- TransitGatewayへのRoute追加。これはCDKが未対応のため、手動で作成。
  - platform-pri-1(2)-subのルートテーブルで、pl-02f50133943bce44b(misumi-common-route)宛をtgw-0b5484e54a8af8332へ
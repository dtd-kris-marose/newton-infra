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
基本的にlib内にdirを切って定義する

├── README.md
├── bin
│   └── newton-infra.ts
├── cdk.json
├── jest.config.js
├── lib
│   ├── existingResources.ts # 既存リソースのarnやidを書く場所
│   ├── common.ts            # 定数や便利関数置き場
│   └── hub_db
│       └── aurora.ts        # NEWTON HUB DBの定義
├── package-lock.json
├── package.json
├── test
│   └── newton-infra.test.ts
└── tsconfig.json

## 手で作成したリソース
- TransitGatewayへのRoute追加。これはCDKが未対応のため、手動で作成。
  - platform-pri-1(2)-subのルートテーブルで、pl-02f50133943bce44b(misumi-common-route)宛をtgw-0b5484e54a8af8332へ
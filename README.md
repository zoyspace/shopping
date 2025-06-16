# Supabase + Stripe ショッピングサイト

最新技術スタック（Next.js App Router、Supabase、Stripe、Tailwind CSS v4、shadcn/ui）を使用したモダンなEコマースプラットフォーム

## 🚀 主な機能

- **認証システム**: Supabase Auth による安全なユーザー認証
- **商品管理**: 商品の閲覧、検索、フィルタリング
- **カート機能**: リアルタイムカート管理
- **決済処理**: Stripe Elements による安全な決済
- **注文管理**: 注文履歴の確認と管理
- **画像管理**: Supabase Storage による画像アップロード
- **レスポンシブデザイン**: モバイルファーストのUI/UX

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS v4, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **決済**: Stripe (Elements, Webhooks)
- **バリデーション**: Zod
- **パッケージマネージャー**: Bun

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── products/          # 商品ページ
│   ├── cart/              # カートページ
│   ├── checkout/          # チェックアウトページ
│   ├── orders/            # 注文履歴ページ
│   └── api/               # API Routes
├── components/            # UIコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── auth/             # 認証コンポーネント
│   ├── product/          # 商品コンポーネント
│   ├── cart/             # カートコンポーネント
│   └── checkout/         # チェックアウトコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティライブラリ
│   ├── supabase/         # Supabase設定
│   └── stripe/           # Stripe設定
└── types/                # TypeScript型定義
```

## ⚙️ セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `supabase/migrations` フォルダ内のマイグレーションを実行
3. Row Level Security (RLS) ポリシーを有効化
4. Supabase Storage でバケットを作成

### 4. Stripeのセットアップ

1. [Stripe](https://stripe.com) アカウントを作成
2. Webhook エンドポイントを設定
3. 商品とpの価格を Stripe Dashboard で作成

### 5. 開発サーバーの起動

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

## 🗄️ データベース設計

### 主要テーブル

- `users` - ユーザー情報
- `addresses` - 住所情報
- `categories` - 商品カテゴリ
- `products` - 商品情報
- `product_images` - 商品画像
- `cart_items` - カートアイテム
- `orders` - 注文情報
- `order_items` - 注文アイテム

### Row Level Security (RLS)

すべてのテーブルでRLSが有効化されており、ユーザーは自分のデータのみアクセス可能です。

## 🔐 セキュリティ機能

- **Row Level Security**: Supabaseレベルでのデータアクセス制御
- **Stripe Webhook署名検証**: 安全なWebhook処理
- **型安全性**: TypeScript + Zodによる厳密な型チェック
- **認証ミドルウェア**: 保護されたルートへのアクセス制御

## 🚀 デプロイ

### Vercel デプロイ

```bash
# Vercel CLI をインストール
npm i -g vercel

# デプロイ
vercel
```

### 環境変数の設定

Vercelダッシュボードで本番環境の環境変数を設定してください。

### Stripe Webhook URL

本番環境では、Stripe WebhookのエンドポイントURLを更新する必要があります：

```
https://your-domain.vercel.app/api/stripe/webhook
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題が発生した場合は、[Issues](../../issues) を作成してください。

# Supabase Stripe ショッピングサイト開発計画

## 🎯 プロジェクト概要
最新技術スタック（Next.js App Router、Supabase、Stripe、Tailwind CSS v4、shadcn）を使用したEコマースプラットフォームの構築

## 🏗️ アーキテクチャ設計

### データ管理方針
- **顧客情報**: Supabase（認証、住所、配送情報）+ Stripe（customer_id紐付け）
- **商品情報**: Supabase（完全管理）
- **決済情報**: Stripe（機密情報）+ Supabase（注文履歴）
- **画像管理**: Supabase Storage（商品画像：パブリック、ユーザー画像：プライベート）

### セキュリティ設計
- Row Level Security (RLS) 実装
- Stripe Webhook署名検証
- 型安全なエラーハンドリング（any型禁止）

## 📁 フォルダ構成
```
src/
  app/
    (auth)/
      login/
      register/
      profile/
    (shop)/
      products/
        [id]/
      cart/
      checkout/
    api/
      stripe/
        webhook/
        create-checkout-session/
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/ (shadcn)
    auth/
    product/
    cart/
    checkout/
  lib/
    supabase/
      client.ts
      server.ts
      types.ts
    stripe/
      client.ts
      server.ts
      webhook.ts
    utils.ts
    validations.ts
  types/
    database.types.ts
    stripe.types.ts
  hooks/
    useAuth.ts
    useCart.ts
    useProducts.ts
```

## 🚀 作業セクション

### セクション1: 環境セットアップ・基盤構築 ✅ 完了
- [x] 依存関係のインストール・更新
- [x] Tailwind CSS v4設定
- [x] TypeScript設定
- [x] 環境変数設定
- [x] Supabase接続設定
- [x] Stripe接続設定

### セクション2: データベース設計・RLS実装 ✅ 完了
- [x] Supabaseテーブル設計・作成
- [x] Row Level Security (RLS) ポリシー実装
- [x] TypeScript型定義生成
- [x] サンプルデータ作成SQL

### セクション3: 認証システム ✅ 完了
- [x] Supabase認証設定
- [x] 認証コンポーネント実装
- [x] プロファイル管理
- [x] 認証ミドルウェア

### セクション4: 商品管理システム ✅ 完了
- [x] 商品表示コンポーネント
- [x] 商品詳細ページ
- [x] 商品画像管理 (Supabase Storage)
- [x] 商品検索・フィルタリング

### セクション5: カート・注文システム
- [ ] カート機能実装
- [ ] 注文フロー設計
- [ ] 在庫管理

### セクション6: Stripe決済システム
- [ ] Stripe Elements実装
- [ ] 決済セッション作成
- [ ] Webhook実装
- [ ] 決済完了処理

### セクション7: UI/UXデザイン
- [ ] レスポンシブデザイン
- [ ] アニメーション・トランジション
- [ ] エラーハンドリングUI
- [ ] ローディング状態

### セクション8: テスト・最適化
- [ ] エラーハンドリング実装
- [ ] パフォーマンス最適化
- [ ] セキュリティ検証
- [ ] 動作テスト

## 📋 技術仕様

### 使用技術
- **フロントエンド**: Next.js 15 (App Router), React 18
- **スタイリング**: Tailwind CSS v4, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **決済**: Stripe (Elements, Webhooks)
- **型安全性**: TypeScript, Zod
- **パッケージマネージャー**: Bun

### コーディング規約
- any型使用禁止
- type-only imports使用 (`import type`)
- エラーハンドリング: `throw new Error()` → `catch (error: unknown)` → `instanceof Error`
- sonner使用（toast廃止）

## 📝 注意事項
- AIモデル上限回避のため、セクション単位で作業
- ファイル更新時は名前を出力
- フリー素材画像使用
- Context7でドキュメント参照
- 日本語出力、英語思考

## 📈 進捗管理
各セクション完了時にチェックマークを更新し、次セクションへ進行

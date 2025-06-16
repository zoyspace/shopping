# Stripe Webhook Edge Function

## 概要
StripeのWebhookイベントを処理するSupabase Edge Function。
Stripe決済の完了、成功、失敗時に自動的にSupabaseデータベースを更新します。

## 機能
- ✅ Webhook署名の検証
- ✅ 決済完了時の注文作成
- ✅ 在庫の自動減算
- ✅ カートの自動クリア
- ✅ 決済状態の追跡
- ✅ CORS対応
- ✅ 詳細なエラーログ

## ファイル構成
```
supabase/functions/stripe-webhook/
├── index.ts     # メインの Edge Function
└── README.md    # このファイル
```

## 対応Webhookイベント
- `checkout.session.completed` - 決済セッション完了時
- `payment_intent.succeeded` - 決済成功時
- `payment_intent.payment_failed` - 決済失敗時

## セットアップ

### 1. 環境変数の設定

#### Supabaseダッシュボードでの設定
1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. プロジェクト選択 → `Settings` → `Edge Functions`
3. `Add new secret`で以下の環境変数を追加：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `STRIPE_WEBHOOK_SECRET` | StripeのWebhook署名秘密鍵 | `whsec_xxx...` |
| `STRIPE_SECRET_KEY` | StripeのAPI秘密鍵 | `sk_test_xxx...` |
| `SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase管理者鍵 | `eyJxxx...` |

#### ローカル開発用
`supabase/.env`ファイルを作成：
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Edge Functionのデプロイ

#### ローカル開発
```bash
# Supabaseローカル環境を起動
supabase start

# Edge Functionをローカルで実行
supabase functions serve stripe-webhook

# アクセス可能URL
# http://localhost:54321/functions/v1/stripe-webhook
```

#### 本番デプロイ
```bash
# Supabase CLIでログイン
supabase login

# プロジェクトとリンク
supabase link --project-ref your-project-id

# Edge Functionをデプロイ
supabase functions deploy stripe-webhook
```

### 3. StripeでのWebhook設定

#### Webhook エンドポイントの追加
1. [Stripeダッシュボード](https://dashboard.stripe.com)にアクセス
2. `Developers` → `Webhooks` → `Add endpoint`
3. エンドポイントURLを設定：
   - **ローカル**: `http://localhost:54321/functions/v1/stripe-webhook`
   - **本番**: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`

#### 有効化するイベント
以下のイベントを選択：
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

#### Webhook署名秘密鍵の取得
1. 作成したWebhookエンドポイントをクリック
2. `Signing secret`をコピー
3. `STRIPE_WEBHOOK_SECRET`環境変数に設定

## 動作フロー

### 決済完了 (`checkout.session.completed`)
1. Webhook署名を検証
2. Stripeセッション詳細を取得
3. 注文レコードをSupabaseに作成
4. 注文アイテムを作成
5. 商品在庫を減算
6. ユーザーのカートをクリア

### 決済成功 (`payment_intent.succeeded`)
1. 注文ステータスを「processing」に更新

### 決済失敗 (`payment_intent.payment_failed`)
1. 注文ステータスを「cancelled」に更新

## ログとモニタリング

### ログ確認
```bash
# ローカル
supabase functions logs stripe-webhook

# 本番
supabase functions logs stripe-webhook --project-ref your-project-id

# リアルタイムログ
supabase functions logs stripe-webhook --follow
```

### デバッグ情報
Edge Function内で以下の情報をログ出力：
- 環境変数の設定状況
- 受信したWebhookイベントの種類
- 処理状況（成功/失敗）

## テスト

### Stripe CLIを使用したテスト
```bash
# Stripe CLIのインストール
# https://stripe.com/docs/stripe-cli

# Webhookをローカルに転送
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# テストイベントをトリガー
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### 手動テスト
1. 実際に商品を購入して決済を完了
2. Webhookが正常に動作するか確認
3. ログでエラーがないか確認

## トラブルシューティング

### よくある問題

#### 環境変数エラー
```
❌ Missing required environment variables: STRIPE_WEBHOOK_SECRET
```
**解決策**: Supabaseダッシュボードで環境変数を正しく設定

#### 署名検証エラー
```
❌ Webhook signature verification failed
```
**解決策**: 
- `STRIPE_WEBHOOK_SECRET`が正しく設定されているか確認
- Stripeダッシュボードから最新の署名秘密鍵を取得

#### Supabase接続エラー
```
🔗 Failed to create order: [error details]
```
**解決策**:
- `SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`を確認
- RLSポリシーがService Role Keyで適切に動作するか確認

#### 商品在庫エラー
```
🔗 Failed to decrease inventory
```
**解決策**:
- `decrease_product_inventory`関数がSupabaseに存在するか確認
- 商品IDが正しく設定されているか確認

### デバッグ手順
1. `supabase functions logs stripe-webhook`でログを確認
2. 環境変数の設定状況をチェック
3. Stripeダッシュボードでイベント配信状況を確認
4. Supabaseのログでデータベース操作を確認

## セキュリティ

### 実装されたセキュリティ機能
- **Webhook署名検証**: Stripeからの正当なリクエストのみ処理
- **タイムスタンプ検証**: リプレイ攻撃を防止（5分間の許容範囲）
- **CORS設定**: 適切なオリジン制御
- **環境変数**: 機密情報の安全な管理

### セキュリティベストプラクティス
- 環境変数には本番用の値を設定
- 定期的にWebhook署名秘密鍵を更新
- ログから機密情報が漏洩しないよう注意
- HTTPSでのみWebhookを受信

## 本番運用

### 監視すべき項目
- Webhookの配信成功率
- Edge Functionの実行時間
- データベース操作の成功率
- エラーログの発生頻度

### アラート設定
Supabaseダッシュボードでアラートを設定：
- Edge Function実行エラー
- 異常なレスポンス時間
- 大量のエラーログ

## 関連ドキュメント
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

-- ================================================================
-- 🚀 Supabase ショッピングサイト サンプルデータ
-- ================================================================
-- 完璧なサンプルデータで最高のECサイトを構築！
-- ================================================================

-- 既存データをクリーンアップ（開発環境用）
TRUNCATE TABLE public.order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.cart_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.product_images RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.addresses RESTART IDENTITY CASCADE;

-- ================================================================
-- 📦 カテゴリデータ挿入
-- ================================================================

INSERT INTO public.categories (id, name, description, slug, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'エレクトロニクス', 'スマートフォン、PC、家電など最新テクノロジー製品', 'electronics', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'ファッション', 'トレンドファッション、靴、アクセサリー', 'fashion', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'ホーム・キッチン', 'インテリア、キッチン用品、生活雑貨', 'home-kitchen', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'スポーツ・アウトドア', 'フィットネス、アウトドア、スポーツ用品', 'sports-outdoor', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', '書籍・メディア', '技術書、ビジネス書、エンターテイメント', 'books-media', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', '美容・健康', 'スキンケア、サプリメント、ウェルネス', 'beauty-health', true, NOW(), NOW());

-- ================================================================
-- 🛍️ 商品データ挿入
-- ================================================================

INSERT INTO public.products (id, name, description, price, currency, inventory, category_id, is_active, created_at, updated_at) VALUES
  -- 🔌 エレクトロニクス
  ('660e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro 128GB', '最新のiPhone 15 Pro。革新的なA17 Proチップ、プロレベルのカメラシステム、チタニウムデザインを採用。48MPメインカメラで驚異的な写真品質を実現。', 159800.00, 'jpy', 25, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440002', 'MacBook Air 13インチ M3', '究極のポータブル性能。M3チップ搭載で最大18時間のバッテリー持続。薄型軽量設計でプロフェッショナルワークに最適。', 164800.00, 'jpy', 15, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440003', 'AirPods Pro (第3世代)', 'アクティブノイズキャンセリング機能付きワイヤレスイヤホン。空間オーディオ対応で没入感ある音楽体験。最大30時間の再生時間。', 39800.00, 'jpy', 40, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440004', '4K Ultra HD Webカメラ', 'プロ仕様4K対応Webカメラ。在宅ワーク・配信に最適。オートフォーカス、ノイズキャンセリングマイク内蔵。Mac・Windows両対応。', 12800.00, 'jpy', 60, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440005', 'ワイヤレス充電スタンド', 'Qi対応ワイヤレス充電器。iPhone・Android対応。15W高速充電、スタンド式で動画視聴しながら充電可能。', 4500.00, 'jpy', 120, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),

  -- 👗 ファッション
  ('660e8400-e29b-41d4-a716-446655440006', 'プレミアムデニムジャケット', '上質セルビッチデニム使用。ヴィンテージ風加工で経年変化を楽しめる。ユニセックスデザインでコーディネートの主役に。', 18900.00, 'jpy', 35, '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440007', 'ランニングシューズ プロ仕様', '軽量クッション性抜群のランニングシューズ。マラソンからジョギングまで対応。通気性に優れ長時間使用でも快適。', 16800.00, 'jpy', 80, '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440008', '100% カシミヤニット', '最高品質カシミヤ使用の上質ニット。極上の肌触りと保温性。ビジネスからカジュアルまで幅広いシーンで活躍。', 32000.00, 'jpy', 20, '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440009', 'チタンフレーム腕時計', 'チタン合金製軽量腕時計。防水仕様、サファイアガラス採用。シンプルデザインでビジネス・カジュアル両用。', 45000.00, 'jpy', 30, '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),

  -- 🏠 ホーム・キッチン
  ('660e8400-e29b-41d4-a716-446655440010', '全自動エスプレッソマシン', '豆から挽いて淹れる本格派コーヒーメーカー。ミル内蔵、タイマー機能付き。毎朝挽きたての香り高いコーヒーを。', 28000.00, 'jpy', 30, '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440011', '無垢材ダイニングテーブル', '天然オーク材使用の職人手作り4人用テーブル。美しい木目と耐久性を兼ね備えた逸品。長く愛用できる上質な家具。', 68000.00, 'jpy', 8, '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440012', 'AI搭載スマート炊飯器', 'AI搭載で米の種類を自動判別。アプリ連動で外出先からも操作可能。土鍋コーティングでふっくら美味しいご飯。', 45000.00, 'jpy', 25, '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440013', 'プレミアム包丁セット', 'ダマスカス鋼製プロ仕様包丁3本セット。切れ味抜群、美しい波紋模様。専用木製スタンド付き。', 35000.00, 'jpy', 15, '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),

  -- 🏃‍♂️ スポーツ・アウトドア
  ('660e8400-e29b-41d4-a716-446655440014', 'プレミアムヨガマット', '天然ゴム製滑り止め付き高品質ヨガマット。厚さ6mmでクッション性抜群。ヨガ・ピラティス・筋トレに最適。', 8500.00, 'jpy', 100, '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440015', 'プロ仕様登山テント', '軽量・コンパクト本格登山テント。防水性能抜群、強風耐性。2-3人用で登山・キャンプ・フェスに最適。', 58000.00, 'jpy', 12, '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440016', 'GPS スマートウォッチ', 'GPS内蔵フィットネストラッカー。心拍数・睡眠・運動量を24時間計測。50種類のワークアウトモード搭載。', 25000.00, 'jpy', 45, '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440017', 'カーボンロードバイク', 'カーボンファイバー製軽量ロードバイク。プロ仕様コンポーネント搭載。通勤からレースまで対応。', 180000.00, 'jpy', 5, '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),

  -- 📚 書籍・メディア
  ('660e8400-e29b-41d4-a716-446655440018', 'React完全マスターガイド', 'React・Next.js・TypeScriptの基礎から実践まで。現役エンジニアが書いた最新技術書。豊富なサンプルコード付き。', 3800.00, 'jpy', 150, '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440019', 'UX/UIデザインの教科書', 'デザイン思考から実装まで学べる実践的ガイド。豊富な事例と演習で理解が深まる。デザイナー・エンジニア必読。', 2900.00, 'jpy', 80, '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440020', 'AI・機械学習実践入門', '最新AI技術を実践的に学ぶ。Python・TensorFlow・PyTorch完全対応。実際のプロジェクトを通じて理解。', 4200.00, 'jpy', 120, '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),

  -- 💄 美容・健康
  ('660e8400-e29b-41d4-a716-446655440021', 'ビタミンC高濃度美容液', '高濃度ビタミンC誘導体配合美容液。シミ・くすみケアに効果的。敏感肌にも優しい低刺激処方。日本製。', 5800.00, 'jpy', 200, '550e8400-e29b-41d4-a716-446655440006', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440022', 'プレミアムプロテイン', '高品質ホエイプロテイン。人工甘味料不使用、自然なチョコレート風味。筋トレ・ダイエットの強力サポート。', 4500.00, 'jpy', 75, '550e8400-e29b-41d4-a716-446655440006', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440023', 'オーガニック化粧水', '100%オーガニック成分の化粧水。無添加・無香料で敏感肌にも安心。保湿力抜群で肌本来の美しさを引き出す。', 3200.00, 'jpy', 150, '550e8400-e29b-41d4-a716-446655440006', true, NOW(), NOW()),

  -- 🔥 限定・特別商品（在庫切れテスト用）
  ('660e8400-e29b-41d4-a716-446655440024', '限定版ゲーミングPC', '数量限定プレミアムゲーミングPC。最新GPU・CPU搭載。4K・8K対応、プロゲーマー仕様。コレクターズアイテム。', 350000.00, 'jpy', 0, '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440025', '職人手作り革財布', '熟練職人による手作り本革長財布。使うほどに味が出る最高級レザー使用。50年保証付き。', 25000.00, 'jpy', 0, '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW());

-- ================================================================
-- 🖼️ 商品画像データ挿入
-- ================================================================

INSERT INTO public.product_images (product_id, url, alt_text, is_main, sort_order, created_at) VALUES
  -- iPhone 15 Pro
  ('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&crop=center', 'iPhone 15 Pro メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&crop=center', 'iPhone 15 Pro サイド画像', false, 1, NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop&crop=center', 'iPhone 15 Pro バック画像', false, 2, NOW()),

  -- MacBook Air M3
  ('660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&crop=center', 'MacBook Air M3 メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop&crop=center', 'MacBook Air M3 開いた状態', false, 1, NOW()),

  -- AirPods Pro
  ('660e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop&crop=center', 'AirPods Pro メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&crop=center', 'AirPods Pro ケース画像', false, 1, NOW()),

  -- 4K Webカメラ
  ('660e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=800&h=800&fit=crop&crop=center', '4K Webカメラ メイン画像', true, 0, NOW()),

  -- ワイヤレス充電スタンド
  ('660e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center', 'ワイヤレス充電スタンド メイン画像', true, 0, NOW()),

  -- デニムジャケット
  ('660e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&crop=center', 'デニムジャケット メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop&crop=center', 'デニムジャケット 着用画像', false, 1, NOW()),

  -- ランニングシューズ
  ('660e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&crop=center', 'ランニングシューズ メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop&crop=center', 'ランニングシューズ サイド画像', false, 1, NOW()),

  -- カシミヤニット
  ('660e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop&crop=center', 'カシミヤニット メイン画像', true, 0, NOW()),

  -- チタンフレーム腕時計
  ('660e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&crop=center', 'チタンフレーム腕時計 メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=800&fit=crop&crop=center', 'チタンフレーム腕時計 詳細画像', false, 1, NOW()),

  -- エスプレッソマシン
  ('660e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop&crop=center', 'エスプレッソマシン メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=800&fit=crop&crop=center', 'エスプレッソマシン 使用画像', false, 1, NOW()),

  -- ダイニングテーブル
  ('660e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&crop=center', 'ダイニングテーブル メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=800&fit=crop&crop=center', 'ダイニングテーブル 使用画像', false, 1, NOW()),

  -- スマート炊飯器
  ('660e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1585515656643-808551bd8b19?w=800&h=800&fit=crop&crop=center', 'スマート炊飯器 メイン画像', true, 0, NOW()),

  -- プレミアム包丁セット
  ('660e8400-e29b-41d4-a716-446655440013', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop&crop=center', 'プレミアム包丁セット メイン画像', true, 0, NOW()),

  -- ヨガマット
  ('660e8400-e29b-41d4-a716-446655440014', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop&crop=center', 'ヨガマット メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440014', 'https://images.unsplash.com/photo-1506629905607-bfd1cf0b3fb8?w=800&h=800&fit=crop&crop=center', 'ヨガマット 使用画像', false, 1, NOW()),

  -- 登山用テント
  ('660e8400-e29b-41d4-a716-446655440015', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&h=800&fit=crop&crop=center', '登山用テント メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440015', 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&h=800&fit=crop&crop=center', '登山用テント 設営画像', false, 1, NOW()),

  -- GPS スマートウォッチ
  ('660e8400-e29b-41d4-a716-446655440016', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop&crop=center', 'GPS スマートウォッチ メイン画像', true, 0, NOW()),

  -- カーボンロードバイク
  ('660e8400-e29b-41d4-a716-446655440017', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&crop=center', 'カーボンロードバイク メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440017', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=800&fit=crop&crop=center', 'カーボンロードバイク 詳細画像', false, 1, NOW()),

  -- React完全マスターガイド
  ('660e8400-e29b-41d4-a716-446655440018', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&crop=center', 'React完全マスターガイド メイン画像', true, 0, NOW()),

  -- UX/UIデザインの教科書
  ('660e8400-e29b-41d4-a716-446655440019', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop&crop=center', 'UX/UIデザインの教科書 メイン画像', true, 0, NOW()),

  -- AI・機械学習実践入門
  ('660e8400-e29b-41d4-a716-446655440020', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=800&fit=crop&crop=center', 'AI・機械学習実践入門 メイン画像', true, 0, NOW()),

  -- ビタミンC美容液
  ('660e8400-e29b-41d4-a716-446655440021', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop&crop=center', 'ビタミンC美容液 メイン画像', true, 0, NOW()),

  -- プレミアムプロテイン
  ('660e8400-e29b-41d4-a716-446655440022', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop&crop=center', 'プレミアムプロテイン メイン画像', true, 0, NOW()),

  -- オーガニック化粧水
  ('660e8400-e29b-41d4-a716-446655440023', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&crop=center', 'オーガニック化粧水 メイン画像', true, 0, NOW()),

  -- 限定版ゲーミングPC
  ('660e8400-e29b-41d4-a716-446655440024', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=800&fit=crop&crop=center', '限定版ゲーミングPC メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440024', 'https://images.unsplash.com/photo-1540829917886-91ab031b1764?w=800&h=800&fit=crop&crop=center', '限定版ゲーミングPC 詳細画像', false, 1, NOW()),

  -- 職人手作り革財布
  ('660e8400-e29b-41d4-a716-446655440025', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center', '職人手作り革財布 メイン画像', true, 0, NOW()),
  ('660e8400-e29b-41d4-a716-446655440025', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&crop=center', '職人手作り革財布 詳細画像', false, 1, NOW());

-- ================================================================
-- 📊 データベース統計情報表示
-- ================================================================

DO $$
DECLARE
    category_count INTEGER;
    product_count INTEGER;
    image_count INTEGER;
    active_product_count INTEGER;
    in_stock_count INTEGER;
    out_of_stock_count INTEGER;
BEGIN
    -- データ件数を取得
    SELECT COUNT(*) INTO category_count FROM public.categories;
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO image_count FROM public.product_images;
    SELECT COUNT(*) INTO active_product_count FROM public.products WHERE is_active = true;
    SELECT COUNT(*) INTO in_stock_count FROM public.products WHERE inventory > 0;
    SELECT COUNT(*) INTO out_of_stock_count FROM public.products WHERE inventory = 0;
    
    -- 結果を表示
    RAISE NOTICE '🚀 サンプルデータ挿入完了！';
    RAISE NOTICE '================================';
    RAISE NOTICE '📦 カテゴリ数: % 件', category_count;
    RAISE NOTICE '🛍️ 商品数: % 件 (有効: % 件)', product_count, active_product_count;
    RAISE NOTICE '🖼️ 商品画像数: % 件', image_count;
    RAISE NOTICE '📈 在庫状況:';
    RAISE NOTICE '  - 在庫あり: % 件', in_stock_count;
    RAISE NOTICE '  - 在庫切れ: % 件', out_of_stock_count;
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ ECサイトの準備完了！最高のショッピング体験を！';
END $$;

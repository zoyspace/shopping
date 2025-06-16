-- 在庫管理関数を追加
create or replace function decrease_product_inventory(product_id uuid, decrease_amount integer)
returns void as $$
begin
  -- 現在の在庫を確認
  if (select inventory from products where id = product_id) < decrease_amount then
    raise exception 'Insufficient inventory for product %', product_id;
  end if;
  
  -- 在庫を減らす
  update products 
  set inventory = inventory - decrease_amount
  where id = product_id;
end;
$$ language plpgsql;

-- 在庫を増やす関数（返品・キャンセル時用）
create or replace function increase_product_inventory(product_id uuid, increase_amount integer)
returns void as $$
begin
  update products 
  set inventory = inventory + increase_amount
  where id = product_id;
end;
$$ language plpgsql;

-- 在庫チェック関数
create or replace function check_product_inventory(product_id uuid, required_amount integer)
returns boolean as $$
begin
  return (select inventory from products where id = product_id) >= required_amount;
end;
$$ language plpgsql;

-- 注文キャンセル時に在庫を戻す関数
create or replace function restore_inventory_from_order(order_id uuid)
returns void as $$
declare
  item_record record;
begin
  -- 注文アイテムをループして在庫を戻す
  for item_record in
    select product_id, quantity
    from order_items
    where order_id = restore_inventory_from_order.order_id
  loop
    perform increase_product_inventory(item_record.product_id, item_record.quantity);
  end loop;
end;
$$ language plpgsql;

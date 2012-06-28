class AddScryptoOwnerIndex < ActiveRecord::Migration
  def change
    add_index :scrypto_key_rings, :owner_id, :unique => true
  end
end

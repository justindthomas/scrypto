class CreateScryptoKeyAssociations < ActiveRecord::Migration
  def change
    create_table :scrypto_key_associations do |t|
      t.integer :owner_id
      t.string :owner_type
      t.integer :entity_id
      t.string :entity_type
      t.string :encrypted_key

      t.timestamps
    end

    add_index :scrypto_key_associations, [ :owner_type, :owner_id, :entity_type, :entity_id ], :name => 'scrypto_key_assn_cmpst_idx', :unique => true
  end
end

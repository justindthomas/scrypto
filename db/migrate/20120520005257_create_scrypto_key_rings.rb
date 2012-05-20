class CreateScryptoKeyRings < ActiveRecord::Migration
  def change
    create_table :scrypto_key_rings do |t|
      t.text :secured_decryption
      t.text :encryption
      t.text :secured_signing
      t.text :verification
      t.integer :person_id

      t.timestamps
    end
  end
end
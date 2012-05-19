class CreateKeyRingsTable < ActiveRecord::Migration
  def self.up
    create_table :key_rings do |t|
      t.text :secured_encryption_key
      t.text :public_encryption_key
      t.text :secured_signing_key
      t.text :public_verification_key
      t.integer :person_id

      t.timestamps
    end
  end

  def self.down
    drop_table :key_rings
  end
end

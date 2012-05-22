module Scrypto
  class KeyRing < ActiveRecord::Base
    attr_accessible :encryption, :owner_id, :owner_type, :secured_decryption, :secured_signing, :verification    
    belongs_to :owner, :polymorphic => true
    
  end
end

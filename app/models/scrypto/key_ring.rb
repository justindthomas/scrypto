module Scrypto
  class KeyRing < ActiveRecord::Base
    attr_accessible :encryption, :secured_decryption, :secured_signing, :verification    
    belongs_to :owner, :polymorphic => true
    
    validates :owner_id, :uniqueness => true
  end
end

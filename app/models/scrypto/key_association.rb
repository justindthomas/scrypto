module Scrypto
  class KeyAssociation < ActiveRecord::Base
    attr_accessible :encrypted_key, :entity_id, :entity_type, :owner_id, :owner_type
    
    belongs_to :owner, :polymorphic => true
    belongs_to :entity, :polymorphic => true
  end
end

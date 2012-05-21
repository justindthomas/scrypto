module Scrypto
  class KeyRing < ActiveRecord::Base
    attr_accessible :encryption, :owner_name, :secured_decryption, :secured_signing, :verification
    
    attr_accessor :owner_name
    belongs_to :person, :class_name => "Person"
    
    before_save :set_owner
 
    private
      def set_owner
        self.owner_id = Person.find_or_create_by_name(owner_name).id
      end
  end
end

module Scrypto
  class KeyRing < ActiveRecord::Base
    attr_accessible :encryption, :person_id, :secured_decryption, :secured_signing, :verification
  end
end

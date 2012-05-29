require "scrypto/engine"
require "active_support/dependencies"

module Scrypto
  mattr_accessor :app_root, :owner_class, :owner_id
  
  def self.setup
    yield self
  end
end

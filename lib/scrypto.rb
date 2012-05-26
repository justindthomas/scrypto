require "scrypto/engine"
require "active_support/dependencies"

module Scrypto
  mattr_accessor :app_root
  mattr_accessor :owner_class
  
  def self.setup
    yield self
  end
    
end

require "active_support/dependencies"

module Scrypto
  mattr_accessor :app_root
  
  def self.setup
    yield self
  end
    
end

require "scrypto/engine"

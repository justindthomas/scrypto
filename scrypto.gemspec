require File.expand_path("../lib/scrypto/version", __FILE__)

Gem::Specification.new do |s|
  s.name = "scrypto"
  s.version = Scrypto::VERSION
  s.platform = Gem::Platform::RUBY
  s.authors = [ "Justin Thomas" ]
  s.email = [ "justin@justinthomas.name" ]
  s.homepage = "http://justinthomas.pro"
  s.summary = "scrypto-#{s.version}"
  s.description = "A Rails engine that adds client-side cryptography functions to any Rails 3 application."
  
  s.rubyforge_project = "scrypto"
  s.required_rubygems_version = "~> 1.8.17"
  
  s.add_dependency "activesupport"
  s.add_dependency "rails", "~> 3.2.3"
  s.add_dependency "jquery-rails"
  
  s.files = `git ls-files`.split("\n")
  s.executables = `git ls-files`.split("\n").map{|f| f =~ /^bin\/(.*)/ ? $1 : nil}.compact
  s.require_path = 'lib'
end

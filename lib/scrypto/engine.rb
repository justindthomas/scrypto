module Scrypto
  class Engine < ::Rails::Engine
    isolate_namespace Scrypto
    initializer "scrypto.load_app_instance_data" do |app|
      Scrypto.setup do |config|
        config.app_root = app.root
      end
    end
    
    initializer "scrypto.load_static_assets" do |app|
      app.middleware.use ::ActionDispatch::Static, "#{root}/public"
    end
  end
end

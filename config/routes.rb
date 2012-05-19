Rails.application.routes.draw do
  resources :key_rings, :only => [:show, :create], :as => :key_rings
end
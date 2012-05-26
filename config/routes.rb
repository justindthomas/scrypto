Scrypto::Engine.routes.draw do
  resources :key_rings
  match '/public_keys' => "key_rings#public_keys"
  match '/verification_keys' => "key_rings#verification_keys"
end

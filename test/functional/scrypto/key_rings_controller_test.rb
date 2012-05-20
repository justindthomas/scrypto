require 'test_helper'

module Scrypto
  class KeyRingsControllerTest < ActionController::TestCase
    setup do
      @key_ring = key_rings(:one)
    end
  
    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:key_rings)
    end
  
    test "should get new" do
      get :new
      assert_response :success
    end
  
    test "should create key_ring" do
      assert_difference('KeyRing.count') do
        post :create, key_ring: { encryption: @key_ring.encryption, person_id: @key_ring.person_id, secured_decryption: @key_ring.secured_decryption, secured_signing: @key_ring.secured_signing, verification: @key_ring.verification }
      end
  
      assert_redirected_to key_ring_path(assigns(:key_ring))
    end
  
    test "should show key_ring" do
      get :show, id: @key_ring
      assert_response :success
    end
  
    test "should get edit" do
      get :edit, id: @key_ring
      assert_response :success
    end
  
    test "should update key_ring" do
      put :update, id: @key_ring, key_ring: { encryption: @key_ring.encryption, person_id: @key_ring.person_id, secured_decryption: @key_ring.secured_decryption, secured_signing: @key_ring.secured_signing, verification: @key_ring.verification }
      assert_redirected_to key_ring_path(assigns(:key_ring))
    end
  
    test "should destroy key_ring" do
      assert_difference('KeyRing.count', -1) do
        delete :destroy, id: @key_ring
      end
  
      assert_redirected_to key_rings_path
    end
  end
end

class KeyRingsController < ApplicationController
  def show
    if params[:person_ids].blank?
      @key_rings = Contact.where(:id => params[:contact_ids].split(',')).map! do |contact|
        { :contact => contact.id, :key_ring => contact.person.key_ring }
      end
    else
      @key_rings = Person.where(:id => params[:person_ids].split(',')).map! do |person|
        { :contact => person.id, :key_ring => person.key_ring }
      end
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @key_rings }
    end
  end

  def create
    @key_ring = KeyRing.new
    @key_ring.secured_encryption_key = params[:secured_encryption_key]
    @key_ring.public_encryption_key = params[:public_encryption_key]
    @key_ring.secured_signing_key = params[:secured_signing_key]
    @key_ring.public_verification_key = params[:public_verification_key]
    @key_ring.person = Person.find_from_guid_or_username(:id => params[:guid])

    respond_to do |format|
      if @key_ring.save
        format.js { }
      else
        format.html { render action: "new" }
        format.json { render json: @key_ring.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @key_ring = KeyRing.find(params[:id])

    respond_to do |format|
      if @key_ring.update_attributes(params[:key_ring])
        format.html { redirect_to @key_ring, notice: 'Key ring was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @key_ring.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @key_ring = KeyRing.find(params[:id])
    @key_ring.destroy

    respond_to do |format|
      format.html { redirect_to key_rings_url }
      format.json { head :ok }
    end
  end
end
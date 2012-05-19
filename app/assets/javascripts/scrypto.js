//= require_tree .

(function( $ ) {
	$.fn.scrypto = function() {"use strict"
	
		if(!(this instanceof scrypto))
			throw new Error("Constructor called as a function")
	
		/**
		 * passphrase and encrypted_private_key should be submitted as they exist in their
		 * respective input fields. messages is a list of encrypted messages from the server and
		 * message_keys is an object mapping each message id to its corresponding asymmetrically
		 * encrypted symmetric key
		 **/
		this.decrypt_messages = function(passphrase, message_keys) {
			if(!passphrase || !message_keys)
				throw new Error("Invalid argument(s)")
	
			for(var i = 0; i < message_keys.length; i++) {
				var pvk = JSON.parse(sjcl.decrypt(passphrase, message_keys[i].details.recipient.encrypted_private_key))
				var bn = sjcl.bn.fromBits(pvk.exponent)
				var sec = new sjcl.ecc.elGamal.secretKey(pvk.curve, sjcl.ecc.curves['c' + pvk.curve], bn)
	
				var sym = JSON.parse(sjcl.decrypt(sec, message_keys[i].encrypted_key))
				var message = sjcl.decrypt(sym, message_keys[i].details.message.body)
				message_keys[i].details.message.body = message
			}
	
			return message_keys
		}
	
		this.verify_messages = function(message_keys) {
			if(!message_keys)
				throw new Error("Invalid argument(s)")
	
			for(var i = 0; i < message_keys.length; i++) {
				var json = JSON.parse(message_keys[i].details.sender.verification_key)
				var point = sjcl.ecc.curves['c' + json.curve].fromBits(json.point)
				var sgk = new sjcl.ecc.ecdsa.publicKey(json.curve, point.curve, point)
				var hash = sjcl.hash.sha256.hash(message_keys[i].details.message.body)
				message_keys[i].details.message.verified = sgk.verify(hash, JSON.parse(message_keys[i].details.message.signature))
			}
	
			return message_keys
		}
	
		this.generate_keys = function() {
			var ekp = sjcl.ecc.elGamal.generateKeys(384, 10)
			var skp = sjcl.ecc.ecdsa.generateKeys(384, 10)
	
			return {
				"encryption" : {
					"pub" : ekp.pub.serialize(),
					"sec" : ekp.sec.serialize()
				},
				"signing" : {
					"pub" : skp.pub.serialize(),
					"sec" : skp.sec.serialize()
				},
				"secure" : false
			}
		}
	
		this.encrypt_keys = function(passphrase, keys) {
			if(!passphrase || !keys)
				throw new Error("Invalid argument(s)")
	
			keys.encryption.sec = sjcl.encrypt(passphrase, JSON.stringify(keys.encryption.sec))
			keys.signing.sec = sjcl.encrypt(passphrase, JSON.stringify(keys.signing.sec))
			keys.secure = true
	
			return keys
		}
	
		this.prepare_messages = function(person_ids, passphrase, messages, current_user_key_ring) {
			var signing_key = this.decrypt_signing_key(passphrase, current_user_key_ring.encrypted_signing_key)
			var signature = signing_key.sign(sjcl.hash.sha256.hash(message))
	
			var recipient_public_keys
	
			recipient_public_keys = this.get_public_keys(person_ids)
	
			var recipient_message_keys = {}
			
			var json = JSON.parse(current_user_key_ring.public_encryption_key)
			var point = sjcl.ecc.curves['c' + json.curve].fromBits(json.point)
			var sender_public_key = new sjcl.ecc.elGamal.publicKey(json.curve, point.curve, point)
			var shared_key = sender_public_key.kem(0).key
			
			recipient_message_keys[current_user_key_ring.person_id] = sjcl.encrypt(sender_public_key, JSON.stringify(shared_key))
			
			for(var id in recipient_public_keys) {
				if(!recipient_public_keys.hasOwnProperty(id)) { continue }
				
				recipient_message_keys[recipient_public_keys[id].person_id] = sjcl.encrypt(recipient_public_keys[id], JSON.stringify(shared_key))
			}
	
			for(var i = 0; i < messages.length; i++) {
				messages[i] = sjcl.encrypt(shared_key, messages[i])
			}
	
			return {
				"recipient_message_keys" : recipient_message_keys,
				"encrypted_messages" : messages,
				"signature" : signature
			}
		}
	
		this.get_verification_keys = function(person_ids) {
			var verification_keys = {}
	
			$.ajax({
				url : "/key_ring?person_ids=" + person_ids,
				async : false,
				dataType : "json",
				success : function(data) {
					var json = JSON.parse(data.key_ring.public_verification_key)
					var point = sjcl.ecc.curves['c' + json.curve].fromBits(json.point)
					verification_keys[contact_id] = new sjcl.ecc.ecdsa.publicKey(json.curve, point.curve, point)
				}
			})
	
			return verification_keys
		}
	
		this.get_public_keys = function(person_ids) {
			var public_keys = {}
			
			$.ajax({
				url : "/key_rings?person_ids=" + person_ids,
				async : false,
				dataType : "json",
				success : function(data) {
					for(var i = 0; i < data.length; i++) {
						var json = JSON.parse(data[i].key_ring.key_ring.public_encryption_key)
						var point = sjcl.ecc.curves['c' + json.curve].fromBits(json.point)
						public_keys[data[i].contact] = new sjcl.ecc.elGamal.publicKey(json.curve, point.curve, point)
						public_keys[data[i].contact].person_id = data[i].key_ring.key_ring.person_id
					}
				}
			})
	
			return public_keys
		}
	
		this.decrypt_signing_key = function(passphrase, encrypted_signing_key) {
			var epks = sjcl.decrypt(passphrase, encrypted_signing_key)
			var spk = JSON.parse(epks)
	
			var bignum = sjcl.bn.fromBits(spk.exponent)
			var signing_key = new sjcl.ecc.ecdsa.secretKey(spk.curve, sjcl.ecc.curves['c' + spk.curve], bignum)
	
			return signing_key
		}
	};
})( jQuery );
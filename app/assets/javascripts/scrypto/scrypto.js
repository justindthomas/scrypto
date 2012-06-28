//= require ./sjcl
//= require ./base64

(function($) {
	$(document).ready(function() {
		if ( typeof window.get_scrypto_config === 'function') {
			$(".scrypto-entropy").entropy()
			$(".scrypto-passphrase").passphrase()
			$(".scrypto-key-generator").generate_keys()

			$(document).decrypt_all()

			$(document).on("submit", "form", function(event) {
				var success = true
				var secure_fields = window.get_scrypto_config().secure_fields.split(",")

				for (var i = 0; i < secure_fields.length; i++) {
					$(this).find(secure_fields[i]).each(function() {
						success = $(this).encrypt_text()
					})
				}

				if (!success) {
					alert("unable to send message")
				}

				return success
			})
		}
	})
	var random_id = function() {
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
		var string_length = 8;
		var out = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			out += chars.substring(rnum, rnum + 1);
		}

		return out;
	}

	$.fn.decrypt_all = function() {
		var decrypt_fields = window.get_scrypto_config().decrypt_fields.split(",")

		for (var i = 0; i < decrypt_fields.length; i++) {
			if ($(decrypt_fields[i]).length > 0) {
				$(decrypt_fields[i]).decrypt_text()
			}
		}
	}

	$.fn.entropy = function() {
		var collect_entropy = function(event) {
			var dependent_elements = event.data.elements

			var progress = sjcl.random.getProgress(10)

			if (progress === undefined || progress == 1) {
				if (dependent_elements && dependent_elements.length > 0) {
					for (var i = 0; i < dependent_elements.length; i++) {
						$(dependent_elements[i]).show()
					}
				}

				$(".scrypto-entropy").hide()
				sjcl.random.stopCollectors()
				$(window).unbind('mousemove', collect_entropy)
			} else {
				if (dependent_elements && dependent_elements.length > 0) {
					for (var i = 0; i < dependent_elements.length; i++) {
						$(dependent_elements[i]).hide()
					}
				}

				var percentage = progress * 100;
				$("#entropy").text(percentage.toFixed(0) + "%")
			}
		}

		this.each(function() {
			// if key ring is required, check that configuration function is complete
			var require_decryption_key = $(this).attr("data-require_decryption_key")
			if (require_decryption_key && !window.get_scrypto_config().decryption_key) {
				return
			}
			
			var existing_dk_nillable = $(this).attr("data-existing_dk_nillable")
			if (existing_dk_nillable && (window.get_scrypto_config().decryption_key != null)) {
				return
			}

			var dependent_elements
			if (window.get_scrypto_config().entropy_dependent) {
				dependent_elements = window.get_scrypto_config().entropy_dependent.split(",")

				for (var i = 0; i < dependent_elements.length; i++) {
					$(dependent_elements[i]).hide()
				}
			}

			$(this).html("<span>Entropy: </span><span id='entropy'>0%</span>")
			$(window).bind('mousemove', {
				elements : dependent_elements
			}, collect_entropy)
			sjcl.random.startCollectors()
		})
	}

	$.fn.generate_keys = function() {
		this.each(function() {
			var store_passphrase = $(this).attr("data-store_passphrase")

			if(window.get_scrypto_config().decryption_key == null) {
				var url = window.get_scrypto_config().mount_point + "/key_rings"
				$(this).html("<form id='scrypto-key-generator' data-remote='true' method='post' action='" + url + "'>" + "<input type='hidden' id='secured_decryption' name='key_ring[secured_decryption]' />" + "<input type='hidden' id='encryption' name='key_ring[encryption]' />" + "<input type='hidden' id='secured_signing' name='key_ring[secured_signing]' />" + "<input type='hidden' id='verification' name='key_ring[verification]' />" + "<input type='submit' value='Create Keys' />" + "</form>")
	
				var form = $("#scrypto-key-generator")
				form.bind('submit', function(event) {
					var progress = sjcl.random.getProgress(10)
	
					if (progress !== undefined && progress != 1) {
						alert("insufficient entropy")
						return false
					}
	
					if (!$("#scrypto-passphrase").val()) {
						alert("enter a passphrase")
						return false
					}
	
					if (store_passphrase) {
						if (localStorage["scrypto-passphrases"] == null) {
							var passphrases = {}
							localStorage["scrypto-passphrases"] = JSON.stringify(passphrases)
						}
	
						var user = window.get_scrypto_config().owner.local
						var passphrases = JSON.parse(localStorage.getItem("scrypto-passphrases"))
						passphrases[user] = $("#scrypto-passphrase").val()
	
						localStorage["scrypto-passphrases"] = JSON.stringify(passphrases)
					}
	
					var scrypto = new $.fn.scrypto
					var k = scrypto.generate_keys()
					k = scrypto.encrypt_keys($("#scrypto-passphrase").val(), k)
	
					$("#secured_decryption").val(Base64.encode(k.encryption.sec))
					$("#encryption").val(Base64.encode(JSON.stringify(k.encryption.pub)))
					$("#secured_signing").val(Base64.encode(k.signing.sec))
					$("#verification").val(Base64.encode(JSON.stringify(k.signing.pub)))
	
					return true
				})
			} else {
				$(this).html("Key ring has been generated.")

			}
		})
	}

	$.fn.passphrase = function() {
		this.each(function() {
			// if key ring is required, check that it exists
			var require_decryption_key = $(this).attr("data-require_decryption_key")
			if (require_decryption_key && !window.get_scrypto_config().decryption_key) {
				return
			}
			
			var existing_dk_nillable = $(this).attr("data-existing_dk_nillable")
			if (existing_dk_nillable && (window.get_scrypto_config().decryption_key != null)) {
				return
			}

			var hidden = $(this).attr("data-hidden")
			if (hidden) {
				$(this).hide()
			}

			$(this).html("<label for='scrypto-passphrase'>Passphrase</label>" + "<input id='scrypto-passphrase' type='password' />")

			var owner = window.get_scrypto_config().owner
			if (owner) {
				if (localStorage["scrypto-passphrases"] && JSON.parse(localStorage["scrypto-passphrases"])[owner.local]) {
					$("#scrypto-passphrase").val(JSON.parse(localStorage["scrypto-passphrases"])[owner.local])
				}
			}
		})
	}

	$.fn.decrypt_text = function() {
		var scrypto = new $.fn.scrypto
		var accessible_message_key, secured_decryption, decryption_key

		this.each(function() {
			if (!accessible_message_key && !window.get_scrypto_config().decryption_key) {
				return
			} else if (!accessible_message_key) {
				secured_decryption = window.get_scrypto_config().decryption_key
				decryption_key = scrypto.decrypt_decryption_key($("#scrypto-passphrase").val(), Base64.decode(secured_decryption))
			}

			var html = $(this).html()

			var encrypted_messages = html.match(/\[scrypto\].*\[\/scrypto\]/)

			if (encrypted_messages) {
				for (var k = 0; k < encrypted_messages.length; k++) {
					var message = JSON.parse(Base64.decode(encrypted_messages[k].replace('[scrypto]', '').replace('[/scrypto]', '')))
					
					var owner = (window.get_scrypto_config().owner.global) ? window.get_scrypto_config().owner.global : window.get_scrypto_config().owner.local

					if (!accessible_message_key) {
						accessible_message_key = sjcl.decrypt(decryption_key, message.recipient_message_keys[owner])

						var symmetric_fields = window.get_scrypto_config().symmetric_fields.split(",")
						for (var i = 0; i < symmetric_fields.length; i++) {
							$(symmetric_fields[i]).each(function() {
								$(this).attr("data-symmetric_key", Base64.encode(accessible_message_key))
							})
						}
					}

					html = html.replace(encrypted_messages[k], sjcl.decrypt(JSON.parse(accessible_message_key), message.encrypted_text))
				}

				$(this).html(html)
			}
		})
	}

	$.fn.encrypt_text = function() {
		var success

		var public_keys = {}

		try {
			var scrypto = new $.fn.scrypto

			var plaintext = $(this).val()
			var recipients, symmetric_key

			if ($(this).attr("data-symmetric_key") != null) {
				// a symmetric key was specified; encrypt the text with that
				symmetric_key = JSON.parse(Base64.decode($(this).attr("data-symmetric_key")))
			} else {
				// no symmetric key was specified; find public keys for recipients
				var query
				if (!( query = $("#" + window.get_scrypto_config().lookup_field).first().val())) {
					alert("symmetric key and lookup field unavailable: sending unencrypted")
					success = true
				} else {
					var url = window.get_scrypto_config().lookup_url

					recipients = scrypto.get_recipient_ids(url, query)
					recipients.push(window.get_scrypto_config().owner)

					if (!recipients) {
						alert("no recipients specified: canceling send operation")
						success = false
					}
				}
			}

			if (success === undefined) {
				var message
				if (!( message = scrypto.encrypt_text(recipients, plaintext, symmetric_key))) {
					alert("keys unavailable for some recipients: sending unencrypted")
					success = true
				} else {
					$(this).val("[scrypto]" + Base64.encode(JSON.stringify(message)) + "[/scrypto]")
					success = true
				}
			}
		} catch (e) {
			alert(e)
			success = false
		}

		return success
	}

	$.fn.scrypto = function() {"use strict"
		if (!(this instanceof $.fn.scrypto))
			throw new Error("Constructor called as a function")

		var crypto = this

		this.get_recipient_ids = function(lookup_url, query) {
			var recipient_ids = ""

			$.ajax({
				url : lookup_url + query,
				async : false,
				dataType : "json",
				success : function(data) {
					recipient_ids = data
				}
			})

			return recipient_ids
		}

		this.verify_messages = function(message_keys) {
			if (!message_keys)
				throw new Error("Invalid argument(s)")

			for (var i = 0; i < message_keys.length; i++) {
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
			if (!passphrase || !keys)
				throw new Error("Invalid argument(s)")

			keys.encryption.sec = sjcl.encrypt(passphrase, JSON.stringify(keys.encryption.sec))
			keys.signing.sec = sjcl.encrypt(passphrase, JSON.stringify(keys.signing.sec))
			keys.secure = true

			return keys
		}
		/*
		 * recipient_ids: a comma separated list of owner_ids (e.g., "7,11,3,4")
		 * fields: an object mapping field name to field content (e.g., "{ 'body': 'some text', 'subject': 'a subject' }")
		 */
		this.encrypt_text = function(recipient_ids, text, symmetric_key) {
			var shared_key

			var encrypted_message = { }

			if (!recipient_ids && (symmetric_key != null)) {
				shared_key = symmetric_key
			} else {
				var public_keys = this.get_public_keys(recipient_ids)
				if (!public_keys.complete) {
					return false
				} else {
					delete public_keys.complete
				}

				var progress = sjcl.random.getProgress(10)
				if (progress !== undefined && progress != 1) {
					alert("insufficient entropy")
					return false
				}

				encrypted_message.recipient_message_keys = { }

				for (var id in public_keys) {
					if (!public_keys.hasOwnProperty(id)) {
						continue
					}

					if (!shared_key) {
						shared_key = public_keys[id].kem(10).key
					}

					encrypted_message.recipient_message_keys[id] = sjcl.encrypt(public_keys[id], JSON.stringify(shared_key))
				}
			}

			encrypted_message.encrypted_text = sjcl.encrypt(shared_key, text)
			return encrypted_message
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

		this.get_public_keys = function(owner_ids) {
			var public_keys, key_ring_ids
			var local_to_global = {}

			for (var i = 0; i < owner_ids.length; i++) {
				key_ring_ids = (key_ring_ids === undefined) ? owner_ids[i].local : key_ring_ids + "," + owner_ids[i].local
				local_to_global[owner_ids[i].local] = owner_ids[i].global
			}

			$.ajax({
				url : window.get_scrypto_config().mount_point + "/public_keys.json?owner_ids=" + key_ring_ids,
				async : false,
				dataType : "json",
				success : function(keys) {
					public_keys = keys
				}
			})

			var keys_to_return = { }
			if(public_keys.complete) {
				keys_to_return["complete"] = true
			}
			
			for (var key in public_keys) {
				if (key == 'complete') {
					continue
				}

				var json = JSON.parse(Base64.decode(public_keys[key]))
				var point = sjcl.ecc.curves['c' + json.curve].fromBits(json.point)
				
				var k = new sjcl.ecc.elGamal.publicKey(json.curve, point.curve, point)
				
				if(local_to_global[key]) {
					keys_to_return[local_to_global[key]] = k
				} else { 
					keys_to_return[key] = k
				}
			}

			return keys_to_return
		}

		this.decrypt_signing_key = function(passphrase, encrypted_signing_key) {
			var epks = sjcl.decrypt(passphrase, encrypted_signing_key)
			var spk = JSON.parse(epks)

			var bignum = sjcl.bn.fromBits(spk.exponent)
			var signing_key = new sjcl.ecc.ecdsa.secretKey(spk.curve, sjcl.ecc.curves['c' + spk.curve], bignum)

			return signing_key
		}

		this.decrypt_decryption_key = function(passphrase, encrypted_decryption_key) {
			var epks = sjcl.decrypt(passphrase, encrypted_decryption_key)
			var spk = JSON.parse(epks)

			var bignum = sjcl.bn.fromBits(spk.exponent)
			var decryption_key = new sjcl.ecc.elGamal.secretKey(spk.curve, sjcl.ecc.curves['c' + spk.curve], bignum)

			return decryption_key
		}
	};
})(jQuery);

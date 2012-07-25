importScripts('/assets/scrypto/sjcl.js', '/assets/scrypto/base64.js')

self.onmessage = function(e) {
	var decrypt_decryption_key = function(passphrase, encrypted_decryption_key) {
		var epks
		try {
			epks = sjcl.decrypt(passphrase, encrypted_decryption_key)
		} catch(e) {
			return null
		}

		var spk = JSON.parse(epks)

		var bignum = sjcl.bn.fromBits(spk.exponent)
		var decryption_key = new sjcl.ecc.elGamal.secretKey(spk.curve, sjcl.ecc.curves['c' + spk.curve], bignum)

		return decryption_key
	}
	
	var getDate = function(timestamp) {
		var date, month, year, hour, minutes, seconds, ampm
		if (timestamp.getHours() == 0) {
			hour = 12
			ampm = 'am'
		} else if (timestamp.getHours() > 12) {
			hour = timestamp.getHours() - 12
			ampm = 'pm'
		} else if (timestamp.getHours() == 12) {
			hour = timestamp.getHours()
			ampm = 'pm'
		} else {
			hour = timestamp.getHours()
			ampm = 'am'
		}

		date = timestamp.getDate()
		month = timestamp.getMonth() + 1
		year = timestamp.getFullYear()
		minutes = timestamp.getMinutes()
		seconds = timestamp.getSeconds()

		minutes = (minutes.toString().length < 2) ? "0" + minutes : minutes.toString()
		seconds = (seconds.toString().length < 2) ? "0" + seconds : seconds.toString()

		return month + "/" + date + "/" + year + " " + hour + ":" + minutes + ":" + seconds + " " + ampm
	}

	var arguments = e.data

	var originator = null
	var last = null
	var recent = null

	var secured_decryption = arguments.secured_decryption
	var decryption_key = decrypt_decryption_key(arguments.passphrase, Base64.decode(secured_decryption))
	var data = arguments.conversations

	for (var i = 0; i < data.length; i++) {
		data[i].accessible_message_key = sjcl.decrypt(decryption_key, data[i].encrypted_key)
		data[i].conversation.subject = sjcl.decrypt(JSON.parse(data[i].accessible_message_key), data[i].conversation.subject);

		var messages = data[i].conversation.messages
		for (var k = 0; k < messages.length; k++) {
			messages[k].text = sjcl.decrypt(JSON.parse(data[i].accessible_message_key), messages[k].text)
			messages[k].timestamp = getDate(new Date(messages[k].timestamp))

			if (!data[i].conversation.originator) {
				data[i].conversation.originator = messages[k].sender
			}

			data[i].conversation.last_timestamp = messages[k].timestamp
			data[i].conversation.last_message = messages[k].text

			for(var l = 0; l < messages[k].attachments.length; l++) {
				messages[k].attachments[l].name = sjcl.decrypt(JSON.parse(data[i].accessible_message_key), messages[k].attachments[l].name)
			}
		}
	}

	self.postMessage(arguments);
};

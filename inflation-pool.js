"use strict";

var server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

function isValidSeed(seed) {
	try {
		StellarSdk.Keypair.fromSeed(seed);
		return true;
	} catch (error) {
		return false;
	}
}

function setInflationDest(seed, dest) {
	var key = StellarSdk.Keypair.fromSeed(seed);
	return server.loadAccount(key.accountId())
	.catch(function (err) {
		throw (err);
	})
	.then(function (account) {
		var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.setOptions({
            inflationDest: dest
        })).build();
		tx.sign(key);

		return server.submitTransaction(tx);
	});
}

function setInflationDestLedger(bip32Path, dest) {
  return StellarLedger.comm.create_async().then(function(comm) {
    var api = new StellarLedger.Api(comm);
    return api.getPublicKey_async(bip32Path).then(function (result) {
    	var publicKey = result.publicKey;
			return server.loadAccount(publicKey).then(function (account) {
        var tx = new StellarSdk.TransactionBuilder(account).addOperation(StellarSdk.Operation.setOptions({ inflationDest: dest })).build();
        return api.signTx_async(bip32Path, tx).then(function (result) {
          var keyPair = StellarSdk.Keypair.fromPublicKey(publicKey);
          var hint = keyPair.signatureHint();
          var decorated = new StellarSdk.xdr.DecoratedSignature({hint: hint, signature: result.signature});
          tx.signatures.push(decorated);
          return server.submitTransaction(tx);
        })
      })
    })
  });
}

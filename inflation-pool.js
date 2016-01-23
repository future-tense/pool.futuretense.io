var server = new StellarSdk.Server({
	secure:	true,
	hostname: 'horizon.stellar.org',
	port: 443
});
StellarSdk.Network.usePublicNetwork();

function setInflationDest(seed, dest) {
	var key = StellarSdk.Keypair.fromSeed(seed);
	return server.loadAccount(key.accountId())
	.then(function (account) {
		var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.setOptions({
            inflationDest: dest
        })).build();
		tx.sign(key);

		return server.submitTransaction(tx);
	});
}

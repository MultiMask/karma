var {Aes, PrivateKey, TransactionBuilder, TransactionHelper} = require('karmajs') 
var {Apis, ChainConfig} = require("karmajs-ws");

let karma_url = "wss://testnet-node.karma.red"

const prv = PrivateKey.fromWif('5K7uossVwbuWHunK4p1aGqBiJweYnujxC3zywpvfmCGQZdPdnAi');
const nonce = TransactionHelper.unique_nonce_uint64();
const tr = new TransactionBuilder();
const precision = 5;
const pubKey = 'KRMT7nKczna7E67Q5JntfeaKfhK3mTnZai6euTzj5tsfebW2W6iEmE';
const sum = 1000;

function toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

ChainConfig.networks.Karma = {
    core_asset:  'KRMT',
    address_prefix:  'KRMT',
    chain_id: 'e81bea67cebfe8612010fc7c26702bce10dc53f05c57ee6d5b720bbe62e51bef',
}


ChainConfig.setPrefix('KRMT')

let operationParams = {
    fee: {amount: 0, asset_id: '1.3.0'},
    from: '1.2.160',
    to: '1.2.148',
    amount: {amount: Math.floor(parseFloat(1000000000)), asset_id: '1.3.0'}, //sum*10**precision
};

let memo = null;

memo = {
    from: "KRMT7nKczna7E67Q5JntfeaKfhK3mTnZai6euTzj5tsfebW2W6iEmE" ,
    to: "KRMT6y4SbupANg4iPAQ9YNh7pSkTYTPcZ8e8tuDszZezCFDXiP25ie",
    nonce: nonce,
    message: toHex('bmqs15Gf9bC2Wq3Gx8TEAD9t7z7zVhXnum7'),
};

operationParams = { ...operationParams, memo }

console.log(operationParams);


Apis.instance(karma_url, true).init_promise.then(res =>
    {
        tr.add_type_operation(
            'transfer',
            operationParams,
        )
        
        tr.set_required_fees().then(x => {
            tr.add_signer(prv, pubKey);
            console.log("serialized transaction:", tr.serialize());
            tr.broadcast( x => {
                console.log("transaction done");
		console.log(x);
            });
        });
    })






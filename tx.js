var {Aes, PrivateKey, TransactionBuilder, TransactionHelper} = require('karmajs') 
var {Apis} = require("karmajs-ws");

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


let operationParams = {
    fee: {amount: 0, asset_id: '1.3.0'},
    from: '1.2.160',
    to: '1.2.148',
    amount: {amount: Math.floor(parseFloat(sum*10**precision)), asset_id: '1.3.0'},
};

let memo = null;
/* эта херь не работает ( ругается на from )
memo = {
    from: 'KRMT7nKczna7E67Q5JntfeaKfhK3mTnZai6euTzj5tsfebW2W6iEmE',
    to: 'KRMT6y4SbupANg4iPAQ9YNh7pSkTYTPcZ8e8tuDszZezCFDXiP25ie',
    nonce,
    message: toHex('testmsg'),
};

operationParams = { ...operationParams, memo }
*/

console.log(operationParams);

tr.add_type_operation(
    'transfer',
    operationParams,
);

Apis.instance(karma_url, true).init_promise.then(res =>
    {
        tr.set_required_fees().then(x => {
            tr.add_signer(prv, pubKey);
            console.log("serialized transaction:", tr.serialize());
            tr.broadcast(() => {
                console.log("transaction done");
            });
        });
    })
/*




tr.broadcast().then(e => e).catch((error) => {
    console.log(error.message)
});
*/
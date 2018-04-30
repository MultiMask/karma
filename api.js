var {PrivateKey} = require('karmajs')
var {ChainConfig} = require('karmajs-ws')
var request = require('request');

class Wallet {

  init(){
      // temp - only for testing algos
      ChainConfig.networks.Karma = {
          core_asset:  'KRMT',
          address_prefix:  'KRMT',
          chain_id: 'e81bea67cebfe8612010fc7c26702bce10dc53f05c57ee6d5b720bbe62e51bef',
      }
  
      ChainConfig.setPrefix('KRMT')
  }

  generateKeys(login, password) {

    let seed = `${login}active${password}`
    let prv = PrivateKey.fromSeed(seed)
    let privKey = prv.toWif()
    let pubKey = prv.toPublicKey()
        .toString()

    let seedOwner = `${login}owner${password}`
    let pubKeyOwner = PrivateKey.fromSeed(seedOwner)
        .toPublicKey()
        .toString()

    return {privKey, pubKey, pubKeyOwner}
  }

  create(login,pass) {
    console.log('cteate');

    let {pubKey, privKey, pubKeyOwner} = this.generateKeys(login,pass);

    request.post(
        'https://testnet-faucet.karma.red/api/v1/accounts',
        { json: {
            account: {
                name: login,
                owner_key: pubKeyOwner,
                active_key: pubKey,
                memo_key: pubKey,
                refcode: null,
                referrer : null,
            },
        } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body) //
            }
        }
    )

    this.privKey     = privKey;
    this.address     = login;
    this.pass        = pass;
    this.pubKey      = pubKey;
    this.pubKeyOwner = pubKeyOwner;
    /* chrome storage integration
    storage.set(KEY_PK, this.pk);
    storage.set(KEY_ADDRESS, this.address);
    storage.set(KEY_PASS, pass);
    */
  }



  auth(pass) {
    if (this.isAuth) {
      return true;
    }

    if (this.checkPass(pass)) {
      this.isAuth = true;
      return true;
    }

    return false;
  }

  checkPass(pass) {
    return this.pass == pass;
  }


  createTX({ to, amount, data }) {
    this.getInfo().then(({ output, balance, index }) => {

      // SEND signed Tx
      console.log("create TX with: ");
      // console.log('private: ', this.pk);
      // console.log('to: ', to);
      // console.log('amount: ', amount);
      // console.log('data: ', data);
      // console.log('output: ', output);
      // console.log('balance: ', balance);

      let SUM = balance;

      let testnet = bitcoin.networks.testnet;
      let bitcoin_payload = Buffer.from(data, 'utf8');
      let dataScript = bitcoin.script.nullData.output.encode(bitcoin_payload);
      let keyPair = bitcoin.ECPair.fromWIF(this.pk, testnet);

      let txb = new bitcoin.TransactionBuilder(testnet)
      txb.addInput(output, index);

      txb.addOutput(dataScript, 0)
      txb.addOutput(to, amount);
      txb.addOutput(this.address, SUM - amount - 5000);
      txb.sign(0, keyPair);

      axios.post('https://testnet.blockchain.info/pushtx', 'tx=' + txb.build().toHex()).then((data) => {
        console.log(data);
      })
    })
  }
  toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
  }

  getInfo() {
    const url = 'https://testnet.blockchain.info/rawaddr/';

    return axios.get(`${url}${this.address}`).then(res => {
      const lastOUT = res.data.txs[0];
      const outputIndex = lastOUT.out.findIndex(item => item.addr === this.address);

      console.log(outputIndex);
      console.log(res.data);

      return {
        index: outputIndex,
        address: res.data.address,
        output: lastOUT.hash,
        balance: res.data.final_balance,
        txs: res.data.txs
      }
    });
  }


}

const wallet = new Wallet();
wallet.init();
wallet.create('devmanapi10', 'password')
//export default wallet;
var bitcoin = require("bitcoinjs-lib");
var Mnemonic = require("bitcore-mnemonic");
var bip38 = require("bip38");
var {wif} = require("wif");

var axios = require('axios');

const URL_NODE = 'https://testnet.blockchain.info';

class BitcoinWallet {
  constructor() {}
  
  create(seed) {
    console.log('seed>', seed);
    this.mnemonic = new Mnemonic(seed);

    this.seed = this.mnemonic.toString();
    this.priv = this.mnemonic.toHDPrivateKey().privateKey.toWIF();

    console.log(this.seed);
    console.log(this.priv);
  }

  getSeed() {
    return this.seed;
  }

    init() {
        this.pk = 'cTzcdbnuVd6ho3bRqqLhdeqXdRqLCZM9qMgrZmurSHCpw8Z8xVhN'
        this.address = 'mn6jUWUt1s3DN5VzomgW8Cs9HeKf2o6UEh'
        this.pass = 'blank'

    }

   create_p(pwd) {
     const testnet = bitcoin.networks.testnet;
     const keyPair = bitcoin.ECPair.makeRandom({ network: testnet });

     this.pk = keyPair.toWIF();
     this.address = keyPair.getAddress();
     this.pass = pwd;

    console.log('private: ', this.pk);
    console.log('adr: ',      this.address);
       
   }

  /**
   * Depricated, testing
   */
  test() {
    // console.log('test');
    // const testnet = bitcoin.networks.testnet;
    // const keyPair = bitcoin.ECPair.makeRandom({ network: testnet });

    // const pass = '12345567ONE';

    // this.pk = keyPair.toWIF();
    // this.address = keyPair.getAddress();
    // this.pass = pass;

    // // console.log(testnet);
    // // console.log(keyPair);
    // console.log('private: ',this.pk);
    // // console.log(this.address);

    // let decoded = wif.decode(this.pk);

    // var encryptedKey = bip38.encrypt(
    //   decoded.privateKey,
    //   decoded.compressed,
    //   pass
    // );

    // console.log('encrypt', encryptedKey);

    // var decryptedKey = bip38.decrypt(encryptedKey, pass, function(status) {
    //   //   console.log(status.percent); // will print the precent every time current increases by 1000
    // });

    // console.log('decrypt',
    //   wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed)
    // );
  }

  getInfo() {

    return axios.get(`${URL_NODE}/rawaddr/${this.address}`).then(res => {
      
      const lastOUT = res.data.txs[0];
      const outputIndex = lastOUT.out.findIndex(item => item.addr === this.address);
      console.log(outputIndex)
      return {
        index: outputIndex,
        address: res.data.address,
        output: lastOUT.hash,
        balance: res.data.final_balance,
        txs: res.data.txs
      }
    });
  }

  createTX({ to, amount, data }) {
    this.getInfo().then(({ output, balance, index }) => {

      // SEND signed Tx
      console.log("create TX with: ");
       console.log('private: ', this.pk);
       console.log('to: ', to);
       console.log('amount: ', amount);
       console.log('data: ', data);
       console.log('output: ', output);
       console.log('balance: ', balance);

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

      console.log(txb.build().toHex())
      
      /* axios.post(`${URL_NODE}/pushtx`, 'tx=' + txb.build().toHex()).then((data) => {
        console.log(data);
      }).catch( x => console.log(x) ) */
    })
  }
}


let testbtc = new BitcoinWallet();
//testbtc.create_p('testfdsg')
testbtc.init();
testbtc.createTX({ to : 'mjwpsJcLGWX67FV9LhFkt3Ke6b2zEvDuUw' , amount: 100000 , data : 'k1.2.160'})
var {PrivateKey, TransactionHelper, TransactionBuilder } = require('karmajs')
//var {Aes, PrivateKey, TransactionBuilder, TransactionHelper} = require('karmajs') 

var {Apis, ChainConfig} = require("karmajs-ws");
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

      this.karma_url = "wss://testnet-node.karma.red"
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
              this.id          = body.account.id 
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

  getInfo(username) {

    const karma_url = "wss://testnet-node.karma.red"
    //'devman10'
    const ret = {
      id : "1.2.148",
      memo_key : "KRMT6y4SbupANg4iPAQ9YNh7pSkTYTPcZ8e8tuDszZezCFDXiP25ie"
    }
    return ret;
    /*
    return Apis.instance(karma_url, true).init_promise.then(res =>
    {
        console.log(res)
        
    }).then(
      return Apis.instance().db_api().exec("get_account_by_name", [username])
        .then(x => { console.log(x) } )
        .catch(x => console.log(x))
    ) */
  }

  createTX({ to, amount, asset_id, data }) {
      let toData = this.getInfo(to)
      // SEND signed Tx
      console.log("create TX with: ");
      // console.log('private: ', this.pk);
      // console.log('to: ', to);
      // console.log('amount: ', amount);
      // console.log('data: ', data);
      // console.log('output: ', output);
      // console.log('balance: ', balance);

      let prv = PrivateKey.fromWif(this.privKey);
      let nonce = TransactionHelper.unique_nonce_uint64();
      let tr = new TransactionBuilder();
      let precision = 5; // todo getPricisionById()
      //onst pubKey = this.pubKey;

      let operationParams = {
        fee: {amount: 0, asset_id: '1.3.0'},
        from: this.id,
        to: toData.id,
        amount: {amount: Math.floor(parseFloat(amount*10**precision)), asset_id: asset_id}, //
      };

      let memo = {
          from: this.pubKey ,
          to: toData.memo_key,
          nonce: nonce,
          message: this.toHex(data),
      };
      operationParams = { ...operationParams, memo }

      Apis.instance(this.karma_url, true).init_promise.then(res =>
        {
            tr.add_type_operation(
                'transfer',
                operationParams,
            )
            
            tr.set_required_fees().then(x => {
                tr.add_signer(this.privKey, this.pubKey);
                console.log("serialized transaction:", tr.serialize());
                tr.broadcast( x => {
                    console.log("transaction done");
                    console.log(x);
                });
            });
        })
    
  }

  toHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
  }




}

const wallet = new Wallet();
wallet.init();
wallet.create('devmanapi11', 'password')
wallet.createTX( { to : 'devman10', amount : 1000, asset_id : '1.3.0', data : 'testdata' })
//console.log(wallet.getInfo('devman10'))
//export default wallet;
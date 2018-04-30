var {Apis} = require("karmajs-ws");
let karma_url = "wss://testnet-node.karma.red"

Apis.instance(karma_url, true).init_promise.then(res =>
{
    return Apis.instance().db_api().exec("get_account_by_name", ['devmanapi10'])
    .then(x =>  console.log(x))
    .catch(x => console.log(x))
})

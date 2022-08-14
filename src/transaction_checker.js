const axios = require('axios').default;
const crypto = require("crypto-js");
const base_url = "https://api1.binance.com";
require('dotenv').config()
const default_endpoint = "/sapi/v1/capital/deposit/hisrec";
const binance_api = process.env.BINANCE_API;
const binance_secret = process.env.BINANCE_SECRET;

const getTransactionList = async (endpoint = default_endpoint)=>{
    const timestamp = Date.now();
    const hash = crypto.HmacSHA256(`timestamp=${timestamp}`, binance_secret);
    const signature = crypto.enc.Hex.stringify(hash);
    const req_config = {
        method: "get",
        headers: {
          "X-MBX-APIKEY" : binance_api
        },
        url: base_url + endpoint + `?timestamp=${timestamp}` + '&signature=' + signature,
      };
      
      const result = await axios(req_config);
      console.log(result.data);
}

module.exports = getTransactionList;
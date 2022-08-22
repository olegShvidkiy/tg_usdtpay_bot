const axios = require('axios').default;
const crypto = require("crypto-js");
const base_url = "https://apilist.tronscan.org";;
require('dotenv').config()
const endpoint = "/api/transaction";
const wallet = process.env.WALLETUSDT;
const binance_secret = process.env.BINANCE_SECRET;

const getTransactionList = async (payment)=>{
  const limit = 50;
  let i = 0;
  let result;
  console.log(payment)
  do{
      const req_config = {
        method: "get",
        url: base_url + endpoint + `?count=true&limit=${limit}&start=${i}&address=${wallet}`,
      };
      
      try{
        result = await axios(req_config);
        //console.log("res", 2<=result.data.total)
        for( let j = 0; j<result.data.total; j++){
          const findPayment = checkSinglePayment(result.data.data[j], payment.unique_code);
          console.log(findPayment, payment.unique_code)
          if(findPayment) return findPayment;
        }

      }catch(err){console.log(err)}
      i++;
  }while(limit*i <= result.data.total);
  
}


const checkSinglePayment = (payment, unique_code)=>{
  const value = payment.trigger_info.parameter._value;
  const decimal = payment.tokenInfo.tokenDecimal;
  console.log(Number(value)/Math.pow(10, decimal), unique_code)
  return value.endsWith(unique_code) && (Number(value)/Math.pow(10, decimal)).toFixed(6) == `19.00${unique_code}`;
}

module.exports = getTransactionList;
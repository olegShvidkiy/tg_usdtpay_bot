const axios = require('axios').default;
const base_url = "https://apilist.tronscan.org";
require('dotenv').config()
const endpoint = "/api/transaction";
const wallet = process.env.WALLETUSDT;

const getTransactionList = async (payment)=>{
  const limit = 50;
  let i = 0;
  let result;
  do{
      const req_config = {
        method: "get",
        url: base_url + endpoint + `?count=true&limit=${limit}&start=${i}&address=${wallet}`,
      };
      
      try{
        result = await axios(req_config);
        const to = result.data.total>limit ? limit : result.data.total;
        for( let j = 0; j < to; j++){
          const findPayment = checkSinglePayment(result.data.data[j], payment.unique_code);
          if(findPayment) return findPayment;
        }
      }catch(err){console.log(err)}
      i++;
  }while(limit*i <= result.data.total);
}

const checkSinglePayment = (payment, unique_code)=>{
  const value = payment?.trigger_info.parameter._value;
  const decimal = payment?.tokenInfo.tokenDecimal;
  if(value && decimal){
    return value.endsWith(unique_code) && (Number(value)/Math.pow(10, decimal)).toFixed(6) == `19.00${unique_code}`;
  }
  
}

module.exports = getTransactionList;
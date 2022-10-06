const axios = require('axios').default;
const base_url = "https://apilist.tronscan.org";
require('dotenv').config()
const endpoint = "/api/transaction";
const wallet = process.env.WALLETUSDT;

const getTransactionList = async (payment)=>{
  const limit = 50;
  let i = 0;
  let result;
  const paymentStartTimestamp = new Date(payment.start_date).getTime();
  //можем получать только 50 транзакций за запрос, поэтому в запросе получаем по 50 платежей по очереди из всего списка за каждую итерацию, пока не найдем нужный платеж или не упремся во время начала платежа
  do{
      const req_config = {
        method: "get",
        url: base_url + endpoint + `?count=true&sort=timestamp&limit=${limit}&start=${i*limit}&address=${wallet}`,
      };
      console.log(`PAYMENT LIST ${i+1} check.`)
      try{
        result = await axios(req_config);
        const to = result?.data?.total>limit ? limit : result?.data?.total;
        for( let j = 0; j < to; j++){
          if(result?.data?.data[j].timestamp<paymentStartTimestamp) return false;
          const findPayment = checkSinglePayment(result?.data?.data[j], payment?.unique_code);
          if(findPayment) {
            const hash = result?.data?.data[j]?.hash ? result?.data?.data[j]?.hash : findPayment;
            return hash;
          }
        }
      }catch(err){console.log(err)}
      i++;
  }while(limit*i <= result?.data?.total);
}

const checkSinglePayment = (payment, unique_code)=>{
  const value = payment?.trigger_info?.parameter?._value;
  const decimal = payment?.tokenInfo?.tokenDecimal;
  if(value && decimal){
    console.log("payment info", value, (Number(value)/Math.pow(10, decimal)).toFixed(6), `19.00${unique_code}`);
    const sum = Number(value)/Math.pow(10, decimal);
    return value.endsWith(unique_code) && sum.toFixed(6).endsWith(unique_code) && sum>=18.2;
  }
  
}

module.exports = getTransactionList;
// data.js
import { Map } from 'immutable';

let formData = {
  user:{
    name:'',
    shippingAddress:'',
    username:''
  },
  cart:[{
    quantity:5,
    item:'Bertie Botts Every Flavour Beans'
  }, {
    quantity:1,
    item:'Cauldron'
  }, {
    quantity:1,
    item:'Nimbus 2000'
  }, {
    quantity:3,
    item:'Robe'
  }]
}

export function GetData(){
  return formData;
}

export async function UpdateData(data){
  await new Promise((res)=>setTimeout(res,3000));
  formData = data.toJS();
}

export function GetStockNames(){
  return [
    'Bertie Botts Every Flavour Beans',
    'Cauldron',
    'Nimbus 2000',
    'Robe',
    'Invisible Cloak'
  ];
}

export function NewCartItem(){
  return new Map({item:'',quantity:1});
}

export function CheckUsernameIsAvailable({value}){
  return new Promise((res,rej)=>{
    setTimeout(()=>{
      if(value.match(/^.*\d.*$/) !== null){
        res({
          status:'VALID'
        });
      }else{
        res({
          status:'INVALID',
          message:'Username should contain a number'
        })
      }

    }, 3000);
  })
}

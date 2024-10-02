// cloudfunctions/login/index.js

const cloud = require('wx-server-sdk');
cloud.init({
  env: 'fufubuff-3gt0b01y042179cc' // 确保与小程序端一致，或不指定（默认使用小程序的默认环境）
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  console.log('wxContext:', wxContext); // 添加日志
  return {
    openid: wxContext.OPENID,
  };
};

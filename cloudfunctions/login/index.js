// cloudfunctions/login/index.js  
const cloud = require('wx-server-sdk');  
cloud.init({  
  env: 'fufubuff-3gt0b01y042179cc'  
});  
  
const db = cloud.database(); // 初始化数据库  
  
exports.main = async (event, context) => {  
  const { nickname, password } = event;  
  
  try {  
    const user = await db.collection('users').where({  
      nickname: nickname,  
      password: password  
    }).get();  
  
    if (user.data.length > 0) {  
      // 假设您的用户集合中有一个字段叫_id，您可以返回这个字段作为用户的唯一标识  
      return { userId: user.data[0].openid };  
    } else {  
      return { error: '用户信息不匹配' };  
    }  
  } catch (error) {  
    console.error('数据库查询失败', error);  
    return { error: '内部错误' };  
  }  
};
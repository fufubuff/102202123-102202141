// 云函数入口文件  
const cloud = require('wx-server-sdk');  
  
cloud.init();  
  
const db = cloud.database();  
  
// 云函数入口函数  
exports.main = async (event, context) => {  
  const wxContext = cloud.getWXContext();  
  const openid = wxContext.OPENID; // 获取用户的 openid  
  
  try {  
    const user = await db.collection('users').where({  
      openid: openid  
    }).getOne();  
  
    if (user) {  
      // 用户存在，返回用户信息  
      return {  
        name: user.data.name || '',  
        avatarUrl: user.data.avatarUrl || '',  
        college: user.data.college || '',  
        major: user.data.major || '',  
        degree: user.data.degree || '',  
        researchAreas: user.data.researchAreas || '',  
        signature: user.data.signature || '',  
        password: user.data.password || ''  
      };  
    } else {  
      // 用户不存在，返回空信息或默认值  
      return {  
        name: '',  
        avatarUrl: '',  
        college: '',  
        major: '',  
        degree: '',  
        researchAreas: '',  
        signature: '',  
        password: ''  
      };  
    }  
  } catch (error) {  
    console.error('Error getting user info:', error);  
    return {  
      error: 'Failed to get user info'  
    };  
  }  
};
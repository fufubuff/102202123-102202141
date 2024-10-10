const cloud = require('wx-server-sdk');

cloud.init({
  env: 'fufubuff-3gt0b01y042179cc'
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { nickname, password } = event;

  // 查询用户信息
  const db = cloud.database();
  const users = db.collection('users');
  
  try {
    const res = await users.where({
      nickname: nickname,
      password: password // 注意：实际应用中，密码应进行加密处理
    }).get();

    if (res.data.length > 0) {
      return { openid: res.data[0].openid };
    } else {
      return { error: '学工号或密码错误' };
    }
  } catch (err) {
    console.error('查询用户失败', err);
    return { error: '查询用户失败，请稍后再试' };
  }
};
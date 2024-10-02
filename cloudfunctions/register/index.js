// cloudfunctions/register/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'fufubuff-3gt0b01y042179cc' // 使用当前环境
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { nickname, password, avatarUrl } = event;

  console.log('云函数 register 接收到的数据:', event);

  // 输入验证
  if (!nickname || !password) {
    console.log('昵称和密码不能为空');
    return {
      success: false,
      message: '昵称和密码不能为空'
    };
  }

  if (password.length < 8) {
    console.log('密码长度不足');
    return {
      success: false,
      message: '密码至少8位'
    };
  }

  const openid = cloud.getWXContext().OPENID;

  console.log('当前用户的 openid:', openid);

  try {
    // 检查用户是否已存在
    try {
      await db.collection('users').doc(openid).get();
      // 如果获取到数据，说明用户已存在
      console.log('用户已存在');
      return {
        success: false,
        message: '用户已注册'
      };
    } catch (err) {
      if (err.errCode === -1 && err.errMsg.includes('does not exist')) {
        // 用户不存在，可以继续注册
        console.log('用户不存在，可以注册');
      } else {
        // 其他错误，返回注册失败
        console.error('查询用户失败:', err);
        return {
          success: false,
          message: '注册失败，请稍后再试'
        };
      }
    }

    // 添加新用户
    await db.collection('users').doc(openid).set({
      data: {
        openid: openid,
        nickname: nickname,
        password: password, // 建议对密码进行哈希处理
        avatarUrl: avatarUrl || '/images/default-avatar.jpg',
        createdAt: db.serverDate() // 使用数据库服务器时间
      }
    });

    console.log('用户注册成功');

    return {
      success: true,
      message: '注册成功'
    };
  } catch (err) {
    console.error('注册失败:', err);
    return {
      success: false,
      message: '注册失败，请稍后再试'
    };
  }
};

// 引入微信服务器 SDK
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init({
  env: 'fufubuff-3gt0b01y042179cc' // 根据实际情况设置环境ID
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext(); // 获取调用者的 openid
  const { contact, peopleNeeded, projectDescription, personNeed, keywords } = event;

  try {
    // 向数据库添加数据
    const result = await db.collection('teamRecruitments').add({
      data: {
        openid: OPENID, // 使用云函数的OPENID，确保数据的安全性
        contact: contact,
        peopleNeeded: peopleNeeded,
        projectDescription: projectDescription,
        personNeed: personNeed,
        keywords: keywords,
        createdAt: new Date() // 记录创建时间
      }
    });

    return {
      success: true,
      id: result._id, // 返回新创建记录的 _id
      message: 'Recruitment details saved successfully'
    };
  } catch (error) {
    console.error('Failed to save recruitment details:', error);
    return {
      success: false,
      message: 'Failed to save recruitment details'
    };
  }
}

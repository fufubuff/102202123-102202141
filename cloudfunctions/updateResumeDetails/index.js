// 引入微信服务器 SDK
const cloud = require('wx-server-sdk')

// 初始化云环境（替换为你自己的环境ID）
cloud.init({
  env: 'fufubuff-3gt0b01y042179cc'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { openid, intentProject, major, skills, contactInfo, selfIntroduction } = event

  try {
    // 尝试更新记录
    const updateResult = await db.collection('resumes').where({ openid }).update({
      data: {
        intentProject: intentProject,
        major: major,
        skills: skills,
        contactInfo: contactInfo,
        selfIntroduction: selfIntroduction,
        updatedAt: new Date()
      }
    })

    // 如果没有更新任何记录，说明可能不存在，尝试添加新记录
    if (updateResult.stats.updated === 0) {
      await db.collection('resumes').add({
        data: {
          openid: openid,
          intentProject: intentProject,
          major: major,
          skills: skills,
          contactInfo: contactInfo,
          selfIntroduction: selfIntroduction,
          createdAt: new Date()
        }
      })
    }

    return {
      success: true,
      message: '更新或创建简历信息成功'
    }
  } catch (error) {
    console.error('更新或创建简历信息失败：', error)
    return {
      success: false,
      message: '更新或创建简历信息失败',
      error: error
    }
  }
}

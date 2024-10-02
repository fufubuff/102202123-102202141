// cloudfunctions/messageSecCheck/index.js

const cloud = require('wx-server-sdk');
cloud.init({
  env: 'fufubuff-3gt0b01y042179cc'
}
);

exports.main = async (event, context) => {
  const { content } = event;
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: content
    });
    return result;
  } catch (err) {
    return err;
  }
};

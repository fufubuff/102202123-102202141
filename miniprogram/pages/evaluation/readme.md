# Evaluation Page - 用户评价页面

## 概述
此页面提供了用户对其他用户进行评价的功能。用户可以对合作伙伴的工作表现给出等级评分和详细评论。

## 页面功能

### 数据模型 (`data`)
- `rating`: 用户给出的评分（1-5星）。
- `content`: 用户填写的评价内容。
- `evaluatorOpenid`: 评价人（当前用户）的`openid`。
- `targetOpenid`: 被评价人的`openid`。
- `ratingText`: 根据评分生成的文本描述。

### 主要方法和逻辑

#### 页面加载 (`onLoad`)
- 获取URL参数中传递的`targetOpenid`，并从本地存储中检索当前用户的`openid`。
- 验证获取的`openid`，若不存在则提示错误并返回上一页。

#### 选择评分 (`selectRating`)
- 用户点击评分按钮时触发，根据所选评分更新页面数据，并改变提交按钮颜色。

#### 更新输入字段 (`updateField`)
- 当用户在输入框中输入内容时，更新对应的页面数据。

#### 提交评价 (`submitEvaluation`)
- 在提交前验证评分的有效性和评价内容的完整性。
- 调用数据库添加操作，将评价信息保存到`cooperationReviews`集合中。
- 提交成功后提示用户，并返回上一页。

### 辅助函数

#### 时间格式化 (`formatTime`)
- 将JavaScript的`Date`对象格式化为`YYYY-MM-DD HH:MM`的形式。
# Avatar Selection Page - 选择头像页面

## 页面概述
这个页面允许用户更改他们的个人头像，提供了一系列预设的头像供用户选择。用户可以查看当前头像，并从提供的头像库中选择一个新的头像。

## 数据模型 (`data`)
- `currentAvatar`: 当前用户的头像。
- `defaultAvatars`: 一个包含所有可选头像URL的数组。
- `selectedAvatar`: 用户选定的新头像。
- `openid`: 用户的唯一标识，用于头像更新操作。

## 页面加载逻辑 (`onLoad`)
- 在页面加载时，尝试从本地存储获取用户的 `openid`。
- 设置当前头像和选定头像为传递到页面的头像或默认头像。

## 功能方法

### 选择头像 (`selectAvatar`)
- **功能描述**：用户点击任何一个头像时，此函数会被触发。
- **实现逻辑**：更新 `selectedAvatar` 数据绑定，从而改变被选中头像的视觉效果。

### 确认选择 (`confirmSelection`)
- **功能描述**：用户确认选择后的逻辑处理。
- **实现逻辑**：
  - 检查 `openid` 是否存在。
  - 若不存在，则调用云函数 `login` 获取 `openid`。
  - 存在或获取后，调用 `updateAvatar` 方法更新用户头像信息到数据库。
  - 更新成功后返回上一页并更新该页的头像显示。

### 更新头像 (`updateAvatar`)
- **功能描述**：负责将选定的头像更新到数据库。
- **实现逻辑**：
  - 使用 `openid` 定位数据库中的用户记录。
  - 更新 `avatarUrl` 字段。
  - 更新成功后显示成功提示，并使上一页的头像更新。

## 组件结构
- **当前头像显示**：显示当前用户头像。
- **头像选择区域**：动态生成所有可选择的头像。
- **确认按钮**：用户点击后触发确认选择逻辑。


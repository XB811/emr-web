<template>
  <div class="login-container">
    <div class="content-wrapper">
      <!-- 左侧公告区域 -->
      <div class="notice-container">
        <div class="notice-title">
          <h3>系统公告</h3>
        </div>
        <div class="notice-list">
          <div v-if="notices.length === 0" class="no-notice">
            暂无公告
          </div>
          <div v-else v-for="notice in notices" :key="notice.id" class="notice-item">
            <div class="notice-header">
              <h4>{{ notice.title }}</h4>
              <div class="notice-info">
                <span>{{ notice.adminName }}</span>
                <span>{{ formatDate(notice.updateTime || notice.createTime) }}</span>
              </div>
            </div>
            <div class="notice-content">
              {{ notice.content }}
            </div>
          </div>
        </div>
        <div class="notice-pagination">
          <el-pagination
            small
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="size"
            :current-page.sync="currentPage"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-form-container">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left" @keyup.enter.native="handleLogin">
          <div class="title-container">
            <h3 class="title">登录</h3>
          </div>

          <!-- 表单 -->
          <el-form-item prop="usernameOrPhone">
            <!-- user图片 -->
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <!-- usernameOrPhone输入框 -->
            <el-input
              ref="usernameOrPhone"
              v-model="loginForm.usernameOrPhone"
              placeholder="请输入用户名或手机号"
              name="usernameOrPhone"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <!-- 密码框 同上 -->
          <el-form-item prop="password">
            <!-- 密码icon -->
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <!-- 密码输入框 根据type 确定前端密码是否显示-->
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <!-- 控制密码是否显示的按钮 -->
            <span class="show-pwd" @click="showPwd">
              <!-- 根据passwordType 显示不同的图标 -->
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>

          <!-- 选择用户类型 -->
          <el-form-item style="border:none;background:none;padding: 0;">
            <!-- 绑定userType -->
            <el-radio-group v-model="loginForm.userType">
              <label style="color: #fff; font-size: 14px; margin-bottom: 8px; text-align: left;">用户类型：</label>
              <el-radio label="admin">管理员</el-radio>
              <el-radio label="doctor">医生</el-radio>
              <el-radio label="patient">患者</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 确认按钮 -->
          <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>
          <div class="registration-link">
          <router-link to="/registration">立即注册</router-link>
          </div>
        </el-form>

      </div>
    </div>
  </div>
</template>

<script>
import {validPassword, validUsername} from '@/utils/validate'
import { pageQuery } from '@/api/notice'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('用户名或手机号不合法'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error('密码至少包含字母、数字、特殊字符，长度为6-16位'))
      } else {
        callback()
      }
    }
    return {
      // 公告相关数据
      notices: [],
      currentPage: 1,
      size: 6,
      total: 0,

      loginForm: {
        usernameOrPhone: process.env.NODE_ENV === 'development' ? 'root' : '',
        password: process.env.NODE_ENV === 'development' ? 'XBf20042611.' : '',
        userType: process.env.NODE_ENV === 'development' ? 'admin' : 'patient' // 添加用户类型，默认为管理员
      },
      // 表单验证规则 与el-form的:rules绑定
      loginRules: {
        // username 必填 输入框失去焦点时验证 使用validateUsername校验参数是否合法
        usernameOrPhone: [{required: true,trigger: 'blur',message:'用户名或手机号不能为空'},
          { required: true, trigger: 'blur', validator: validateUsername }],
        // password 必填 输入框失去焦点时验证 使用validatePassword校验参数是否合法
        password: [{required: true,trigger: 'blur',message:'密码不能为空'},
          { required: true, trigger: 'blur', validator: validatePassword }],
        // userType 必填 选择框改变时验证 没有校验函数
        userType: [{ required: true, trigger: 'change' }]
      },
      // 控制登录按键的加载状态，防止用户重复点击
      loading: false,
      // 控制密码框的显示类型，默认为password
      passwordType: 'password',
      // 存储用户未登录时访问的页面地址，用于登录后重定向跳转
      redirect: undefined
    }
  },
  // 监听路由变化，获取路由中的 redirect 参数
  // 如果用户在未登录状态下访问了某个需要登录的页面，系统会将该页面路径存储在 redirect 参数中
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // 页面创建时加载公告数据
    this.fetchNotices()
  },
  methods: {
    // 格式化日期显示
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}年${month}月${day}日 ${hours}:${minutes}`
    },

    // 获取公告数据
    fetchNotices() {
      pageQuery({}, this.currentPage - 1, this.size).then(response => {
        if (response.code === '0') {
          this.notices = response.data.records || []
          this.total = response.data.total || 0
        } else {
          this.$message.error('获取公告失败')
        }
      }).catch(() => {
        this.$message.error('获取公告失败')
      })
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchNotices()
    },

    // 显示密码 触发该函数后将passwordType 置为与当前相反的值
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      // 让光标聚焦在密码框上
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },

    // 登录函数
    handleLogin() {
      // 表单验证
      this.$refs.loginForm.validate(valid => {
        // 表单验证通过
        if (valid) {
          // 启用加载状态，防止重复点击
          this.loading = true
          // 触发 src/store/modules/user.js 中的 login 函数
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            // 登录成功后跳转到目标页面
            // 如果没有目标页面，则跳转到首页
            this.$router.push({ path: this.redirect || '/' })
            // 关闭加载状态
            this.loading = false
          }).catch(() => {
            // 登录失败处理
            this.loading = false // 关闭加载状态
          })
        } else {
          // 表单验证失败
          console.log('用户名或密码不合法')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

  .el-pagination {
    text-align: center;
    margin-top: 10px;

    button, .el-pager li {
      background-color: rgba(255, 255, 255, 0.1);
      color: $light_gray;
      border: none;

      &.active {
        background-color: #409EFF;
        color: white;
      }

      &:hover:not(.disabled) {
        color: #409EFF;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .content-wrapper {
    display: flex;
    width: 90%;
    max-width: 1200px;
    margin: 50px auto;
    height: calc(100vh - 100px);
    justify-content: space-between;
  }

  .notice-container {
    width: 48%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    padding: 20px;
    color: $light_gray;
    display: flex;
    flex-direction: column;

    .notice-title {
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
      margin-bottom: 15px;

      h3 {
        font-size: 22px;
        margin: 0;
      }
    }

    .notice-list {
      flex: 1;
      overflow-y: auto;

      .no-notice {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 16px;
        color: $dark_gray;
      }

      .notice-item {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 15px;

        .notice-header {
          margin-bottom: 10px;

          h4 {
            margin: 0 0 8px;
            font-size: 16px;
            color: #fff;
          }

          .notice-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: $dark_gray;
          }
        }

        .notice-content {
          line-height: 1.6;
          font-size: 14px;
          white-space: pre-line;
          color: $light_gray;
        }
      }
    }
  }

  .login-form-container {
    width: 48%;
    display: flex;
    justify-content: center;
  }

  .login-form {
    width: 400px;
    max-width: 100%;
    padding: 35px;
    margin: 0 auto;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .registration-link {
    text-align: center;
    margin-bottom: 10px;
    color: $dark_gray;
    font-size: 14px;
    margin-left: 80%;
    a {
      color: #409EFF;
      text-decoration: none;
      margin-left: 5px;
      transition: all 0.3s;

      &:hover {
        color: #66b1ff;
        text-decoration: underline;
      }
    }
  }

  .el-radio-group {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
  }

  .el-radio {
    color: $light_gray;
    margin-right: 0;
  }
}

@media screen and (max-width: 992px) {
  .login-container {
    .content-wrapper {
      flex-direction: column;
      height: auto;
    }

    .notice-container, .login-form-container {
      width: 100%;
      margin-bottom: 20px;
    }

    .notice-container {
      height: 300px;
    }
  }
}
</style>

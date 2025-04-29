<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

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

      <!-- <div class="tips">
        <span style="margin-right:20px;">usernameOrPhone: admin</span>
        <span> password: any</span>
      </div> -->

    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'

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
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度在6到20个字符之间'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        usernameOrPhone: 'root',
        password: '123456',
        userType: 'admin' // 添加用户类型，默认为管理员
      },
      // 表单验证规则 与el-form的:rules绑定
      loginRules: {
        // username 必填 输入框失去焦点时验证 使用validateUsername校验参数是否合法
        usernameOrPhone: [{ required: true, trigger: 'blur', validator: validateUsername }],
        // password 必填 输入框失去焦点时验证 使用validatePassword校验参数是否合法
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
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
  methods: {
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
    // TODO 修改登录api
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

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
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
</style>

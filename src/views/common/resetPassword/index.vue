<template>
  <div class="reset-password-container">
    <div class="reset-form-container">
      <div class="title-container">
        <h3 class="title">密码重置</h3>
      </div>

      <el-form ref="resetForm" :model="resetForm" :rules="resetRules" class="reset-form" label-position="top">
        <!-- 手机号输入框 -->
        <el-form-item prop="phone" label="手机号">
          <el-input
            ref="phoneInput"
            v-model="resetForm.phone"
            placeholder="请输入手机号"
            name="phone"
            type="text"
            tabindex="1"
            autocomplete="off"
          />
        </el-form-item>

        <!-- 验证码输入框 -->
        <el-form-item prop="code" label="验证码">
          <div class="verify-code-container">
            <el-input
              ref="codeInput"
              v-model="resetForm.code"
              placeholder="请输入验证码"
              name="code"
              type="text"
              tabindex="2"
              autocomplete="off"
              class="verify-code-input"
            />
            <el-button
              type="primary"
              class="verify-code-button"
              :disabled="cooldown > 0 || !resetForm.phone"
              @click="getVerifyCode"
            >
              {{ cooldown > 0 ? `${cooldown}s后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password" label="新密码">
          <el-input
            ref="passwordInput"
            v-model="resetForm.password"
            placeholder="请输入新密码"
            name="password"
            :type="passwordType"
            tabindex="3"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>

        <!-- 用户类型选择 -->
        <el-form-item prop="userType" label="用户类型">
          <el-radio-group v-model="resetForm.userType">
            <el-radio label="admin">管理员</el-radio>
            <el-radio label="doctor">医生</el-radio>
            <el-radio label="patient">患者</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 确认按钮 -->
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%; margin-top: 10px;"
            @click.native.prevent="handleReset"
          >
            确认重置
          </el-button>
        </el-form-item>

        <!-- 返回登录链接 -->
        <div class="login-link">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getVerifyCode, resetPassword } from '@/api/user'
import { validPhone, validPassword } from '@/utils/validate'

export default {
  name: 'ResetPassword',
  data() {
    // 手机号验证
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!validPhone(value)) {
        callback(new Error('请输入正确的手机号格式'))
      } else {
        callback()
      }
    }

    // 验证码验证
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else if (!/^\d{6}$/.test(value)) {
        callback(new Error('验证码为6位数字'))
      } else {
        callback()
      }
    }

    // 密码验证
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (!validPassword(value)) {
        callback(new Error('密码至少包含字母、数字、特殊字符，长度为6-16位'))
      } else {
        callback()
      }
    }

    return {
      resetForm: {
        phone: '',
        code: '',
        password: '',
        userType: ''
      },
      resetRules: {
        phone: [
          { required: true, trigger: 'blur', validator: validatePhone }
        ],
        code: [
          { required: true, trigger: 'blur', validator: validateCode }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        userType: [
          { required: true, trigger: 'change', message: '请选择用户类型' }
        ]
      },
      passwordType: 'password',
      loading: false,
      cooldown: 0,
      timer: null
    }
  },
  computed: {
    // 计算密码强度
    passwordStrength() {
      const password = this.resetForm.password
      if (!password) return 0

      let strength = 0
      // 检查长度
      if (password.length >= 8) strength += 1
      // 检查字母
      if (/[a-zA-Z]/.test(password)) strength += 1
      // 检查数字
      if (/\d/.test(password)) strength += 1
      // 检查特殊字符
      if (/[^a-zA-Z0-9]/.test(password)) strength += 1

      return strength
    },
    // 密码强度文本
    strengthText() {
      const strengthMap = ['弱', '中等', '强', '非常强']
      return strengthMap[Math.min(this.passwordStrength - 1, 3)]
    },
    // 密码强度样式类
    strengthClass() {
      return `level-${this.passwordStrength}`
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 显示/隐藏密码
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.passwordInput.focus()
      })
    },

    // 获取验证码
    getVerifyCode() {
      this.$refs.resetForm.validateField('phone', (err) => {
        if (err) return

        this.loading = true
        getVerifyCode(this.resetForm.phone, this.resetForm.userType)
          .then(response => {
            if (response.code === '0') {
              this.$message.success('验证码已发送，请注意查收')
              // 开始倒计时
              this.cooldown = 60
              this.timer = setInterval(() => {
                if (this.cooldown > 0) {
                  this.cooldown--
                } else {
                  clearInterval(this.timer)
                }
              }, 1000)
            } else {
              this.$message.error(response.message || '验证码发送失败')
            }
          })
          .catch(error => {
            this.$message.error('验证码发送失败，请稍后再试')
            console.error('获取验证码错误:', error)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    // 重置密码
    handleReset() {
      this.$refs.resetForm.validate(valid => {
        if (valid) {
          this.loading = true
          const data = {
            phone: this.resetForm.phone,
            code: this.resetForm.code,
            password: this.resetForm.password
          }

          resetPassword(data, this.resetForm.userType)
            .then(response => {
              if (response.code === '200') {
                this.$message({
                  type: 'success',
                  message: '密码重置成功，请使用新密码登录',
                  duration: 5000
                })

                setTimeout(() => {
                  this.$router.push('/login')
                }, 1500)
              } else {
                this.$message.error(response.message || '密码重置失败')
              }
            })
            .catch(error => {
              this.$message.error('密码重置失败，请稍后再试')
              console.error('重置密码错误:', error)
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.reset-password-container {
  height: 100%;
  width: 100%;
  background-color: #2d3a4b;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .reset-form-container {
    width: 520px;
    max-width: 100%;
    padding: 35px;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .title-container {
    .title {
      font-size: 26px;
      color: #fff;
      margin: 0px auto 30px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .reset-form {
    .el-form-item {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #fff;

      &.el-form-item--feedback {
        margin-bottom: 22px;
      }

      .el-form-item__label {
        color: #fff;
      }
    }

    .el-input {
      display: inline-block;
      height: 47px;
      width: 100%;

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: #fff;
        height: 47px;
        caret-color: #fff;

        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px #283443 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      }
    }
  }

  .verify-code-container {
    display: flex;
    align-items: center;

    .verify-code-input {
      flex: 1;
      margin-right: 10px;
    }

    .verify-code-button {
      width: 140px;
      height: 47px;
    }
  }

  .password-strength {
    margin-top: 10px;
    display: flex;
    align-items: center;
    color: #fff;

    .strength-bar {
      width: 100px;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      margin: 0 10px;
      overflow: hidden;

      .strength-level {
        height: 100%;
        transition: width 0.3s ease;

        &.level-1 {
          width: 25%;
          background-color: #F56C6C;
        }

        &.level-2 {
          width: 50%;
          background-color: #E6A23C;
        }

        &.level-3 {
          width: 75%;
          background-color: #909399;
        }

        &.level-4 {
          width: 100%;
          background-color: #67C23A;
        }
      }
    }

    .strength-text {
      font-size: 12px;
    }
  }

  .login-link {
    text-align: center;
    margin-top: 20px;

    a {
      color: #409EFF;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .el-radio-group {
    width: 100%;
    display: flex;
    justify-content: space-around;

    .el-radio {
      color: #fff;
      margin-right: 0;
    }
  }
}
</style>

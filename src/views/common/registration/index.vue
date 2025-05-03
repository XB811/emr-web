<template>
  <div class="registration-container">
    <el-card class="registration-card" shadow="never">
      <div slot="header" class="card-header">
        <h2>患者注册</h2>
      </div>

      <patient-change
        ref="patientChangeForm"
        create-or-update="create"
        user-type="patient"
        :id="null"
        @update-success="handleRegisterSuccess"
      />

      <div class="form-actions">
        <el-button type="primary" @click="submitRegistration">立即注册</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>

      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import PatientChange from '@/components/user/change/patientChange'

export default {
  name: 'Registration',
  components: {
    PatientChange
  },
  data() {
    return {}
  },
  methods: {
    submitRegistration() {
      if (this.$refs.patientChangeForm) {
        this.$refs.patientChangeForm.submitForm()
      }
    },
    resetForm() {
      if (this.$refs.patientChangeForm) {
        this.$refs.patientChangeForm.resetFormValidation()
      }
    },
    handleRegisterSuccess() {
      this.$message.success('注册成功！即将跳转到登录页面...')
      setTimeout(() => {
        this.$router.push('/login')
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.registration-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.registration-card {
  width: 100%;
  max-width: 600px;

  .card-header {
    text-align: center;

    h2 {
      margin: 0;
      font-size: 22px;
      color: #303133;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;

  .el-button {
    min-width: 120px;
    margin: 0 10px;
  }
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;

  a {
    color: #409EFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

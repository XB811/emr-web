<template>
  <div class="patient-change-container">
    <el-form ref="operatorForm" :model="operatorForm" :rules="operatorRules" label-width="80px" size="small" v-loading="loading">
      <!-- 创建时不显示用户名字段 -->
      <el-form-item  label="用户名" prop="username" required="true">
        <el-input v-model="operatorForm.username" :disabled="createOrUpdate === 'update'"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="createOrUpdate === 'create'">
        <el-input v-model="operatorForm.password" :type="passwordType" ref="password">
          <i slot="suffix" class="el-icon-view" @click="showPwd"></i>
        </el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName"required="true">
        <el-input v-model="operatorForm.realName">
        </el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="operatorForm.gender">
          <el-option label="男" value="false"></el-option>
          <el-option label="女" value="true"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone"required="true">
        <el-input v-model="operatorForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard"required="true">
        <el-input v-model="operatorForm.idCard"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {hasUsername, queryActualByUserId, register, updateById} from "@/api/user"
import { validPassword, validPhone, validRealName, validUsername, validIdCard } from "@/utils/validate";

export default {
  name: 'PatientChange',
  props:{
    userType:{
      type: String,
      default: 'patient'
    },
    id:{
      type: [String, Number],
      required: true,
    },
    createOrUpdate:{
      type: String,
      required: true,
    }
  },
  data(){
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('用户名不合法'))
      } else {
        hasUsername(value, this.userType).then(response => {
          // console.log(response)
          if ( response.data === true) {
            callback(new Error('用户名已存在'));
          } else {
            callback();
          }
        }).catch(error => {
          console.error('验证用户名失败:', error);
          callback(new Error('验证用户名失败'));
        });
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error('密码至少包含字母、数字、特殊字符，长度为6-16位'))
      } else {
        callback()
      }
    }
    const validateRealName = (rule, value, callback) => {
      if (!validRealName(value)) {
        callback(new Error('真实姓名必须为2-4位汉字'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if(!validPhone(value)) {
        callback(new Error('手机号不合法'))
      } else {
        callback()
      }
    }
    const validateIdCard = (rule, value, callback) => {
      if(!validIdCard(value)) {
        callback(new Error('身份证号不合法'))
      } else {
        callback()
      }
    }
    return{
      createForm:{
        username: null,
        password: null,
        realName: null,
        phone: null,
        userType: this.userType,
        gender: "false",
        idCard: null
      },
      updateForm:{
        id: this.id,
        username: null,
        realName: null,
        phone: null,
        userType: this.userType,
        gender: "false",
        idCard: null
      },
      operatorForm: null,
      loading: false,
      passwordType: 'password',
      operatorRules:{
        username:[{require: true, trigger: 'blur',validator: validateUsername}],
        password:[{require: this.createOrUpdate==='create', trigger: 'blur',validator: validatePassword}],
        realName:[{require: true, trigger: 'blur',validator: validateRealName},],
        gender:[{
          required: true,
          message: '请选择性别',
          trigger: 'blur'
        }],
        phone:[{require: true, trigger: 'blur',validator: validatePhone},],
        idCard:[{require: true, trigger: 'blur',validator: validateIdCard}]
      }
    }
  },
  created() {
    // 根据 createOrUpdate 设置 operatorForm 指向
    if (this.createOrUpdate === 'create') {
      this.operatorForm = this.createForm;
    } else {
      this.operatorForm = this.updateForm;
      // 如果是 update，获取用户信息填充表单
      this.getUserInfo();
    }
  },
  methods: {
    getUserInfo() {
      this.loading = true;
      queryActualByUserId(this.id, this.userType)
        .then(response => {
          if (response && response.data) {
            const userData = response.data;
            // 填充 updateForm
            this.updateForm.username = userData.username;
            this.updateForm.realName = userData.realName;
            this.updateForm.phone = userData.phone;
            this.updateForm.gender = String(userData.gender);
            this.updateForm.idCard = userData.idCard;
          }
        })
        .catch(error => {
          console.error('获取患者信息失败:', error);
          this.$message.error('获取患者信息失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.operatorForm) {
        this.$refs.operatorForm.clearValidate();
      }
    },

    submitForm() {
      // 提交表单前验证
      this.$refs.operatorForm.validate(valid => {
        if (valid) {
          this.loading = true;

          // 根据 createOrUpdate 决定调用哪个API，添加userType参数
          const apiRequest = this.createOrUpdate === 'create'
            ? register(this.operatorForm, this.userType)
            : updateById(this.operatorForm, this.userType);

          apiRequest
            .then(response => {
              console.log(response);
              if (response && response.code === "0") {  // 修改为字符串"0"匹配
                this.$message.success(this.createOrUpdate === 'create' ? '注册成功！' : '更新成功！');
                this.$emit('update-success', this.operatorForm);
              } else {
                throw new Error(response.message || '操作失败');
              }
            })
            .catch(error => {
              console.error(this.createOrUpdate === 'create' ? '注册失败:' : '更新失败:', error);
              this.$message.error(error.message || (this.createOrUpdate === 'create' ? '注册失败' : '更新失败'));
            })
            .finally(() => {
              this.loading = false;
            });
          // 刷新组件的数据
          this.getUserInfo();
        } else {
          console.log('参数不合法')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.patient-change-container {
  padding: 0 10px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-select {
  width: 100%;
}
</style>

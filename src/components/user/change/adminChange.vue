<template>
  <div class="admin-change-container">
    <el-form ref="operatorForm" :model="operatorForm" :rules="operatorRules" label-width="80px" size="small" v-loading="loading">
      <!-- 创建时不显示用户名字段 -->
      <el-form-item v-if="createOrUpdate === 'update'" label="用户名" prop="username" required>
        <el-input v-model="operatorForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="createOrUpdate === 'create'" required>
        <el-input v-model="operatorForm.password" :type="passwordType" ref="password">
          <i slot="suffix" class="el-icon-view" @click="showPwd"></i>
        </el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName" required>
        <el-input v-model="operatorForm.realName"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone" required>
        <el-input v-model="operatorForm.phone"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { queryActualByUserId, register, updateById } from "@/api/user"
import {validPassword, validPhone, validRealName, validUsername} from "@/utils/validate";

export default {
  name: 'AdminChange',
  props:{
    userType:{
      type: String,
      default: 'admin'
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
    return{
      createForm:{
        username: null,
        password: null,
        realName: null,
        phone: null,
        userType: this.userType,
      },
      updateForm:{
        id: this.id,
        // 更新操作时把username框架设为只读
        username: null,
        realName: null,
        phone: null,
        userType: this.userType,
      },
      operatorForm: null,
      // 表单验证规则
      operatorRules:{
        username:[{require: true, trigger: 'blur',validator: validateUsername},],
        password:[{require: this.createOrUpdate==='create', trigger: 'blur',validator: validatePassword}],
        realName:[{require: true, trigger: 'blur',validator: validateRealName},],
        phone:[{require: true, trigger: 'blur',validator: validatePhone},]
      },
      loading: false,
      // 控制密码框的显示类型，默认为password
      passwordType: 'password',
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
    getUserInfo() {
      this.loading = true;
      queryActualByUserId(this.id,this.userType)
        .then(response => {
          if (response && response.data) {
            const userData = response.data;
            // 填充 operatorForm
            this.operatorForm.username = userData.username;
            this.operatorForm.realName = userData.realName;
            this.operatorForm.phone = userData.phone;
            // 密码通常不会从后端返回，保持为 null
          }
        })
        .catch(error => {
          console.error('获取用户信息失败:', error);
          this.$message.error('获取用户信息失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    submitForm() {
      // 根据 createOrUpdate 决定调用哪个API
      this.$refs.operatorForm.validate(valid => {
          if(valid){
            this.loading = true;
            const apiRequest = this.createOrUpdate === 'create'
              ? register(this.operatorForm,this.userType)
              : updateById(this.operatorForm,this.userType);

            apiRequest
              .then(response => {
                console.log(response);
                if (response && response.code === "0") {
                  this.$message.success(this.createOrUpdate === 'create' ? '注册成功！' : '更新成功！');
                  // 将事件名称从 submit-success 改为 update-success
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
          }else {
            // 表单验证失败
            console.log('参数不合法')
            return false
          }
      })
    },

    // 重置表单验证信息
    resetFormValidation() {
      // 如果表单已经挂载，则重置验证信息
      if (this.$refs.operatorForm) {
        this.$refs.operatorForm.clearValidate();
      }
    }
  }
}
</script>

<style scoped>
.admin-change-container {
  padding: 0 10px;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>

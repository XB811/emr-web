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

    <!-- 创建成功信息弹窗 -->
    <el-dialog
      title="创建成功"
      :visible.sync="successDialogVisible"
      width="400px"
      :append-to-body="true"
      :close-on-click-modal="false"
      custom-class="success-dialog">
      <div class="success-info">
        <div class="success-icon-container">
          <i class="el-icon-success success-icon"></i>
        </div>
        <h3 class="success-title">用户创建成功</h3>
        <el-descriptions
          :column="1"
          border
          class="success-descriptions"
          :label-style="{
            'background-color': '#f7f9fc',
            'font-weight': 'bold',
            'color': '#606266',
            'padding': '12px 15px'
          }"
          :content-style="{
            'padding': '12px 15px'
          }">
          <el-descriptions-item label="用户名">
            <div>
              <span>用户名：</span>
            <span class="user-info-value">{{ createdUserInfo.username }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">
            <div>
            <span>真实姓名：</span>
            <span class="user-info-value">{{ createdUserInfo.realName }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <div>
            <span>联系电话：</span>
            <span class="user-info-value">{{ createdUserInfo.phone }}</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <div class="success-tips">
          <i class="el-icon-warning-outline"></i>
          <span>请妥善保存以上账户信息</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="medium" @click="closeSuccessDialog">确 定</el-button>
      </span>
    </el-dialog>
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
      required: function() { return this.createOrUpdate === 'update'; },
      default: null
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
      // 创建成功弹窗
      successDialogVisible: false,
      // 创建成功的用户信息
      createdUserInfo: {
        username: '',
        realName: '',
        phone: ''
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
      if(this.id === null || this.userType === null) return;
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

    closeSuccessDialog() {
      this.successDialogVisible = false;
      // 通知父组件操作成功
      this.$emit('update-success', this.operatorForm);
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
                console.log('API响应:', response);
                // 修改这里，处理不同的返回码情况
                if (response) {
                  if (this.createOrUpdate === 'create') {
                    // 保存创建成功的用户信息
                    this.createdUserInfo = response.data || {};
                    console.log('创建的用户信息:', this.createdUserInfo);

                    // 确保成功对话框显示在当前操作完成后
                    this.$nextTick(() => {
                      this.successDialogVisible = true;
                    });
                  } else {
                    this.$message.success('更新成功！');
                    // 触发更新成功事件
                    this.$emit('update-success', this.operatorForm);
                  }
                } else {
                  throw new Error(response?.message || '操作失败');
                }
              })
              .catch(error => {
                console.error(this.createOrUpdate === 'create' ? '注册失败:' : '更新失败:', error);
                this.$message.error(error.message || (this.createOrUpdate === 'create' ? '注册失败' : '更新失败'));
              })
              .finally(() => {
                this.loading = false;
              });
          } else {
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

/* 成功弹窗样式优化 */
.success-info {
  text-align: center;
  padding: 10px 0 20px;
}

.success-icon-container {
  background-color: rgba(103, 194, 58, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 50px;
  color: #67C23A;
}

.success-title {
  margin-bottom: 25px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.success-descriptions {
  margin: 0 auto;
  text-align: left;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.user-info-value {
  color: #303133;
  font-weight: 500;
}

.success-tips {
  margin-top: 20px;
  color: #E6A23C;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

/* 确保弹窗显示在最上层 */
:deep(.success-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 16px 20px;
  background-color: #f7f9fc;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__title) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 25px 25px 10px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px 20px;
  text-align: center;
}

:deep(.el-button--primary) {
  padding: 10px 24px;
}

:deep(.el-dialog__wrapper) {
  z-index: 3000 !important;
}

:deep(.v-modal) {
  z-index: 2999 !important;
}
</style>

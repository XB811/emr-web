<template>
  <div class="admin-home-container">
    <el-row :gutter="20">
      <el-col :span="24">
          <div class="card-header">
            <h2>用户信息</h2>
            <div class="desensitize-switch">
              <el-button type="primary" @click="openChangeDialog" size="small">
                <i class="el-icon-edit"></i> 修改信息
              </el-button>
              <el-tooltip :content="!showActual ? '当前显示脱敏信息' : '点击显示脱敏信息'" placement="bottom">
                <el-button
                  size="small"
                  :type="!showActual ? 'primary' : 'info'"
                  @click="showActual = !showActual">
                  <i :class="!showActual ? 'el-icon-lock' : 'el-icon-view'"></i>
                  显示脱敏信息
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <admin-info
            ref="adminInfoComponent"
            :user-type="userType"
            :id="userId"
            :is-actual="showActual">
          </admin-info>
      </el-col>
    </el-row>

    <!-- Dialog for AdminChange component -->
    <el-dialog
      title="修改个人信息"
      :visible.sync="dialogVisible"
      width="25%"
      custom-class="admin-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <admin-change
        ref="adminChangeComponent"
        :user-type="userType"
        :id="userId"
        create-or-update="update"
        @update-success="handleUpdateSuccess">
      </admin-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">更 新</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AdminInfo from '@/components/user/info/adminInfo.vue'
import AdminChange from '@/components/user/change/adminChange.vue'
import store from "@/store";

export default {
  components: {
    AdminInfo,
    AdminChange
  },
  data() {
    return {
      userType: 'admin',
      userId: store.getters.userId,
      showActual: false,
      dialogVisible: false
    }
  },
  methods: {
    openChangeDialog() {
      this.dialogVisible = true
    },
    handleDialogClose(done) {
      this.$confirm('确定关闭修改窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          this.$refs.adminChangeComponent.resetFormValidation();
          // 重新获取用户信息
          this.$refs.adminChangeComponent.getUserInfo();
          done()
        })
        .catch(() => {})
    },
    handleCloseDialog() {
      this.handleDialogClose(() => {
        this.dialogVisible = false;
      });
    },
    handleUpdateSuccess() {
      this.$message({
        type: 'success',
        message: '个人信息更新成功！'
      });

      // 清除表单验证信息
      this.$refs.adminChangeComponent.resetFormValidation();

      // 更新成功后刷新用户信息 - 使用ref直接调用
      this.$nextTick(() => {
        if (this.$refs.adminInfoComponent) {
          this.$refs.adminInfoComponent.fetchUserInfo();
        }
      });

      this.dialogVisible = false;
    },
    // 调用子组件的submitForm方法
    submitForm() {
      this.$refs.adminChangeComponent.submitForm();

    }
  }
}
</script>

<style scoped>
.admin-home-container {
  padding: 20px;
}

.info-card, .change-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.card-header h2 {
  font-size: 18px;
  color: #303133;
  font-weight: 500;
  margin: 0;
}

.desensitize-switch {
  margin-right: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.change-hint {
  padding: 10px 0;
}

/* 添加对话框最大宽度限制 */
 /deep/ .admin-change-dialog {
  max-width: 600px;
  margin: 0 auto;
}

/* 控制对话框的高度比例 */
/deep/ .admin-change-dialog .el-dialog__body {
  max-height: 60vh;
  overflow-y: auto;
  padding-top: 15px;
  padding-bottom: 15px;
}

/* 确保弹窗内部元素适当布局 */
/deep/ .admin-change-dialog .el-dialog__header {
  padding-bottom: 10px;
}

/deep/ .admin-change-dialog .el-dialog__footer {
  padding-top: 10px;
}
</style>


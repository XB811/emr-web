<template>
  <div>
    <span @click="openChangeDialog" class="admin-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改管理员' : '创建管理员' }}</slot>
    </span>

    <!-- Dialog for AdminChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="50%"
      custom-class="admin-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <admin-change
        v-if="changeDialogVisible"
        ref="adminChangeComponent"
        :id="id"
        :user-type="userType"
        :create-or-update="createOrUpdate"
        @update-success="handleUpdateSuccess">
      </admin-change>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AdminChange from "@/components/user/change/adminChange.vue";

export default {
  name: "AdminChangeButton",
  components: {
    AdminChange
  },
  props: {
    id: {
      type: [String, Number],
      default: null,
      // update模式下必须提供id
      required: function() { return this.createOrUpdate === 'update'; }
    },
    userType: {
      type: String,
      default: 'admin'
    },
    createOrUpdate: {
      type: String,
      default: 'update',
      validator: (value) => {
        return ['create', 'update'].indexOf(value) !== -1
      }
    }
  },
  data() {
    return {
      changeDialogVisible: false
    };
  },
  computed: {
    dialogTitle() {
      return this.createOrUpdate === 'update' ? '修改管理员' : '创建管理员';
    },
    submitButtonText() {
      return this.createOrUpdate === 'update' ? '更 新' : '创 建';
    }
  },
  methods: {
    openChangeDialog() {
      this.changeDialogVisible = true;
      // 对话框打开后，等待组件渲染完成再执行其他操作
      this.$nextTick(() => {
        if (this.$refs.adminChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.id) {
              this.$message.error('更新操���必须提供用户ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.adminChangeComponent.getUserInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.adminChangeComponent) {
            this.$refs.adminChangeComponent.resetFormValidation();
          }
          done();
        })
        .catch(() => {});
    },

    handleCloseDialog() {
      this.handleDialogClose(() => {
        this.changeDialogVisible = false;
      });
    },

    handleUpdateSuccess() {
      this.$message({
        type: 'success',
        message: this.createOrUpdate === 'update' ? '管理员信息更新成功！' : '管理员创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('update-success');
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.adminChangeComponent) {
        this.$refs.adminChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-change-btn {
  cursor: pointer;
  display: inline-block;
}

::v-deep .admin-change-dialog {
  border-radius: 4px;
  overflow: hidden;

  .el-dialog__header {
    background-color: #f9f9f9;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 20px;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;

      .el-button {
        min-width: 90px;
        padding: 10px 20px;

        &+.el-button {
          margin-left: 12px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  ::v-deep .admin-change-dialog {
    width: 90% !important;
    margin-top: 10vh !important;

    .el-dialog__body {
      padding: 16px;
    }
  }
}
</style>

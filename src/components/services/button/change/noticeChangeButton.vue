<template>
  <div>
    <span @click="openChangeDialog" class="notice-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改公告信息' : '创建公告信息' }}</slot>
    </span>

    <!-- Dialog for NoticeChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="60%"
      custom-class="notice-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <notice-change
        v-if="changeDialogVisible"
        ref="noticeChangeComponent"
        :adminId="adminId"
        :adminName="adminName"
        :id="noticeId"
        :create-or-update="createOrUpdate"
        @submit-success="handleUpdateSuccess">
      </notice-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import NoticeChange from "@/components/services/components/change/noticeChange.vue";

export default {
  name: "NoticeChangeButton",
  components: {
    NoticeChange
  },
  props: {
    noticeId: {
      type: [String, Number],
      default: null,
      // update模式下必须提供noticeId
      required: function() { return this.createOrUpdate === 'update'; }
    },
    adminId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供adminId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    adminName: {
      type: String,
      default: null,
      // create模式下必须提供adminName
      required: function() { return this.createOrUpdate === 'create'; }
    },
    createOrUpdate: {
      type: String,
      default: 'update',
      required: true,
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
      return this.createOrUpdate === 'update' ? '修改公告信息' : '创建公告信息';
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
        if (this.$refs.noticeChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.noticeId) {
              this.$message.error('更新操作必须提供公告ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.noticeChangeComponent.fetchNoticeInfo();
            }, 100);
          } else if (this.createOrUpdate === 'create') {
            if (!this.adminId) {
              this.$message.error('创建操作必须提供管理员ID');
              this.changeDialogVisible = false;
              return;
            }
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.noticeChangeComponent) {
            this.$refs.noticeChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '公告信息更新成功！' : '公告信息创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('submit-success');
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.noticeChangeComponent) {
        this.$refs.noticeChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.notice-change-btn {
  cursor: pointer;
}
</style>

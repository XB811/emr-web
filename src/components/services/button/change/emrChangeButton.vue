<template>
  <div>
    <span @click="openChangeDialog" class="emr-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改病历信息' : '创建病历信息' }}</slot>
    </span>

    <!-- Dialog for EmrChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="70%"
      custom-class="emr-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <emr-change
        v-if="changeDialogVisible"
        ref="emrChangeComponent"
        :id="emrId"
        :patient-id="patientId"
        :department-id="departmentId"
        :doctor-id="doctorId"
        :create-or-update="createOrUpdate"
        @submit-success="handleUpdateSuccess"
        @fetch-failed="handleFetchFailed">
      </emr-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import EmrChange from "@/components/services/components/change/emrChange.vue";

export default {
  name: "EmrChangeButton",
  components: {
    EmrChange
  },
  props: {
    emrId: {
      type: [String, Number],
      default: null,
      // update模式下必须提供emrId
      required: function() { return this.createOrUpdate === 'update'; }
    },
    patientId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供patientId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    departmentId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供departmentId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    doctorId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供doctorId
      required: function() { return this.createOrUpdate === 'create'; }
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
      return this.createOrUpdate === 'update' ? '修改病历信息' : '创建病历信息';
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
        if (this.$refs.emrChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.emrId) {
              this.$message.error('更新操作必须提供病历ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.emrChangeComponent.fetchEmrInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.emrChangeComponent) {
            this.$refs.emrChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '病历信息更新成功！' : '病历信息创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('submit-success');
    },

    // 新增：处理获取数据失败事件
    handleFetchFailed(errorMsg) {
      console.error('获取数据失败，关闭弹窗:', errorMsg)
      this.$message.error('获取数据失败: ' + errorMsg)
      // 关闭弹窗
      this.changeDialogVisible = false
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.emrChangeComponent) {
        this.$refs.emrChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.emr-change-btn {
  cursor: pointer;
}

/* 设置对话框的滚动行为，确保只有一个滚动条 */
:deep(.emr-change-dialog .el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
  padding: 15px 20px;
}

/* 修改对话框宽度在移动设备上的表现 */
@media screen and (max-width: 768px) {
  :deep(.emr-change-dialog) {
    width: 90% !important;
  }

  :deep(.emr-change-dialog .el-dialog__body) {
    max-height: 60vh; /* 移动设备上稍微减少高度，避免按钮被遮挡 */
  }
}
</style>


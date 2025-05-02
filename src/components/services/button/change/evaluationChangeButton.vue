<template>
  <div>
    <span @click="openChangeDialog" class="evaluation-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改评价' : '添加评价' }}</slot>
    </span>

    <!-- Dialog for EvaluationChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="60%"
      custom-class="evaluation-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <evaluation-change
        v-if="changeDialogVisible"
        ref="evaluationChangeComponent"
        :id="id"
        :emr-id="emrId"
        :doctor-id="doctorId"
        :patient-id="patientId"
        :create-or-update="createOrUpdate"
        @submit-success="handleUpdateSuccess"
        @fetch-failed="handleFetchFailed">
      </evaluation-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import EvaluationChange from "@/components/services/components/change/evaluationChange.vue";

export default {
  name: "EvaluationChangeButton",
  components: {
    EvaluationChange
  },
  props: {
    id: {
      type: [String, Number],
      default: null,
      // update模式下必须提供id
      required: function() { return this.createOrUpdate === 'update'; }
    },
    emrId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供emrId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    doctorId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供doctorId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    patientId: {
      type: [String, Number],
      default: null,
      // create模式下必须提供patientId
      required: function() { return this.createOrUpdate === 'create'; }
    },
    createOrUpdate: {
      type: String,
      default: 'create',
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
      return this.createOrUpdate === 'update' ? '修改评价' : '添加新评价';
    },
    submitButtonText() {
      return this.createOrUpdate === 'update' ? '更 新' : '提 交';
    }
  },
  methods: {
    openChangeDialog() {
      this.changeDialogVisible = true;
      // 对话框打开后，等待组件渲染完成再执行其他操作
      this.$nextTick(() => {
        if (this.$refs.evaluationChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.id) {
              this.$message.error('更新操作必须提供评价ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.evaluationChangeComponent.fetchEvaluationInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.evaluationChangeComponent) {
            this.$refs.evaluationChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '评价更新成功！' : '评价提交成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('submit-success');
    },

    // 处理获取数据失败
    handleFetchFailed(errorMsg) {
      console.error('获取评价数据失败，关闭弹窗:', errorMsg)
      this.$message.error('获取评价数据失败: ' + errorMsg)
      // 关闭弹窗
      this.changeDialogVisible = false
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.evaluationChangeComponent) {
        this.$refs.evaluationChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.evaluation-change-btn {
  cursor: pointer;
}

/* 设置对话框的最大高度，防止内容过多时超出屏幕 */
:deep(.evaluation-change-dialog .el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
}

/* 修改对话框宽度在移动设备上的表现 */
@media screen and (max-width: 768px) {
  :deep(.evaluation-change-dialog) {
    width: 90% !important;
  }
}
</style>

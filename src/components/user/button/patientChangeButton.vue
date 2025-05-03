<template>
  <div>
    <span @click="openChangeDialog" class="patient-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改患者' : '创建患者' }}</slot>
    </span>

    <!-- Dialog for PatientChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="60%"
      custom-class="patient-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <patient-change
        v-if="changeDialogVisible"
        ref="patientChangeComponent"
        :id="id"
        :user-type="userType"
        :create-or-update="createOrUpdate"
        @update-success="handleUpdateSuccess">
      </patient-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PatientChange from "@/components/user/change/patientChange.vue";

export default {
  name: "PatientChangeButton",
  components: {
    PatientChange
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
      default: 'patient'
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
      return this.createOrUpdate === 'update' ? '修改患者' : '创建患者';
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
        if (this.$refs.patientChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.id) {
              this.$message.error('更新操作必须提供用户ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.patientChangeComponent.getUserInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.patientChangeComponent) {
            this.$refs.patientChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '患者信息更新成功！' : '患者创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('update-success');
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.patientChangeComponent) {
        this.$refs.patientChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.patient-change-btn {
  cursor: pointer;
}
</style>

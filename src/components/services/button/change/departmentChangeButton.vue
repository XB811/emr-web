<template>
  <div>
    <span @click="openChangeDialog" class="department-change-btn">
      <slot>{{ createOrUpdate === 'update' ? '修改科室信息' : '创建科室信息' }}</slot>
    </span>

    <!-- Dialog for DepartmentChange component -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="changeDialogVisible"
      width="60%"
      custom-class="department-change-dialog"
      :close-on-click-modal="false"
      :before-close="handleDialogClose">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <department-change
        v-if="changeDialogVisible"
        ref="departmentChangeComponent"
        :id="departmentId"
        :create-or-update="createOrUpdate"
        @submit-success="handleUpdateSuccess">
      </department-change>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
        <el-button @click="handleCloseDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DepartmentChange from "@/components/services/components/change/departmentChange.vue";

export default {
  name: "DepartmentChangeButton",
  components: {
    DepartmentChange
  },
  props: {
    departmentId: {
      type: [String, Number],
      default: null,
      // update模式下必须提供departmentId
      required: function() { return this.createOrUpdate === 'update'; }
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
      return this.createOrUpdate === 'update' ? '修改科室信息' : '创建科室信息';
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
        if (this.$refs.departmentChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.departmentId) {
              this.$message.error('更新操作必须提供科室ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.departmentChangeComponent.fetchDepartmentInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.departmentChangeComponent) {
            this.$refs.departmentChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '科室信息更新成功！' : '科室信息创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('submit-success');
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.departmentChangeComponent) {
        this.$refs.departmentChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.department-change-btn {
  cursor: pointer;
}
</style>

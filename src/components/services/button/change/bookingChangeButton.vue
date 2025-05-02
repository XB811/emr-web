<template>
  <div>
  <span @click="openChangeDialog" class="booking-change-btn">
    <slot>{{ createOrUpdate === 'update' ? '修改预约时间' : '创建预约时间' }}</slot>
  </span>

  <!-- Dialog for BookingChange component -->
  <el-dialog
    :title="dialogTitle"
    :visible.sync="changeDialogVisible"
    width="60%"
    custom-class="booking-change-dialog"
    :close-on-click-modal="false"
    :before-close="handleDialogClose">
    <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
    <booking-change
      v-if="changeDialogVisible"
      ref="bookingChangeComponent"
      :doctorId="doctorId"
      :id="bookingId"
      :create-or-update="createOrUpdate"
      @submit-success="handleUpdateSuccess">
    </booking-change>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">{{ submitButtonText }}</el-button>
      <el-button @click="handleCloseDialog">关 闭</el-button>
    </span>
  </el-dialog>
    </div>
</template>

<script>
import BookingChange from "@/components/services/components/change/bookingChange.vue";

export default {
  name: "BookingChangeButton",
  components: {
    BookingChange
  },
  props: {
    bookingId: {
      type: [String, Number],
      default: null,
      // update模式下必须提供bookingId
      required: function() { return this.createOrUpdate === 'update'; }
    },
    doctorId: {
      type: [String, Number],
      required: true
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
      return this.createOrUpdate === 'update' ? '修改预约时间' : '创建预约时间';
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
        if (this.$refs.bookingChangeComponent) {
          // 只有更新操作需要先获取数据
          if (this.createOrUpdate === 'update') {
            if (!this.bookingId) {
              this.$message.error('更新操作必须提供预约ID');
              this.changeDialogVisible = false;
              return;
            }

            setTimeout(() => {
              this.$refs.bookingChangeComponent.fetchBookingInfo();
            }, 100);
          }
        }
      });
    },

    handleDialogClose(done) {
      this.$confirm('确定关闭窗口吗？未保存的修改将会丢失。')
        .then(() => {
          // 清除表单验证信息
          if (this.$refs.bookingChangeComponent) {
            this.$refs.bookingChangeComponent.resetFormValidation();
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
        message: this.createOrUpdate === 'update' ? '预约时间更新成功！' : '预约时间创建成功！'
      });

      // 关闭修改弹窗
      this.changeDialogVisible = false;

      // 触发更新成功事件，通知父组件
      this.$emit('submit-success');
    },

    // 调用子组件的submitForm方法
    submitForm() {
      if (this.$refs.bookingChangeComponent) {
        this.$refs.bookingChangeComponent.submitForm();
      }
    }
  }
}
</script>

<style scoped>
.booking-change-btn {
  cursor: pointer;
}
</style>

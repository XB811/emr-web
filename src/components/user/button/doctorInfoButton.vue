<template>
  <div>
    <span @click="openInfoDialog" class="doctor-info-btn">
      <slot>查看医生详情</slot>
    </span>

    <!-- Dialog for DoctorInfo component -->
    <el-dialog
      title="医生详情"
      :visible.sync="infoDialogVisible"
      width="60%"
      custom-class="doctor-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <doctor-info
        v-if="infoDialogVisible"
        :id="id"
        :user-type="userType"
        ref="doctorInfoComponent">
      </doctor-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DoctorInfo from "@/components/user/info/doctorInfo.vue";

export default {
  name: "DoctorInfoButton",
  components: {
    DoctorInfo
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    userType: {
      type: String,
      default: 'doctor'
    }
  },
  data() {
    return {
      infoDialogVisible: false
    };
  },
  methods: {
    openInfoDialog() {
      this.infoDialogVisible = true;
      // 对话框打开后，等待组件渲染完成再执行其他操作
      this.$nextTick(() => {
        if (this.$refs.doctorInfoComponent) {
          this.$refs.doctorInfoComponent.fetchUserInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.doctor-info-btn {
  cursor: pointer;
}
</style>

<template>
  <div>
    <span @click="openInfoDialog" class="patient-info-btn">
      <slot>查看患者详情</slot>
    </span>

    <!-- Dialog for PatientInfo component -->
    <el-dialog
      title="患者详情"
      :visible.sync="infoDialogVisible"
      width="60%"
      custom-class="patient-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <patient-info
        v-if="infoDialogVisible"
        :id="id"
        :user-type="userType"
        ref="patientInfoComponent">
      </patient-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PatientInfo from "@/components/user/info/patientInfo.vue";
export default {
  name: "PatientInfoButton",
  components: {
    PatientInfo
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    userType: {
      type: String,
      default: 'patient'
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
        if (this.$refs.patientInfoComponent) {
          this.$refs.patientInfoComponent.fetchUserInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.patient-info-btn {
  cursor: pointer;
}
</style>

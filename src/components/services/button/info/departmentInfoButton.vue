<template>
  <div>
    <span @click="openInfoDialog" class="department-info-btn">
      <slot>查看科室信息</slot>
    </span>

    <!-- Dialog for DepartmentInfo component -->
    <el-dialog
      title="科室详细信息"
      :visible.sync="infoDialogVisible"
      width="60%"
      custom-class="department-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <department-info
        v-if="infoDialogVisible"
        :id="departmentId"
        ref="departmentInfoComponent">
      </department-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DepartmentInfo from "@/components/services/components/info/departmentInfo.vue";

export default {
  name: "DepartmentInfoButton",
  components: {
    DepartmentInfo
  },
  props: {
    departmentId: {
      type: [String, Number],
      required: true
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
        if (this.$refs.departmentInfoComponent) {
          this.$refs.departmentInfoComponent.fetchDepartmentInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.department-info-btn {
  cursor: pointer;
}
</style>

<template>
  <div>
    <span @click="openInfoDialog" class="evaluation-info-btn">
      <slot>查看评价信息</slot>
    </span>

    <!-- Dialog for EvaluationInfo component -->
    <el-dialog
      title="评价详情"
      :visible.sync="infoDialogVisible"
      width="65%"
      custom-class="evaluation-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <evaluation-info
        v-if="infoDialogVisible"
        :emr-id="emrId"
        ref="evaluationInfoComponent">
      </evaluation-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import EvaluationInfo from "@/components/services/components/info/evaluationInfo.vue";

export default {
  name: "EvaluationInfoButton",
  components: {
    EvaluationInfo
  },
  props: {
    emrId: {
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
        if (this.$refs.evaluationInfoComponent) {
          this.$refs.evaluationInfoComponent.fetchEvaluationInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.evaluation-info-btn {
  cursor: pointer;
}

/* 修改对话框宽度在移动设备上的表现 */
@media screen and (max-width: 768px) {
  :deep(.evaluation-info-dialog) {
    width: 90% !important;
  }
}
</style>

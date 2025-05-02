<template>
  <div>
    <span @click="openInfoDialog" class="emr-info-btn">
      <slot>查看病历信息</slot>
    </span>

    <!-- Dialog for EmrInfo component -->
    <el-dialog
      title="病历详情"
      :visible.sync="infoDialogVisible"
      width="70%"
      custom-class="emr-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <emr-info
        v-if="infoDialogVisible"
        :id="emrId"
        ref="emrInfoComponent">
      </emr-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import EmrInfo from "@/components/services/components/info/emrInfo.vue";

export default {
  name: "EmrInfoButton",
  components: {
    EmrInfo
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
        if (this.$refs.emrInfoComponent) {
          this.$refs.emrInfoComponent.fetchEmrInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.emr-info-btn {
  cursor: pointer;
}

/* 修改对话框宽度在移动设备上的表现 */
@media screen and (max-width: 768px) {
  :deep(.emr-info-dialog) {
    width: 90% !important;
  }
}
</style>

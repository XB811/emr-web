<template>
  <div>
    <span @click="openInfoDialog" class="notice-info-btn">
      <slot>查看公告信息</slot>
    </span>

    <el-dialog
      title="公告详情"
      :visible.sync="infoDialogVisible"
      width="60%"
      custom-class="notice-info-dialog"
      :close-on-click-modal="true">
      <notice-info
        v-if="infoDialogVisible"
        :id="noticeId"
        ref="noticeInfoComponent">
      </notice-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import NoticeInfo from "@/components/services/components/info/noticeInfo.vue"

export default {
  name: "NoticeInfoButton",
  components: {
    NoticeInfo
  },
  props: {
    noticeId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      infoDialogVisible: false
    }
  },
  methods: {
    openInfoDialog() {
      this.infoDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.noticeInfoComponent) {
          this.$refs.noticeInfoComponent.fetchNoticeInfo()
        }
      })
    }
  }
}
</script>

<style scoped>
.notice-info-btn {
  cursor: pointer;
}
</style>

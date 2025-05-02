<template>
  <div>
  <span @click="openInfoDialog" class="booking-info-btn">
    <slot>查看预约时间</slot>
  </span>

  <!-- Dialog for BookingInfo component -->
  <el-dialog
    title="预约时间详情"
    :visible.sync="infoDialogVisible"
    width="60%"
    custom-class="booking-info-dialog"
    :close-on-click-modal="true">
    <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
    <booking-info
      v-if="infoDialogVisible"
      :id="bookingId"
      ref="bookingInfoComponent">
    </booking-info>
    <span slot="footer" class="dialog-footer">
      <el-button @click="infoDialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import BookingInfo from "@/components/services/components/info/bookingInfo.vue";

export default {
  name: "BookingInfoButton",
  components: {
    BookingInfo
  },
  props: {
    bookingId: {
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
        if (this.$refs.bookingInfoComponent) {
          this.$refs.bookingInfoComponent.fetchBookingInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.booking-info-btn {
  cursor: pointer;
}
</style>

<template>
  <div>
    <span @click="openInfoDialog" class="admin-info-btn">
      <slot>查看管理员详情</slot>
    </span>

    <!-- Dialog for AdminInfo component -->
    <el-dialog
      title="管理员详情"
      :visible.sync="infoDialogVisible"
      width="60%"
      custom-class="admin-info-dialog"
      :close-on-click-modal="true">
      <!-- 使用v-if确保只在对话框可见时才渲染组件 -->
      <admin-info
        v-if="infoDialogVisible"
        :id="id"
        :user-type="userType"
        ref="adminInfoComponent">
      </admin-info>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AdminInfo from "@/components/user/info/adminInfo.vue";

export default {
  name: "AdminInfoButton",
  components: {
    AdminInfo
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    userType: {
      type: String,
      default: 'admin'
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
        if (this.$refs.adminInfoComponent) {
          this.$refs.adminInfoComponent.fetchUserInfo();
        }
      });
    }
  }
}
</script>

<style scoped>
.admin-info-btn {
  cursor: pointer;
}
</style>

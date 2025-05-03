<template>
  <div class="admin-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !userInfo" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 有数据时显示用户信息 -->
    <div
      v-else-if="userInfo"
      class="user-info-container"
      v-loading="loading"
      element-loading-text="正在加载用户信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="user-info-card" shadow="hover">
        <div slot="header" class="card-header">
          <div class="user-header">
            <el-avatar :size="80" icon="el-icon-user-solid" class="user-avatar"></el-avatar>
            <div class="user-title">
              <h2>{{ userInfo.realName || '未知用户' }}</h2>
              <el-tag size="small" type="primary">{{ userType }}</el-tag>
            </div>
          </div>
        </div>

        <el-descriptions
          class="user-descriptions"
          :column="1"
          border
          :label-width="'120px'"
          :content-style="{ 'padding': '16px' }"
          :label-style="{ 'font-weight': 'bold', 'background-color': '#f5f7fa' }">
          <el-descriptions-item label="用户名">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-user"></i> 用户名：</span>
              <el-tag size="medium">{{ userInfo.username }}</el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-s-custom"></i> 真实姓名：</span>
              <span class="info-content">{{ userInfo.realName }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-phone-outline"></i> 联系电话：</span>
              <el-link type="primary" @click.native="clickPhone" :underline="false" icon="el-icon-phone">{{ userInfo.phone }}</el-link>

            </div>
          </el-descriptions-item>
          <!-- 其他用户信息 -->
        </el-descriptions>
      </el-card>
    </div>

    <div v-else class="no-data">
      <el-empty description="没有找到用户信息">
        <el-button type="primary" @click="fetchUserInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>
<script>
import { queryByUserId,queryActualByUserId } from "@/api/user"
import loading from "element-ui/packages/loading";

export default {
  name: 'AdminInfo',
  props:{
    userType: {
      type: String,
      default: "admin",
    },
    id:{
      type: [String, Number],
      required: true,
    },
    isActual: {
      type: Boolean,
      default: false
    }
  },
  data(){
     return{
       userInfo: null,
       loading: false
     }
  },
  watch:{
    isActual() {
      this.fetchUserInfo()
    },
    id() {
      this.fetchUserInfo()
    },
    userType() {
      this.fetchUserInfo()
    }
  },
  methods:{
    fetchUserInfo() {
      if (!this.id || !this.userType) return
      this.loading = true
      const apiMethod = this.isActual ? queryActualByUserId : queryByUserId

      apiMethod(this.id, this.userType)
        .then(response => {
          if (response && response.data) {
            this.userInfo = response.data
          } else {
            this.userInfo = null
            this.$message.error('未能获取到用户信息')
          }
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
          this.userInfo = null
          this.$message.error('获取用户信息失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    clickPhone(){
      if (!this.id || !this.userType) return
      const apiMethod = this.isActual ? queryByUserId : queryActualByUserId
      this.isActual = !this.isActual
      apiMethod(this.id, this.userType)
        .then(response => {
          this.userInfo.phone = response.data.phone
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
        })
    }
  }
}
</script>

<style scoped>
.admin-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.user-info-container {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.user-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  padding: 10px 0;
}

.user-header {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 20px;
  background-color: #409EFF;
}

.user-title {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-title h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.user-descriptions {
  margin-top: 20px;
}

/* 添加以下样式优化描述列表 */
:deep(.el-descriptions-item__cell) {
  padding: 18px 0;
}

:deep(.el-descriptions-item__label) {
  color: #606266;
}

:deep(.el-descriptions-item__content) {
  padding: 12px 15px !important;
}

.info-content {
  font-size: 14px;
  padding: 0 8px;
  color: #303133;
}

.no-data {
  padding: 3%;
  text-align: center;
}

/* 移除不再需要的加载遮罩层相关样式 */
.loading-overlay,
.loading-icon {
  display: none;
}

.field-description {
  color: #909399;
  font-size: 12px;
  font-style: italic;
  margin-right: 8px;
}

/* 新添加的样式 */
.field-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  min-width: 100px;
}

.field-label i {
  margin-right: 5px;
  color: #409EFF;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.info-content {
  font-size: 14px;
  color: #303133;
  font-weight: 400;
  background-color: #f5f7fa;
  padding: 4px 12px;
  border-radius: 4px;
}

.info-row {
  display: flex;
  align-items: center;
}
</style>

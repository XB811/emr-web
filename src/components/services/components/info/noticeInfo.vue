<template>
  <div class="notice-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !noticeInfo" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 有数据时显示公告信息 -->
    <div
      v-else-if="noticeInfo"
      class="notice-info-content"
      v-loading="loading"
      element-loading-text="正在加载公告信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="notice-info-card" shadow="never">
        <!-- 公告标题 -->
        <h1 class="notice-title">{{ noticeInfo.title }}</h1>

        <!-- 管理员和日期信息 -->
        <div class="notice-meta">
          <span class="admin-name">
            <i class="el-icon-user"></i> {{ noticeInfo.adminName }}
          </span>
          <span class="update-time">
            <i class="el-icon-time"></i> {{ formatDate(noticeInfo.updateTime) }}
          </span>
        </div>

        <!-- 分隔线 -->
        <el-divider></el-divider>

        <!-- 公告正文内容 -->
        <div class="notice-content">
          {{ noticeInfo.content }}
        </div>
      </el-card>
    </div>
    <div v-else class="no-data">
      <el-empty description="没有找到公告信息">
        <el-button type="primary" @click="fetchNoticeInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { queryById } from "@/api/notice"

export default {
  name: "NoticeInfo",
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      noticeInfo: null,
      loading: false
    }
  },
  watch: {
    id() {
      this.fetchNoticeInfo()
    }
  },
  methods: {
    fetchNoticeInfo() {
      if (!this.id) return
      this.loading = true

      queryById(this.id)
        .then(response => {
          this.noticeInfo = response.data
        })
        .catch(error => {
          console.error('获取公告信息失败:', error)
        })
        .finally(() => {
          this.loading = false
        })
    },

    formatDate(dateString) {
      if (!dateString) return ''

      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}年${month}月${day}日 ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.notice-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.notice-info-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.notice-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 10px;
}

/* 标题样式 */
.notice-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-top: 10px;
  margin-bottom: 15px;
  text-align: left;
}

/* 管理员和时间信息样式 */
.notice-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  margin-bottom: 15px;
}

.admin-name {
  margin-right: 20px;
}

.admin-name i, .update-time i {
  margin-right: 5px;
}

/* 内容样式 */
.notice-content {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  margin-top: 20px;
  white-space: pre-wrap;
  text-align: justify;
}

.no-data {
  padding: 3%;
  text-align: center;
}
</style>

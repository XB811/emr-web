<template>
  <div class="evaluation-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !evaluationInfo" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 有数据时显示评价信息 -->
    <div
      v-else-if="evaluationInfo"
      class="evaluation-info-content"
      v-loading="loading"
      element-loading-text="正在加载评价信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="evaluation-info-card" shadow="never">
        <div slot="header" class="card-header">
          <div class="evaluation-header">
            <div class="evaluation-title">
              <i class="el-icon-s-comment"></i>
              <span>评价详情</span>
            </div>
            <div class="evaluation-time">
              <span class="time-label">评价时间：</span>
              <span class="time-value">{{ formatDate(evaluationInfo.createTime) }}</span>
            </div>
          </div>
        </div>

        <div class="evaluation-basic-info">
          <div class="info-row">
            <div class="info-item">
              <span class="field-label">评价ID：</span>
              <span class="info-content">{{ evaluationInfo.id }}</span>
            </div>
            <div class="info-item">
              <span class="field-label">病历ID：</span>
              <span class="info-content">{{ evaluationInfo.emrId }}</span>
            </div>
            <div class="info-item">
              <span class="field-label">患者姓名：</span>
              <span class="info-content">
                <el-tag size="small" type="primary" effect="plain">{{ patientName || '加载中...' }}</el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="field-label">医生姓名：</span>
              <span class="info-content">
                <el-tag size="small" type="success" effect="plain">{{ doctorName || '加载中...' }}</el-tag>
              </span>
            </div>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="evaluation-content">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-chat-line-square"></i>
              <span>评价内容</span>
            </div>
          </div>
          <div class="content-box">
            {{ evaluationInfo.content || '暂无评价内容' }}
          </div>
        </div>

        <div class="update-time">
          <span class="update-label">最后更新时间：</span>
          <span class="update-value">{{ formatDate(evaluationInfo.updateTime) }}</span>
        </div>
      </el-card>
    </div>
    <div v-else class="no-data">
      <el-empty description="没有找到相关评价信息">
        <el-button type="primary" @click="fetchEvaluationInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { queryEvaluationByEmrId } from "@/api/evaluation"
import { queryByUserId } from "@/api/user"

export default {
  name: "evaluationInfo",
  props: {
    emrId: {
      type: [String, Number],
      required: true,
    }
  },
  data() {
    return {
      evaluationInfo: null,
      loading: false,
      patientName: '',
      doctorName: '',
      userLoading: false
    }
  },
  watch: {
    emrId() {
      this.fetchEvaluationInfo()
    }
  },
  // created() {
  //   this.fetchEvaluationInfo()
  // },
  methods: {
    fetchEvaluationInfo() {
      if (!this.emrId) return
      this.loading = true

      // 重置姓名数据，避免显示上一次查询的结果
      this.patientName = ''
      this.doctorName = ''

      queryEvaluationByEmrId(this.emrId)
        .then(response => {
          this.evaluationInfo = response.data
          console.log('评价信息：', this.evaluationInfo)

          // 获取评价信息成功后，继续获取患者和医生信息
          if (this.evaluationInfo) {
            this.fetchUserInfo()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取患者和医生信息
    fetchUserInfo() {
      if (!this.evaluationInfo) return

      this.userLoading = true

      // 获取患者信息
      if (this.evaluationInfo.patientId) {
        queryByUserId(this.evaluationInfo.patientId, 'patient')
          .then(response => {
            if (response && response.data) {
              this.patientName = response.data.realName || '未知患者'
            }
          })
          .catch(error => {
            console.error('获取患者信息失败:', error)
            this.patientName = '获取失败'
          })
      }

      // 获取医生信息
      if (this.evaluationInfo.doctorId) {
        queryByUserId(this.evaluationInfo.doctorId, 'doctor')
          .then(response => {
            if (response && response.data) {
              this.doctorName = response.data.realName || '未知医生'
            }
          })
          .catch(error => {
            console.error('获取医生信息失败:', error)
            this.doctorName = '获取失败'
          })
          .finally(() => {
            this.userLoading = false
          })
      } else {
        this.userLoading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '未知';

      try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } catch (e) {
        return dateString;
      }
    }
  }
}
</script>

<style scoped>
.evaluation-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.evaluation-info-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.evaluation-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  padding: 10px 0;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.evaluation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #409EFF;
}

.evaluation-title i {
  color: #409EFF;
}

.evaluation-time {
  font-size: 14px;
  color: #909399;
}

.time-label {
  margin-right: 5px;
}

.time-value {
  color: #606266;
}

.evaluation-basic-info {
  margin-top: 15px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.field-label {
  color: #606266;
  font-size: 13px;
  font-weight: 500;
  margin-right: 6px;
  white-space: nowrap;
}

.info-content {
  font-size: 13px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #409EFF;
}

.section-title i {
  color: #409EFF;
}

.content-box {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 6px;
  line-height: 1.8;
  border-left: 4px solid #409EFF;
  font-size: 15px;
  white-space: pre-wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.update-time {
  margin-top: 20px;
  text-align: right;
  font-size: 13px;
  color: #909399;
}

.update-label {
  margin-right: 5px;
}

.no-data {
  padding: 3%;
  text-align: center;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .info-item {
    flex: 1 0 100%;
  }

  .evaluation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

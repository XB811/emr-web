<template>
  <div class="emr-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !emrInfo" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 有数据时显示病历信息 -->
    <div
      v-else-if="emrInfo"
      class="emr-info-content"
      v-loading="loading"
      element-loading-text="正在加载病历信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="emr-info-card" shadow="hover">
        <div slot="header" class="card-header">
          <div class="emr-header">
<!--            <el-avatar :size="50" icon="el-icon-document" class="emr-avatar"></el-avatar>-->
            <div class="emr-info-header">
              <div class="patient-info">
                <span class="info-label"><i class="el-icon-user"></i> 患者姓名：</span>
                <span class="info-content patient-name">{{ emrInfo.realName }}</span>
              </div>
              <div class="doctor-info">
                <span class="info-label"><i class="el-icon-s-custom"></i> 医生姓名：</span>
                <span class="info-content doctor-name">{{ emrInfo.doctorName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="emr-basic-info">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-info"></i>
              <span>基本信息</span>
            </div>
          </div>
          <div class="info-content-row">
            <div class="info-item">
              <span class="field-label">性别：</span>
              <span class="info-content">{{ emrInfo.gender ? '女' : '男' }}</span>
            </div>
            <div class="info-item">
              <span class="field-label">年龄：</span>
              <span class="info-content">{{ emrInfo.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="field-label">科室：</span>
              <span class="info-content">{{ emrInfo.departmentName }}</span>
            </div>
            <div class="info-item">
              <span class="field-label">创建时间：</span>
              <span class="info-content">{{ formatDate(emrInfo.createTime) }}</span>
            </div>
          </div>
        </div>

        <el-divider></el-divider>

        <!-- 调整位置：将主诉显示在前面 -->
        <div class="emr-main-complaint">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-chat-dot-square"></i>
              <span>主诉</span>
            </div>
          </div>
          <div class="complaint-content">
            {{ emrInfo.content || '无记录' }}
          </div>
        </div>

        <el-divider></el-divider>

        <div class="emr-medical-info">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-notebook-1"></i>
              <span>病史记录</span>
            </div>
          </div>

          <el-tabs type="border-card">
            <el-tab-pane label="现病史">
              <div class="tab-content">{{ emrInfo.presentHistory || '无记录' }}</div>
            </el-tab-pane>
            <el-tab-pane label="既往史">
              <div class="tab-content">{{ emrInfo.pastHistory || '无记录' }}</div>
            </el-tab-pane>
            <el-tab-pane label="过敏史">
              <div class="tab-content">{{ emrInfo.allergyHistory || '无记录' }}</div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <el-divider></el-divider>

        <div class="emr-diagnosis">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-medicine-box"></i>
              <span>诊断及治疗</span>
            </div>
          </div>

          <el-collapse>
            <el-collapse-item title="诊断结果" name="1">
              <div class="collapse-content">{{ emrInfo.diagnosis || '无记录' }}</div>
            </el-collapse-item>
            <el-collapse-item title="治疗方案" name="2">
              <div class="collapse-content">{{ emrInfo.treatmentPlan || '无记录' }}</div>
            </el-collapse-item>
            <el-collapse-item title="医嘱" name="3">
              <div class="collapse-content">{{ emrInfo.doctorAdvice || '无记录' }}</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
    <div v-else class="no-data">
      <el-empty description="没有找到病历信息">
        <el-button type="primary" @click="fetchEmrInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { queryById } from "@/api/emr"

export default {
  name: "emrInfo",
  props:{
    id:{
      type: [String, Number],
      required: true,
    }
  },
  data(){
    return{
      emrInfo: null,
      loading: false
    }
  },
  watch:{
    id() {
      this.fetchEmrInfo()
    }
  },
  created() {
    this.fetchEmrInfo()
  },
  methods:{
    fetchEmrInfo() {
      if (!this.id) return
      this.loading = true

      queryById(this.id)
        .then(response => {
          this.emrInfo = response.data
          console.log('病历信息：', this.emrInfo)
        })
        .catch(error => {
          console.error('获取病历信息失败:', error)
          this.$message.error('获取病历信息失败')
        })
        .finally(() => {
          this.loading = false
        })
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
.emr-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.emr-info-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.emr-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  padding: 10px 0;
}

.emr-header {
  display: flex;
  align-items: center;
}

.emr-avatar {
  margin-right: 16px;
  background-color: #409EFF;
}

.emr-info-header {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.patient-info, .doctor-info {
  display: flex;
  align-items: center;
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

.info-label {
  color: #409EFF;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  min-width: 100px;
}

.info-label i {
  margin-right: 5px;
  color: #409EFF;
}

.info-content {
  font-size: 14px;
  padding: 0 8px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 4px 12px;
  border-radius: 4px;
}

.patient-name, .doctor-name {
  color: #409EFF;
  font-weight: 500;
}

.field-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
}

.info-content-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1 0 40%;
}

/* 新增主诉相关样式 */
.emr-main-complaint {
  margin-top: 15px;
  margin-bottom: 15px;
}

.complaint-content {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 6px;
  line-height: 1.8;
  border-left: 4px solid #409EFF;
  font-size: 15px;
  white-space: pre-wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.emr-medical-info, .emr-diagnosis {
  margin-top: 20px;
}

.tab-content, .collapse-content {
  padding: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
}

:deep(.el-tabs__item) {
  color: #606266;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

.no-data {
  padding: 3%;
  text-align: center;
}

@media (max-width: 768px) {
  .info-content-row {
    flex-direction: column;
    gap: 10px;
  }

  .info-item {
    flex: 1 0 100%;
  }

  .emr-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .emr-avatar {
    margin-bottom: 10px;
  }
}
</style>

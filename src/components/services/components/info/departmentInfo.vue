<template>
  <div class="department-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !departmentInfo" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 有数据时显示科室信息 -->
    <div
      v-else-if="departmentInfo"
      class="department-info-content"
      v-loading="loading"
      element-loading-text="正在加载科室信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="department-info-card" shadow="never">
        <div slot="header" class="card-header">
          <div class="department-header">
            <el-avatar :size="50" icon="el-icon-office-building" class="department-avatar"></el-avatar>
            <div class="department-info-header">
              <div class="department-name-info">
                <span class="info-label"><i class="el-icon-office-building"></i> 科室名称：</span>
                <span class="info-content department-name">{{ departmentInfo.name }}</span>
              </div>
              <div class="department-code-info">
                <span class="info-label"><i class="el-icon-collection-tag"></i> 科室编码：</span>
                <el-tag size="small" type="primary">
                  {{ departmentInfo.code }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="department-detail-section">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-document"></i>
              <span>科室详情</span>
            </div>
          </div>
          <div class="detail-content">
            {{ departmentInfo.detail || '暂无科室详情' }}
          </div>
        </div>

        <div class="department-address-section">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-location"></i>
              <span>科室位置</span>
            </div>
          </div>
          <div class="address-content">
            {{ departmentInfo.address || '暂无科室位置信息' }}
          </div>
        </div>
      </el-card>
    </div>

    <div v-else class="no-data">
      <el-empty description="没有找到科室信息">
        <el-button type="primary" @click="fetchDepartmentInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { queryDepartmentById } from "@/api/department"

export default {
  name: "departmentInfo",
  props:{
    id:{
      type: [String, Number],
      required: true,
    }
  },
  data(){
    return{
      departmentInfo: null,
      loading: false
    }
  },
  watch:{
    id() {
      this.fetchDepartmentInfo()
    }
  },
  // created() {
  //   this.fetchDepartmentInfo()
  // },
  methods:{
    fetchDepartmentInfo() {
      if (!this.id) return
      this.loading = true

      queryDepartmentById(this.id)
        .then(response => {
          this.departmentInfo = response.data
        })
        .catch(error => {
          console.error('获取科室信息失败:', error)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.department-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.department-info-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.department-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  padding: 10px 0;
}

.department-header {
  display: flex;
  align-items: center;
}

.department-avatar {
  margin-right: 16px;
  background-color: #409EFF;
}

.department-info-header {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.department-name-info, .department-code-info {
  display: flex;
  align-items: center;
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

.department-name {
  color: #409EFF;
  font-weight: 500;
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

.department-detail-section, .department-address-section {
  margin-top: 20px;
  padding: 0 10px;
}

.detail-content, .address-content {
  color: #606266;
  line-height: 1.8;
  padding: 0 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 12px;
}

.no-data {
  padding: 3%;
  text-align: center;
}
</style>

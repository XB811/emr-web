<template>
  <div class="doctor-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !userInfo" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 有数据时显示用户信息 -->
    <div
      v-else-if="userInfo"
      class="user-info-container"
      v-loading="loading"
      element-loading-text="正在加载医生信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="user-info-card" shadow="hover">
        <div slot="header" class="card-header">
          <div class="user-header">
            <el-avatar :size="80" icon="el-icon-s-custom" class="user-avatar"></el-avatar>
            <div class="user-title">
              <h2>{{ userInfo.realName || '未知医生' }}</h2>
              <div class="doctor-tags">
                <el-tag size="small" type="primary">{{ userType }}</el-tag>
                <el-tag size="small" type="success" v-if="userInfo.title">{{ userInfo.title }}</el-tag>
                <el-tag size="small" type="warning" v-if="userInfo.department">{{ userInfo.department }}</el-tag>
              </div>
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
          <el-descriptions-item label="性别">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-s-custom"></i> 性别：</span>
              <span class="info-content">{{ userInfo.gender ==0?"男":"女" }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-phone-outline"></i> 联系电话：</span>
              <el-link type="primary" @click.native="clickPhone" :underline="false" icon="el-icon-phone">{{ userInfo.phone }}</el-link>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="职称">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-medal"></i> 职称：</span>
              <span class="info-content">{{ userInfo.title || '未设置' }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="所属科室">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-office-building"></i> 所属科室：</span>
              <span class="info-content">{{ departmentName || '未设置' }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="专业领域">
            <div class="info-item">
              <span class="field-label"><i class="el-icon-collection-tag"></i> 专业领域：</span>
              <div class="specialty-tags">
                <el-tag size="small" v-for="(specialty, index) in specialtyList" :key="index" style="margin-right: 5px;">
                  {{ specialty }}
                </el-tag>
                <span v-if="!specialtyList || specialtyList.length === 0" class="no-data-text">暂无数据</span>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <div v-else class="no-data">
      <el-empty description="没有找到医生信息">
        <el-button type="primary" @click="fetchUserInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>
<script>
import { queryByUserId, queryActualByUserId } from "@/api/user"
import { queryDepartmentById } from "@/api/department" // 导入获取科室信息的API

export default {
  name: 'DoctorInfo',
  props:{
    userType: {
      type: String,
      default: "doctor",
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
       loading: false,
       departmentName: null, // 添加科室名称字段
       specialtyList: [] // 添加专业领域列表
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
  // created() {
  //   this.fetchUserInfo()
  // },
  methods:{
    fetchUserInfo() {
      if (!this.id || !this.userType) return
      this.loading = true
      const apiMethod = this.isActual ? queryActualByUserId : queryByUserId

      apiMethod(this.id, this.userType)
        .then(response => {
          //console.log('医生信息:', response.data)
          this.userInfo = response.data
          //console.log(this.userInfo)

          // 处理专业领域数据
          this.processSpecialty(this.userInfo);

          // 获取科室信息
          if (this.userInfo && this.userInfo.departmentId) {
            this.fetchDepartmentName(this.userInfo.departmentId);
          } else {
            this.departmentName = null;
          }
        })
        .catch(error => {
          console.error('获取医生信息失败:', error)
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 处理专业领域数据
    processSpecialty(userData) {
      this.specialtyList = [];

      // 优先处理specialty字段
      if (userData.specialty) {
        if (typeof userData.specialty === 'string') {
          try {
            this.specialtyList = JSON.parse(userData.specialty);
          } catch (e) {
            // 如果解析失败，将字符串分割为数组
            this.specialtyList = userData.specialty.split(',').map(item => item.trim());
          }
        } else if (Array.isArray(userData.specialty)) {
          this.specialtyList = userData.specialty;
        }
      }
      // 兼容处理specialties字段（如果specialty不存在）
      else if (userData.specialties) {
        if (typeof userData.specialties === 'string') {
          try {
            this.specialtyList = JSON.parse(userData.specialties);
          } catch (e) {
            this.specialtyList = userData.specialties.split(',').map(item => item.trim());
          }
        } else if (Array.isArray(userData.specialties)) {
          this.specialtyList = userData.specialties;
        }
      }
    },

    // 获取科室名称
    fetchDepartmentName(departmentId) {
      queryDepartmentById(departmentId)
        .then(response => {
          if (response && response.data) {
            this.departmentName = response.data.name;
          } else {
            this.departmentName = '未知科室';
          }
        })
        .catch(error => {
          console.error('获取科室信息失败:', error);
          this.departmentName = '获取科室信息失败';
        });
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
          console.error('获取医生电话失败:', error)
        })
    }
  }
}
</script>

<style scoped>
.doctor-info-container {
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
  background-color: #67C23A;
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

.doctor-tags {
  display: flex;
  gap: 8px;
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
  background-color: #f5f7fa;
  padding: 4px 12px;
  border-radius: 4px;
}

.no-data {
  padding: 3%;
  text-align: center;
}

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
  color: #67C23A;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.no-data-text {
  color: #909399;
  font-style: italic;
  font-size: 13px;
}
</style>

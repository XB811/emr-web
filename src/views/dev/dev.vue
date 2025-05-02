<template>
  <div class="dev-container">
    <h1 class="page-title">开发者管理面板</h1>

    <el-row :gutter="20">
      <!-- 预约时间管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-date"></i> 预约时间管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleBookingInfo">
              <i class="el-icon-view"></i> 查看预约时间
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleBookingUpdate">
              <i class="el-icon-edit"></i> 修改预约时间
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleBookingCreate">
              <i class="el-icon-plus"></i> 创建预约时间
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 科室信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-office-building"></i> 科室信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleDepartmentInfo">
              <i class="el-icon-view"></i> 查看科室信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleDepartmentUpdate">
              <i class="el-icon-edit"></i> 修改科室信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleDepartmentCreate">
              <i class="el-icon-plus"></i> 创建科室信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 病历信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-document-checked"></i> 病历信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleEmrInfo">
              <i class="el-icon-view"></i> 查看病历信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleEmrUpdate">
              <i class="el-icon-edit"></i> 修改病历信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleEmrCreate">
              <i class="el-icon-plus"></i> 创建病历信息
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预约时间查看对话框 -->
    <booking-info-button
      ref="bookingInfoBtn"
      :booking-id="currentBookingId">
    </booking-info-button>

    <!-- 预约时间更新对话框 -->
    <booking-change-button
      ref="bookingUpdateBtn"
      :booking-id="currentBookingId"
      :doctor-id="doctorId"
      create-or-update="update"
      @submit-success="handleInfoRefresh">
    </booking-change-button>

    <!-- 预约时间创建对话框 -->
    <booking-change-button
      ref="bookingCreateBtn"
      :doctor-id="doctorId"
      create-or-update="create"
      @submit-success="handleInfoRefresh">
    </booking-change-button>

    <!-- 科室信息查看对话框 -->
    <department-info-button
      ref="departmentInfoBtn"
      :department-id="currentDepartmentId">
    </department-info-button>

    <!-- 科室信息更新对话框 -->
    <department-change-button
      ref="departmentUpdateBtn"
      :department-id="currentDepartmentId"
      create-or-update="update"
      @submit-success="handleInfoRefresh">
    </department-change-button>

    <!-- 科室信息创建对话框 -->
    <department-change-button
      ref="departmentCreateBtn"
      create-or-update="create"
      @submit-success="handleInfoRefresh">
    </department-change-button>

    <!-- 病历信息查看对话框 -->
    <emr-info-button
      ref="emrInfoBtn"
      :emr-id="currentEmrId">
    </emr-info-button>

    <!-- 病历信息更新对话框 -->
    <emr-change-button
      ref="emrUpdateBtn"
      :emr-id="currentEmrId"
      create-or-update="update"
      @submit-success="handleInfoRefresh">
    </emr-change-button>

    <!-- 病历信息创建对话框 -->
    <emr-change-button
      ref="emrCreateBtn"
      :patient-id="patientId"
      :department-id="currentDepartmentId"
      :doctor-id="doctorId"
      create-or-update="create"
      @submit-success="handleInfoRefresh">
    </emr-change-button>
  </div>
</template>

<script>
import BookingInfoButton from "@/components/services/button/info/bookingInfoButton.vue";
import BookingChangeButton from "@/components/services/button/change/bookingChangeButton.vue";
import DepartmentInfoButton from "@/components/services/button/info/departmentInfoButton.vue";
import DepartmentChangeButton from "@/components/services/button/change/departmentChangeButton.vue";
import EmrInfoButton from "@/components/services/button/info/emrInfoButton.vue";
import EmrChangeButton from "@/components/services/button/change/emrChangeButton.vue";

export default {
  name: "DevPanel",
  components: {
    BookingInfoButton,
    BookingChangeButton,
    DepartmentInfoButton,
    DepartmentChangeButton,
    EmrInfoButton,
    EmrChangeButton
  },
  data() {
    return {
      currentBookingId: "1916419040428355584",
      doctorId: "1915589781283328000",
      currentDepartmentId: "1916022805250674688", // 科室ID固定值
      currentEmrId: "1916122182308970496", // 病历ID
      patientId: "1916105931234803712" // 患者ID
    };
  },
  methods: {
    // 预约时间相关方法
    handleBookingInfo() {
      this.$refs.bookingInfoBtn.openInfoDialog();
    },

    handleBookingUpdate() {
      this.$refs.bookingUpdateBtn.openChangeDialog();
    },

    handleBookingCreate() {
      this.$refs.bookingCreateBtn.openChangeDialog();
    },

    // 科室信息相关方法
    handleDepartmentInfo() {
      this.$refs.departmentInfoBtn.openInfoDialog();
    },

    handleDepartmentUpdate() {
      this.$refs.departmentUpdateBtn.openChangeDialog();
    },

    handleDepartmentCreate() {
      this.$refs.departmentCreateBtn.openChangeDialog();
    },

    // 病历信息方法
    handleEmrInfo() {
      this.$refs.emrInfoBtn.openInfoDialog();
    },

    handleEmrUpdate() {
      this.$refs.emrUpdateBtn.openChangeDialog();
    },

    handleEmrCreate() {
      this.$refs.emrCreateBtn.openChangeDialog();
    },

    // 通用刷新方法
    handleInfoRefresh() {
      this.$message({
        type: 'success',
        message: '操作成功，数据已更新',
        duration: 2000
      });
    }
  }
}
</script>

<style scoped>
.dev-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.action-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.card-header h2 i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px 15px;
}

.action-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 6px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button i {
  margin-right: 8px;
  font-size: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-card {
    margin-bottom: 20px;
  }

  .action-button {
    font-size: 14px;
  }
}
</style>

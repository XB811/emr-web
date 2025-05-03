<template>
  <div class="dev-container">
    <h1 class="page-title">开发者管理面板</h1>

    <el-row :gutter="20">
      <!-- 预约时间管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
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
        <el-card shadow="never" class="action-card">
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
        <el-card shadow="never" class="action-card">
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

      <!-- 评价信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-s-comment"></i> 就诊评价</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleEvaluationInfo">
              <i class="el-icon-view"></i> 查看评价信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleEvaluationUpdate">
              <i class="el-icon-edit"></i> 修改评价信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleEvaluationCreate">
              <i class="el-icon-plus"></i> 添加评价信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 公告信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-bell"></i> 公告信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleNoticeInfo">
              <i class="el-icon-view"></i> 查看公告信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleNoticeUpdate">
              <i class="el-icon-edit"></i> 修改公告信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleNoticeCreate">
              <i class="el-icon-plus"></i> 创建公告信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 管理员信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-user"></i> 管理员信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleAdminInfo">
              <i class="el-icon-view"></i> 查看管理员信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleAdminUpdate">
              <i class="el-icon-edit"></i> 修改管理员信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleAdminCreate">
              <i class="el-icon-plus"></i> 创建管理员信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 患者信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-user"></i> 患者信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handlePatientInfo">
              <i class="el-icon-view"></i> 查看患者信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handlePatientUpdate">
              <i class="el-icon-edit"></i> 修改患者信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handlePatientCreate">
              <i class="el-icon-plus"></i> 创建患者信息
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 医生信息管理卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" class="action-card">
          <div slot="header" class="card-header">
            <h2><i class="el-icon-user"></i> 医生信息管理</h2>
          </div>
          <div class="action-buttons">
            <el-button type="primary" plain class="action-button" @click="handleDoctorInfo">
              <i class="el-icon-view"></i> 查看医生信息
            </el-button>

            <el-button type="success" plain class="action-button" @click="handleDoctorUpdate">
              <i class="el-icon-edit"></i> 修改医生信息
            </el-button>

            <el-button type="warning" plain class="action-button" @click="handleDoctorCreate">
              <i class="el-icon-plus"></i> 创建医生信息
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

    <!-- 评价信息查看对话框 -->
    <evaluation-info-button
      ref="evaluationInfoBtn"
      :emr-id="currentEmrId">
    </evaluation-info-button>

    <!-- 评价信息更新对话框 -->
    <evaluation-change-button
      ref="evaluationUpdateBtn"
      :id="currentEvaluationId"
      create-or-update="update"
      @submit-success="handleInfoRefresh">
    </evaluation-change-button>

    <!-- 评价信息创建对话框 -->
    <evaluation-change-button
      ref="evaluationCreateBtn"
      :emr-id="currentEmrId"
      :doctor-id="doctorId"
      :patient-id="patientId"
      create-or-update="create"
      @submit-success="handleInfoRefresh">
    </evaluation-change-button>

    <!-- 公告信息查看对话框 -->
    <notice-info-button
      ref="noticeInfoBtn"
      :notice-id="currentNoticeId">
    </notice-info-button>

    <!-- 公告信息更新对话框 -->
    <notice-change-button
      ref="noticeUpdateBtn"
      :notice-id="currentNoticeId"
      create-or-update="update"
      @submit-success="handleInfoRefresh">
    </notice-change-button>

    <!-- 公告信息创建对话框 -->
    <notice-change-button
      ref="noticeCreateBtn"
      :admin-id="adminId"
      :admin-name="adminName"
      create-or-update="create"
      @submit-success="handleInfoRefresh">
    </notice-change-button>

    <!-- 管理员信息查看对话框 -->
    <admin-info-button
      ref="adminInfoBtn"
      :id="adminId"
      :user-type="'admin'">
    </admin-info-button>

    <!-- 管理员信息更新对话框 -->
    <admin-change-button
      ref="adminUpdateBtn"
      :id="adminId"
      :user-type="'admin'"
      create-or-update="update"
      @update-success="handleInfoRefresh">
    </admin-change-button>

    <!-- 管理员信息创建对话框 -->
    <admin-change-button
      ref="adminCreateBtn"
      :user-type="'admin'"
      create-or-update="create"
      @update-success="handleInfoRefresh">
    </admin-change-button>

    <!-- 患者信息查看对话框 -->
    <patient-info-button
      ref="patientInfoBtn"
      :id="patientId"
      :user-type="'patient'">
    </patient-info-button>

    <!-- 患者信息更新对话框 -->
    <patient-change-button
      ref="patientUpdateBtn"
      :id="patientId"
      :user-type="'patient'"
      create-or-update="update"
      @update-success="handleInfoRefresh">
    </patient-change-button>

    <!-- 患者信息创建对话框 -->
    <patient-change-button
      ref="patientCreateBtn"
      :user-type="'patient'"
      create-or-update="create"
      @update-success="handleInfoRefresh">
    </patient-change-button>

    <!-- 医生信息查看对话框 -->
    <doctor-info-button
      ref="doctorInfoBtn"
      :id="doctorId"
      :user-type="'doctor'">
    </doctor-info-button>

    <!-- 医生信息更新对话框 -->
    <doctor-change-button
      ref="doctorUpdateBtn"
      :id="doctorId"
      :user-type="'doctor'"
      create-or-update="update"
      @update-success="handleInfoRefresh">
    </doctor-change-button>

    <!-- 医生信息创建对话框 -->
    <doctor-change-button
      ref="doctorCreateBtn"
      :user-type="'doctor'"
      create-or-update="create"
      @update-success="handleInfoRefresh">
    </doctor-change-button>
  </div>
</template>

<script>
import BookingInfoButton from "@/components/services/button/info/bookingInfoButton.vue";
import BookingChangeButton from "@/components/services/button/change/bookingChangeButton.vue";
import DepartmentInfoButton from "@/components/services/button/info/departmentInfoButton.vue";
import DepartmentChangeButton from "@/components/services/button/change/departmentChangeButton.vue";
import EmrInfoButton from "@/components/services/button/info/emrInfoButton.vue";
import EmrChangeButton from "@/components/services/button/change/emrChangeButton.vue";
import EvaluationInfoButton from "@/components/services/button/info/evaluationInfoButton.vue";
import EvaluationChangeButton from "@/components/services/button/change/evaluationChangeButton.vue";
import NoticeInfoButton from "@/components/services/button/info/noticeInfoButton.vue";
import NoticeChangeButton from "@/components/services/button/change/noticeChangeButton.vue";
import AdminInfoButton from "@/components/user/button/adminInfoButton.vue";
import AdminChangeButton from "@/components/user/button/admineChangeButton.vue";
import PatientInfoButton from "@/components/user/button/patientInfoButton.vue";
import PatientChangeButton from "@/components/user/button/patientChangeButton.vue";
import DoctorInfoButton from "@/components/user/button/doctorInfoButton.vue";
import DoctorChangeButton from "@/components/user/button/doctorChangeButton.vue";

export default {
  name: "DevPanel",
  components: {
    BookingInfoButton,
    BookingChangeButton,
    DepartmentInfoButton,
    DepartmentChangeButton,
    EmrInfoButton,
    EmrChangeButton,
    EvaluationInfoButton,
    EvaluationChangeButton,
    NoticeInfoButton,
    NoticeChangeButton,
    AdminInfoButton,
    AdminChangeButton,
    PatientInfoButton,
    PatientChangeButton,
    DoctorInfoButton,
    DoctorChangeButton
  },
  data() {
    return {
      currentBookingId: "1916419040428355584",
      doctorId: "1915589781283328000",
      currentDepartmentId: "1916022805250674688", // 科室ID固定值
      currentEmrId: "1916122182308970496", // 病历ID
      patientId: "1916105931234803712", // 患者ID
      currentEvaluationId: "1916756386835312640", // 评价ID
      currentNoticeId: "1916504501951889408", // 公告ID，根据实际情况修改
      adminId: "1909682792019578880", // 管理员ID，用于创建公告
      adminName: "系统管理员" // 管理员姓名，用于创建公告
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

    // 评价信息方法
    handleEvaluationInfo() {
      this.$refs.evaluationInfoBtn.openInfoDialog();
    },

    handleEvaluationUpdate() {
      this.$refs.evaluationUpdateBtn.openChangeDialog();
    },

    handleEvaluationCreate() {
      this.$refs.evaluationCreateBtn.openChangeDialog();
    },

    // 公告信息方法
    handleNoticeInfo() {
      this.$refs.noticeInfoBtn.openInfoDialog();
    },

    handleNoticeUpdate() {
      this.$refs.noticeUpdateBtn.openChangeDialog();
    },

    handleNoticeCreate() {
      this.$refs.noticeCreateBtn.openChangeDialog();
    },

    // 管理员信息相关方法
    handleAdminInfo() {
      this.$refs.adminInfoBtn.openInfoDialog();
    },

    handleAdminUpdate() {
      this.$refs.adminUpdateBtn.openChangeDialog();
    },

    handleAdminCreate() {
      this.$refs.adminCreateBtn.openChangeDialog();
    },

    // 患者信息相关方法
    handlePatientInfo() {
      this.$refs.patientInfoBtn.openInfoDialog();
    },

    handlePatientUpdate() {
      this.$refs.patientUpdateBtn.openChangeDialog();
    },

    handlePatientCreate() {
      this.$refs.patientCreateBtn.openChangeDialog();
    },

    // 医生信息相关方法
    handleDoctorInfo() {
      this.$refs.doctorInfoBtn.openInfoDialog();
    },

    handleDoctorUpdate() {
      this.$refs.doctorUpdateBtn.openChangeDialog();
    },

    handleDoctorCreate() {
      this.$refs.doctorCreateBtn.openChangeDialog();
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

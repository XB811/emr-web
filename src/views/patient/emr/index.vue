<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 数据表格 -->
      <div class="table-header">
        <h3>我的电子病历</h3>
        <div style="display: flex">
          <el-button type="info" icon="el-icon-refresh" size="small" @click="fetchData">刷新</el-button>
        </div>
      </div>

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        style="width: 100%"
        stripe
        highlight-current-row
      >
        <el-table-column
          prop="departmentName"
          label="就诊科室"
          align="center"
          width="120"
        />
        <el-table-column
          label="主治医生"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <doctor-info-button
              :id="scope.row.doctorId"
              :user-type="'doctor'"
              >
              <span class="name-link">{{scope.row.doctorName}}</span>
            </doctor-info-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="就诊时间"
          align="center"
          width="160"
        >
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          align="center"
          width="160"
        >
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="220"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 查看病历详情按钮 -->
              <emr-info-button
                :emr-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-document"
                >病历详情</el-button>
              </emr-info-button>

              <!-- 查看挂号详情按钮 -->
              <registration-info-button
                :registration-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >挂号详情</el-button>
              </registration-info-button>

              <!-- 查看/添加评价按钮 -->
              <div v-if ="emrEvaluationStatus[scope.row.id]">
              <evaluation-info-button

                :emr-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="success"
                  icon="el-icon-star-on"
                >我的评价</el-button>
              </evaluation-info-button>
              </div>
              <div v-else>
              <evaluation-change-button

                :emr-id="scope.row.id"
                :doctor-id="scope.row.doctorId"
                :patient-id="scope.row.patientId"
                :create-or-update="'create'"
                >
                <el-button
                  size="mini"
                  type="success"
                  icon="el-icon-edit"
                  >进行评价</el-button>
              </evaluation-change-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        class="pagination"
        background
        layout="total, prev, pager, next, jumper"
        :current-page.sync="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script>
import { pageQuery } from '@/api/emr'
import RegistrationInfoButton from '@/components/services/button/info/registrationInfoButton'
import EmrInfoButton from '@/components/services/button/info/emrInfoButton'
import EvaluationInfoButton from '@/components/services/button/info/evaluationInfoButton'
import DoctorInfoButton from "@/components/user/button/doctorInfoButton.vue"
import store from '@/store'
import EvaluationChangeButton from "@/components/services/button/change/evaluationChangeButton.vue";
import {hasEvaluation} from "@/api/evaluation";

export default {
  name: 'PatientEmrList',
  components: {
    EvaluationChangeButton,
    DoctorInfoButton,
    RegistrationInfoButton,
    EmrInfoButton,
    EvaluationInfoButton
  },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 表格加载状态
      tableLoading: false,
      // 分页参数
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 当前患者ID
      patientId: store.getters.userId,
      emrEvaluationStatus: {} // 存储每个病历的评价状态
    }
  },
  created() {
    // 页面加载时获取数据
    this.fetchData()
  },
  methods: {
    // 获取电子病历数据
    fetchData() {
      if (!this.patientId) {
        this.$message.error('获取用户ID失败')
        return
      }

      this.tableLoading = true

      const params = {
        patientId: this.patientId
      }

      pageQuery(
        params,
        this.pagination.current - 1, // API从0开始计数
        this.pagination.size
      )
        .then(response => {
          if (response && response.code === '0') {  // 状态码判断
            this.tableData = response.data.records
            this.tableData.forEach(record =>{
              this.checkEvaluationStatus(record.id)
            })
            this.pagination.total = response.data.total
            this.pagination.current = response.data.current + 1 // 调整为从1开始
            this.pagination.size = response.data.size
          } else {
            this.$message.error('获取数据失败: ' + (response ? response.message : '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取病历数据出错:', error)
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    // 检查评价状态并更新到本地状态
    checkEvaluationStatus(emrId) {
      hasEvaluation(emrId)
        .then(response => {
          if (response && response.code === '0') {
            // 使用Vue.set确保响应式更新
            this.$set(this.emrEvaluationStatus, emrId, response.data)
          } else {
            this.$set(this.emrEvaluationStatus, emrId, false)
          }
        })
        .catch(() => {
          this.$set(this.emrEvaluationStatus, emrId, false)
        })
    },

    // 格式化日期时间
    formatDateTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}`
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.table-container {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.name-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

/* 确保按钮等宽 */
.action-buttons .el-button {
  min-width: 85px;
  margin: 2px;
  padding-left: 6px;
  padding-right: 6px;
}

/* 表格样式增强 */
/deep/ .el-table {
  border-radius: 8px;
  overflow: hidden;
}

/deep/ .el-table th {
  background-color: #f5f7fa;
}

/deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/deep/ .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f0f9eb;
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>

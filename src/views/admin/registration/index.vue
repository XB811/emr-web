<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input
            v-model="searchForm.patientName"
            placeholder="请输入患者姓名"
            clearable
            style="width: 100%; min-width: 200px;"
            @change="handlePatientNameChange">
          </el-input>
        </el-form-item>
        <el-form-item label="医生">
          <el-select v-model="searchForm.doctorId" filterable placeholder="请选择医生" clearable>
            <el-option
              v-for="doctor in doctorList"
              :key="doctor.id"
              :label="doctor.realName"
              :value="doctor.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="searchForm.appointmentDate"
            type="date"
            placeholder="选择预约日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="完成状态">
          <el-select v-model="searchForm.isFinish" placeholder="请选择状态" clearable>
            <el-option :key="1" label="已完成" :value="1"></el-option>
            <el-option :key="0" label="未完成" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <div class="table-header">
        <h3>挂号列表</h3>
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
          label="患者姓名"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <patient-info-button
              :id="scope.row.patientId"
              user-type="patient"
            >
              <span class="patient-name-link">{{ getPatientName(scope.row.patientId) }}</span>
            </patient-info-button>
          </template>
        </el-table-column>
        <el-table-column
          label="医生姓名"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <doctor-info-button
              :id="scope.row.doctorId"
              user-type="doctor"
            >
              <span class="doctor-name-link">{{ getDoctorName(scope.row.doctorId) }}</span>
            </doctor-info-button>
          </template>
        </el-table-column>
        <el-table-column
          label="预约日期"
          align="center"
          width="160"
        >
          <template slot-scope="scope">
            {{ formatChineseDate(scope.row.appointmentDate) }}
          </template>
        </el-table-column>
        <el-table-column
          label="预约时间"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            {{ formatAppointmentTime(scope.row.appointmentTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.isFinish === 1 ? 'success' : 'info'">
              {{ scope.row.isFinish === 1 ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="200"
        >
          <template slot-scope="scope">
            <div class="action-buttons">

              <el-button
                size="mini"
                type="success"
                icon="el-icon-check"
                :disabled="scope.row.isFinish === 1"
                @click="handleFinish(scope.row)"
              >完成</el-button>

              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        class="pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :current-page.sync="pagination.current"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pagination.size"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

  </div>
</template>

<script>
import { pageQuery, dleteRegistration, finishRegistration, getRegistration } from '@/api/registration'
import { queryAll, queryByUserId, pageQuery as userPageQuery } from '@/api/user'
import DoctorInfoButton from '@/components/user/button/doctorInfoButton'
import PatientInfoButton from '@/components/user/button/patientInfoButton'

export default {
  name: 'RegistrationManagement',
  components: {
    DoctorInfoButton,
    PatientInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        patientIds: [], // 存储选中的患者ID
        patientName: '', // 新增: 患者姓名输入
        doctorId: '',
        appointmentDate: '',
        isFinish: '',
        appointmentTime: ''
      },
      // 患者搜索结果缓存
      patientSearchResults: [],
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
      // 医生列表
      doctorList: [],
      // 医生ID到名称的映射
      doctorMap: {},
      // 患者ID到名称的映射
      patientMap: {},
      // 患者数据加载状态
      patientLoading: {},
      // 当前查看的挂号信息
      currentRegistration: null,
      // 患者ID选项
      patientIdOptions: []
    }
  },
  created() {
    // 获取所有医生列表
    this.fetchDoctorList()
    // 页面加载时获取数据
    this.fetchData()
  },
  methods: {
    // 处理患者姓名输入变化
    handlePatientNameChange(value) {
      if (value && value.trim().length > 0) {
        // 根据姓名搜索患者
        userPageQuery(
          { realName: value.trim() },
          0,
          10,
          'patient'
        ).then(response => {
          if (response && response.data && response.data.records && response.data.records.length > 0) {
            // 清空之前的ID列表
            this.searchForm.patientIds = []

            // 将所有匹配的患者ID添加到搜索条件
            response.data.records.forEach(patient => {
              this.searchForm.patientIds.push(patient.id)
              // 更新患者映射
              this.$set(this.patientMap, patient.id, patient.realName)
            })
          } else {
            // 如果没有匹配的患者，清空ID列表
            this.searchForm.patientIds = []
          }
        }).catch(() => {
          this.searchForm.patientIds = []
        })
      } else {
        // 如果输入框被清空，重置患者ID列表
        this.searchForm.patientIds = []
      }
    },

    // 获取医生列表
    fetchDoctorList() {
      queryAll('doctor')
        .then(response => {
          if (response && response.data) {
            this.doctorList = response.data

            // 创建医生ID到名称的映射
            this.doctorList.forEach(doctor => {
              this.doctorMap[doctor.id] = doctor.realName
            })
          }
        }).catch(error => {
          console.error('获取医生列表失败:', error)
        })
    },

    // 获取挂号数据
    fetchData() {
      this.tableLoading = true

      // 构建查询参数对象
      const params = {}

      // 只有在有患者ID时才添加到参数中，并确保使用正确的格式
      if (this.searchForm.patientIds && this.searchForm.patientIds.length > 0) {
        params.patientIds = this.searchForm.patientIds // 不使用 patientIds[] 的格式
        console.log(params.patientIds)
      }

      // 添加其他参数
      if (this.searchForm.doctorId) params.doctorId = this.searchForm.doctorId
      if (this.searchForm.appointmentDate) params.appointmentDate = this.searchForm.appointmentDate
      if (this.searchForm.isFinish !== '') params.isFinish = this.searchForm.isFinish
      if (this.searchForm.appointmentTime) params.appointmentTime = this.searchForm.appointmentTime

      pageQuery(
        params,
        this.pagination.current,
        this.pagination.size
      )
        .then(response => {
          this.tableData = response.data.records
          this.pagination.total = response.data.total
          this.pagination.current = response.data.current
          this.pagination.size = response.data.size

          // 批量获取患者信息
          this.fetchPatientsInfo()
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    // 批量获取患者信息
    fetchPatientsInfo() {
      // 提取所有患者ID
      const patientIds = this.tableData
        .map(item => item.patientId)
        .filter(id => id && !this.patientMap[id]) // 过滤掉已经缓存的ID

      // 如果没有需要查询的患者，则直接返回
      if (patientIds.length === 0) {
        return
      }

      // 为每个患者ID创建一个查询Promise
      patientIds.forEach(patientId => {
        // 标记为加载中
        this.patientLoading[patientId] = true
        this.$set(this.patientMap, patientId, '加载中...')

        queryByUserId(patientId, 'patient')
          .then(response => {
            if (response && response.data) {
              // 更新缓存
              this.$set(this.patientMap, patientId, response.data.realName || '未知患者')
            } else {
              this.$set(this.patientMap, patientId, '未知患者')
            }
          })
          .catch(error => {
            console.error(`获取患者(ID: ${patientId})信息失败:`, error)
            this.$set(this.patientMap, patientId, '数据获取失败')
          })
          .finally(() => {
            this.patientLoading[patientId] = false
          })
      })
    },

    // 根据医生ID获取医生姓名
    getDoctorName(doctorId) {
      return this.doctorMap[doctorId] || '未知医生'
    },

    // 根据患者ID获取患者姓名
    getPatientName(patientId) {
      // 如果没有ID，返回未知患者
      if (!patientId) {
        return '无患者信息'
      }

      // 如果缓存中已有该患者信息，直接返回
      if (this.patientMap[patientId]) {
        return this.patientMap[patientId]
      }

      // 如果该患者正在加载中，返回加载中
      if (this.patientLoading[patientId]) {
        return '加载中...'
      }

      // 否则，发起请求获取患者信息
      this.patientLoading[patientId] = true
      this.$set(this.patientMap, patientId, '加载中...')

      queryByUserId(patientId, 'patient')
        .then(response => {
          if (response && response.data) {
            this.$set(this.patientMap, patientId, response.data.realName || '未知患者')
          } else {
            this.$set(this.patientMap, patientId, '数据获取失败')
          }
        })
        .catch(() => {
          this.$set(this.patientMap, patientId, '数据获取失败')
        })
        .finally(() => {
          this.patientLoading[patientId] = false
        })

      return this.patientMap[patientId] || '加载中...'
    },

    // 格式化日期为中文格式 (例如: 2025年06月07日)
    formatChineseDate(dateString) {
      if (!dateString) return '--'
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}年${month}月${day}日`
    },

    // 格式化预约时间段
    formatAppointmentTime(timeCode) {
      const timeMap = {
        0: '上午',
        1: '下午'
      }
      return timeMap[timeCode] || '未知时段'
    },

    // 处理完成挂号
    handleFinish(row) {
      if (!row || !row.id) {
        this.$message.error('无效的挂号数据')
        return
      }

      this.$confirm('确定要将该挂号标记为已完成吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        finishRegistration(row.id)
          .then(response => {
            this.$message.success('挂号已完成')
            this.fetchData() // 刷新数据
          })
          .catch(error => {
            console.error('完成挂号失败:', error)
            this.$message.error('操作失败')
          })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 在对话框中完成挂号
    handleFinishInDialog() {
      if (this.currentRegistration && this.currentRegistration.isFinish !== 1) {
        finishRegistration(this.currentRegistration.id)
          .then(response => {
            this.$message.success('挂号已完成')
            this.detailDialogVisible = false
            this.fetchData() // 刷新数据
          })
          .catch(error => {
            console.error('完成挂号失败:', error)
            this.$message.error('操作失败')
          })
      }
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的挂号数据')
        return
      }

      this.$confirm('确定要删除该挂号记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        dleteRegistration(row.id)
          .then(response => {
            this.$message.success('删除成功')
            this.fetchData() // 刷新数据
          })
          .catch(error => {
            console.error('删除失败:', error)
            this.$message.error('删除失败')
          })
          .finally(() => {
            this.tableLoading = false
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 处理搜索事件
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        patientIds: [],
        patientName: '', // 重置患者姓名输入
        doctorId: '',
        appointmentDate: '',
        isFinish: '',
        appointmentTime: ''
      }
      this.pagination.current = 1
      this.fetchData()
    },

    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchData()
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

.search-container {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-buttons {
  margin-left: auto;
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* 确保按钮等宽 */
.action-buttons .el-button {
  min-width: 68px;
  margin-left: 0;
  margin-right: 0;
  padding-left: 8px;
  padding-right: 8px;
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

/* 医生姓名链接样式 */
.doctor-name-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.doctor-name-link:hover {
  text-decoration: underline;
}

/* 患者姓名链接样式 */
.patient-name-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.patient-name-link:hover {
  text-decoration: underline;
}

/* 提高多选下拉框的可用性 */
/deep/ .el-select-dropdown__item {
  padding-right: 20px;
}

/deep/ .el-select .el-tag {
  margin: 2px 5px 2px 0;
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

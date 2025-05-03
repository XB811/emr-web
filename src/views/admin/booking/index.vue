<template>
  <div class="app-container">
    <el-card class="table-container" shadow="">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="医生姓名">
          <el-input v-model="searchForm.doctorName" placeholder="请输入医生姓名" clearable />
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.isAvailable" placeholder="请选择状态" clearable>
            <el-option
              :key="true"
              label="可预约"
              :value="true">
            </el-option>
            <el-option
              :key="false"
              label="不可预约"
              :value="false">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <div class="table-header">
        <h3>预约时间列表</h3>
        <div style="display: flex">
          <booking-change-button
            create-or-update="create"
            :doctor-id="currentDoctorId"
            @submit-success="handleUpdateSuccess">
            <el-button type="success" icon="el-icon-plus" size="small">新增预约时间</el-button>
          </booking-change-button>
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
          label="医生姓名"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <doctor-info-button
              :id="scope.row.doctorId"
              user-type="doctor"
            >
              <span class="doctor-name-link">{{ scope.row.doctorName }}</span>
            </doctor-info-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="isAvailable"
          label="状态"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.isAvailable ? 'success' : 'info'">
              {{ scope.row.isAvailable ? '可预约' : '不可预约' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="260"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 详情按钮 -->
              <booking-info-button
                :booking-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >详情</el-button>
              </booking-info-button>

              <!-- 编辑按钮 -->
              <booking-change-button
                :booking-id="scope.row.id"
                :doctor-id="scope.row.doctorId"
                create-or-update="update"
                @submit-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </booking-change-button>

              <!-- 删除按钮 -->
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
import { pageQuery, deleteBooking } from '@/api/booking'
import { queryAll } from '@/api/user'  // 正确导入 queryAll 函数
import BookingChangeButton from '@/components/services/button/change/bookingChangeButton'
import BookingInfoButton from '@/components/services/button/info/bookingInfoButton'
import DoctorInfoButton from '@/components/user/button/doctorInfoButton'

export default {
  name: 'BookingManagement',
  components: {
    DoctorInfoButton,
    BookingChangeButton,
    BookingInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        doctorId: '',
        doctorName: '',
        isAvailable: ''
      },
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
      // 当前选中的医生ID (用于创建新预约时间)
      currentDoctorId: '',
      // 医生ID到名称的映射
      doctorMap: {}  // 添加 doctorMap 初始化
    }
  },
  created() {
    // 获取所有医生列表
    this.fetchDoctorList()
    // 页面加载时获取数据
    this.searchForm.doctorName = this.$route.query.doctorName || undefined
    this.searchForm.doctorId = this.$route.query.doctorId || undefined
    this.searchForm.isAvailable = this.$route.query.isAvailable !== undefined ?
      this.$route.query.isAvailable : ''
    this.fetchData()
  },
  methods: {
    // 获取医生列表
    fetchDoctorList() {
      queryAll('doctor')
        .then(response => {
          if (response && response.data) {
            this.doctorList = response.data

            // 如果存在医生数据，默认选择第一个医生作为创建新预约时使用
            if (this.doctorList.length > 0) {
              this.currentDoctorId = this.doctorList[0].id
            }

            // 创建医生ID到名称的映射
            this.doctorList.forEach(doctor => {
              this.doctorMap[doctor.id] = doctor.realName
            })
          }
        }).catch(error => {
        console.error('获取医生列表失败:', error)
      })
    },

    // 获取预约时间数据
    fetchData() {
      this.tableLoading = true

      const params = {
        doctorId: this.searchForm.doctorId || undefined,
        doctorName: this.searchForm.doctorName || undefined,
        isAvailable: this.searchForm.isAvailable !== '' ? this.searchForm.isAvailable : undefined
      }

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
        })
        .catch(error => {
          console.error('获取预约时间数据出错:', error)
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '--'
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    },

    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '--'
      return timeString.substring(0, 5) // 只显示小时和分钟，如 "09:30"
    },

    // 处理搜索事件
    handleSearch() {
      this.pagination.current = 1
      // 如果搜索选择了医生，也更新当前选中的医生ID
      if (this.searchForm.doctorId) {
        this.currentDoctorId = this.searchForm.doctorId
      }
      this.fetchData()
    },

    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        doctorId: '',
        doctorName: '',
        isAvailable: ''
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
    },

    // 更新成功后的回调
    handleUpdateSuccess() {
      this.$message.success('预约时间更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的预约时间数据')
        return
      }

      this.$confirm('确定要删除该预约时间吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deleteBooking(row.id)
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

/* 医生姓名链接样式 */
.doctor-name-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.doctor-name-link:hover {
  text-decoration: underline;
}
</style>


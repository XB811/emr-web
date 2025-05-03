<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入患者姓名" clearable />
        </el-form-item>
        <el-form-item label="医生姓名">
          <el-input v-model="searchForm.doctorName" placeholder="请输入医生姓名" clearable />
        </el-form-item>
        <el-form-item label="科室编码">
          <el-input v-model="searchForm.departmentCode" placeholder="请输入科室编码" clearable />
        </el-form-item>
        <el-form-item label="科室名称">
          <el-input v-model="searchForm.departmentName" placeholder="请输入科室名称" clearable />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <div class="table-header">
        <h3>电子病历列表</h3>
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
          width="100"
        >
          <template slot-scope = "scope">
            <patient-info-button
              :id="scope.row.patientId"
              :user-type="'patient'"
              >
              <span class = "name-link">{{scope.row.realName}}</span>
            </patient-info-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="gender"
          label="性别"
          align="center"
          width="60"
        >
          <template slot-scope="scope">
            {{ scope.row.gender ? '女' : '男' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          align="center"
          width="60"
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
              <span class = "name-link">{{scope.row.doctorName}}</span>
            </doctor-info-button>

          </template>
        </el-table-column>
        <el-table-column
          prop="departmentCode"
          label="科室编码"
          align="center"
          width="100"
        />
        <el-table-column
          prop="departmentName"
          label="科室名称"
          align="center"
          width="120"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
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
          min-width="300"
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

              <!-- 查看评价信息按钮 -->
              <evaluation-info-button
                :emr-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-star-on"
                >评价详情</el-button>
              </evaluation-info-button>

              <!-- 编辑按钮 -->
              <emr-change-button
                :emr-id="scope.row.id"
                create-or-update="update"
                @submit-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </emr-change-button>

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
import { pageQuery, deleteEmr } from '@/api/emr'
import EmrChangeButton from '@/components/services/button/change/emrChangeButton'
import RegistrationInfoButton from '@/components/services/button/info/registrationInfoButton'
import EmrInfoButton from '@/components/services/button/info/emrInfoButton'
import EvaluationInfoButton from '@/components/services/button/info/evaluationInfoButton'
import PatientInfoButton from "@/components/user/button/patientInfoButton.vue";
import DoctorInfoButton from "@/components/user/button/doctorInfoButton.vue";

export default {
  name: 'EmrManagement',
  components: {
    DoctorInfoButton,
    PatientInfoButton,
    EmrChangeButton,
    RegistrationInfoButton,
    EmrInfoButton,
    EvaluationInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        realName: '',
        doctorName: '',
        departmentCode: '',
        departmentName: ''
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
      }
    }
  },
  created() {
    // 从路由查询参数中获取筛选条件
    this.searchForm.realName = this.$route.query.realName
    this.searchForm.doctorName = this.$route.query.doctorName
    this.searchForm.departmentCode = this.$route.query.departmentCode
    this.searchForm.departmentName = this.$route.query.departmentName
    // 页面加载时获取数据
    this.fetchData()
  },
  methods: {
    // 获取电子病历数据
    fetchData() {
      this.tableLoading = true

      const params = {
        realName: this.searchForm.realName || undefined,
        doctorName: this.searchForm.doctorName || undefined,
        departmentCode: this.searchForm.departmentCode || undefined,
        departmentName: this.searchForm.departmentName || undefined
      }

      pageQuery(
        params,
        this.pagination.current - 1, // API从0开始计数
        this.pagination.size
      )
        .then(response => {
          if (response && response.code === '0') {  // 修正状态码判断
            this.tableData = response.data.records
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

    // 处理搜索事件
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        realName: '',
        doctorName: '',
        departmentCode: '',
        departmentName: ''
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
      this.$message.success('病历信息更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的病历数据')
        return
      }

      this.$confirm('确定要删除该病历吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deleteEmr(row.id)
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
.name-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
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

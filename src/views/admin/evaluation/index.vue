<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="医生">
          <el-select v-model="searchForm.doctorId" filterable placeholder="请选择医生" clearable>
            <el-option
              v-for="doctor in doctorList"
              :key="doctor.id"
              :label="`${doctor.realName} (ID: ${doctor.id})`"
              :value="doctor.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="患者ID">
          <el-input
            v-model="searchForm.patientId"
            placeholder="请输入患者ID"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <div class="table-header">
        <h3>评价列表</h3>
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
          prop="doctorName"
          label="医生姓名"
          align="center"
          width="120"
        />
        <el-table-column
          prop="patientName"
          label="患者姓名"
          align="center"
          width="120"
        />
        <el-table-column
          prop="content"
          label="评价内容"
          align="center"
          min-width="180"
          show-overflow-tooltip
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
          width="260"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 详情按钮 -->
              <evaluation-info-button
                :emr-id="scope.row.emrId"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >详情</el-button>
              </evaluation-info-button>

              <!-- 编辑按钮 -->
              <evaluation-change-button
                :id="scope.row.id"
                create-or-update="update"
                @submit-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </evaluation-change-button>

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
import { pageQuery, deleteEvaluation } from '@/api/evaluation'
import {pageQuery as userPageQuery, queryAll, queryByUserId} from '@/api/user'
import EvaluationChangeButton from '@/components/services/button/change/evaluationChangeButton'
import EvaluationInfoButton from '@/components/services/button/info/evaluationInfoButton'
import patientInfo from "@/components/user/info/patientInfo.vue";

export default {
  name: 'EvaluationManagement',
  components: {
    EvaluationChangeButton,
    EvaluationInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        patientId: '',
        doctorId: ''
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
      // 用户数据缓存，避免重复请求
      userCache: {}
    }
  },
  created() {
    // 获取医生和患者列表
    this.fetchDoctorList()

    // 页面加载时获取数据
    this.searchForm.patientId = this.$route.query.patientId
    this.searchForm.doctorId = this.$route.query.doctorId
    this.fetchData()
  },
  methods: {
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

    // 获取评价数据
    fetchData() {
      this.tableLoading = true

      const params = {
        patientId: this.searchForm.patientId || undefined,
        doctorId: this.searchForm.doctorId || undefined
      }

      pageQuery(
        params,
        this.pagination.current - 1,
        this.pagination.size
      )
        .then(response => {
          if (response && response.data) {
            // 保存分页信息
            const records = response.data.records || []
            this.pagination.total = response.data.total || 0
            this.pagination.current = (response.data.current || 0) + 1
            this.pagination.size = response.data.size || 10

            // 创建一个包含所有异步请求的数组
            const promises = [];

            // 预填充初始数据
            records.forEach(item => {
              item.patientName = '加载中...'
              item.doctorName = '加载中...'
            })

            // 先展示预填充数据
            this.tableData = [...records]

            // 为每条记录创建Promise，查询医生和患者信息
            records.forEach(item => {
              if (item.patientId) {
                const patientPromise = queryByUserId(item.patientId, 'patient')
                  .then(response => {
                    if (response && response.data) {
                      item.patientName = response.data.realName || '未知患者'
                    } else {
                      item.patientName = '数据获取失败'
                    }
                  })
                  .catch(() => {
                    item.patientName = '数据获取失败'
                  })
                promises.push(patientPromise)
              } else {
                item.patientName = '无患者信息'
              }

              if (item.doctorId) {
                const doctorPromise = queryByUserId(item.doctorId, 'doctor')
                  .then(response => {
                    if (response && response.data) {
                      item.doctorName = response.data.realName || '未知医生'
                    } else {
                      item.doctorName = '数据获取失败'
                    }
                  })
                  .catch(() => {
                    item.doctorName = '数据获取失败'
                  })
                promises.push(doctorPromise)
              } else {
                item.doctorName = '无医生信息'
              }
            })

            // 等待所有查询完成后更新表格数据
            Promise.all(promises)
              .then(() => {
                this.tableData = [...records] // 使用新引用触发视图更新
              })
              .catch(error => {
                console.error('获取用户信息出错:', error)
              })
              .finally(() => {
                this.tableLoading = false
              })
          } else {
            this.$message.error('获取数据失败')
            this.tableLoading = false
          }
        })
        .catch(error => {
          console.error('获取评价数据出错:', error)
          this.$message.error('获取数据失败')
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
        patientId: '',
        doctorId: ''
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
      this.$message.success('评价信息更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的评价数据')
        return
      }

      this.$confirm('确定要删除该评价吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deleteEvaluation(row.id)
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
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

 .el-table th {
  background-color: #f5f7fa;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
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


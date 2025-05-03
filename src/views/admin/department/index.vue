<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="科室编码">
          <el-input v-model="searchForm.code" placeholder="请输入科室编码" clearable />
        </el-form-item>
        <el-form-item label="科室名称">
          <el-input v-model="searchForm.name" placeholder="请输入科室名称" clearable />
        </el-form-item>
        <el-form-item label="科室地址">
          <el-input v-model="searchForm.address" placeholder="请输入科室地址" clearable />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 数据表格 -->
      <div class="table-header">
        <h3>科室列表</h3>
        <div style="display: flex">
          <department-change-button
            create-or-update="create"
            @submit-success="handleUpdateSuccess">
            <el-button type="success" icon="el-icon-plus" size="small">新增科室</el-button>
          </department-change-button>
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
          prop="code"
          label="科室编码"
          align="center"
          width="150"
        />
        <el-table-column
          prop="name"
          label="科室名称"
          align="center"
          width="180"
        />
        <el-table-column
          prop="address"
          label="科室地址"
          align="center"
          min-width="180"
        />
        <el-table-column
          label="操作"
          align="center"
          width="340"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 查看医生按钮 -->
              <el-button
                size="mini"
                type="success"
                icon="el-icon-user"
                @click="viewDoctors(scope.row)"
              >查看医生</el-button>

              <!-- 详情按钮 -->
              <department-info-button
                :department-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >详情</el-button>
              </department-info-button>

              <!-- 编辑按钮 -->
              <department-change-button
                :department-id="scope.row.id"
                create-or-update="update"
                @submit-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </department-change-button>

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
import { pageQuery, deleteDepartment } from '@/api/department'
import DepartmentChangeButton from '@/components/services/button/change/departmentChangeButton'
import DepartmentInfoButton from '@/components/services/button/info/departmentInfoButton'

export default {
  name: 'DepartmentManagement',
  components: {
    DepartmentChangeButton,
    DepartmentInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        code: '',
        name: '',
        address: ''
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
    // 页面加载时获取数据
    this.searchForm.code = this.$route.query.code
    this.searchForm.name = this.$route.query.name
    this.searchForm.address = this.$route.query.address
    this.fetchData()
  },
  methods: {
    // 获取科室数据
    fetchData() {
      this.tableLoading = true

      const params = {
        code: this.searchForm.code || undefined,
        name: this.searchForm.name || undefined,
        address: this.searchForm.address || undefined
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
          console.error('获取科室数据出错:', error)
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.tableLoading = false
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
        code: '',
        name: '',
        address: ''
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
      this.$message.success('科室信息更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的科室数据')
        return
      }

      this.$confirm('确定要删除该科室吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deleteDepartment(row.id)
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

    // 查看部门下的医生
    viewDoctors(row) {
      if (!row || !row.id) {
        this.$message.error('无效的科室数据')
        return
      }

      this.$router.push({
        path: '/user/doctor',
        query: {
          departmentId: row.id,
        }
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
</style>


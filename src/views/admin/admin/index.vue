<template>
  <div class="app-container">



    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 数据表格 -->
      <div class="table-header">
        <h3>管理员列表</h3>
        <div style="display: flex">
          <admin-change-button
            create-or-update="create"
            user-type="admin"
            @update-success="handleUpdateSuccess">
            <el-button type="success" icon="el-icon-plus" size="small">新增管理员</el-button>
          </admin-change-button>
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
          prop="username"
          label="用户名"
          align="center"
          width="180"
        />
        <el-table-column
          prop="realName"
          label="真实姓名"
          align="center"
          width="180"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          align="center"
          width="180"
        />
        <el-table-column
          label="操作"
          align="center"
          width="340"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 详情按钮 -->
              <admin-info-button
                :id="scope.row.id"
                user-type="admin"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >详情</el-button>
              </admin-info-button>

              <!-- 查看公告按钮 -->
              <el-button
                size="mini"
                type="success"
                icon="el-icon-document"
                @click="viewNotices(scope.row)"
              >查看公告</el-button>

              <!-- 编辑按钮 -->
              <admin-change-button
                :id="scope.row.id"
                user-type="admin"
                create-or-update="update"
                @update-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </admin-change-button>

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
import { pageQuery, deletion } from '@/api/user'
import AdminChangeButton from '@/components/user/button/admineChangeButton'
import AdminInfoButton from '@/components/user/button/adminInfoButton'

export default {
  name: 'AdminManagement',
  components: {
    AdminChangeButton,
    AdminInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        realName: '',
        phone: ''
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
    this.searchForm.username =this.$route.query.username
    this.searchForm.realName = this.$route.query.realName
    this.searchForm.phone = this.$route.query.phone
    this.fetchData()
  },
  methods: {
    // 获取管理员数据
    fetchData() {
      this.tableLoading = true

      const params = {
        username: this.searchForm.username || undefined,
        realName: this.searchForm.realName || undefined,
        phone: this.searchForm.phone || undefined
      }

      pageQuery(
        params,
        this.pagination.current,
        this.pagination.size,
        'admin'
      )
        .then(response => {
            this.tableData = response.data.records
            this.pagination.total = response.data.total
            this.pagination.current = response.data.current
            this.pagination.size = response.data.size
        })
        .catch(error => {
          console.error('获取管理员数据出错:', error)
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
        username: '',
        realName: '',
        phone: ''
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
      this.$message.success('管理员信息更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.username) {
        this.$message.error('无效的用户数据')
        return
      }

      this.$confirm('确定要删除该管理员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deletion(row.username, 'admin')
          .then(response => {
            if (response && response.code === '0') {
              this.$message.success('删除成功')
              this.fetchData() // 刷新数据
            } else {
              throw new Error(response?.message || '删除失败')
            }
          })
          .finally(() => {
            this.tableLoading = false
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 查看管理员发布的公告
    viewNotices(row) {
      if (!row || !row.id) {
        this.$message.error('无效的管理员信息')
        return
      }

      // 跳转到公告管理页面，并传递管理员ID
      this.$router.push({
        path: '/notice',
        query: {
          adminId: row.id
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
  gap: 6px;
}

/* 确保按钮等宽 */
.action-buttons .el-button {
  min-width: 68px;
  margin-left: 0;
  margin-right: 0;
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


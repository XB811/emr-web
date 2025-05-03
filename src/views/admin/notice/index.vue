<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="请输入公告标题" clearable />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="searchForm.content" placeholder="请输入公告内容" clearable />
        </el-form-item>
        <el-form-item label="管理员">
          <el-select v-model="searchForm.adminId" filterable placeholder="请选择管理员" clearable>
            <el-option
              v-for="admin in adminList"
              :key="admin.id"
              :label="admin.realName"
              :value="admin.id">
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
        <h3>公告列表</h3>
        <div style="display: flex">
          <notice-change-button
            create-or-update="create"
            :admin-id="currentAdminId"
            :admin-name="currentAdminName"
            @submit-success="handleUpdateSuccess">
            <el-button type="success" icon="el-icon-plus" size="small">新增公告</el-button>
          </notice-change-button>
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
          prop="title"
          label="公告标题"
          align="center"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="adminName"
          label="发布管理员"
          align="center"
          width="120"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          align="center"
          width="180"
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
              <notice-info-button
                :notice-id="scope.row.id"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                >详情</el-button>
              </notice-info-button>

              <!-- 编辑按钮 -->
              <notice-change-button
                :notice-id="scope.row.id"
                create-or-update="update"
                @submit-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </notice-change-button>

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
import { pageQuery, deleteNotice } from '@/api/notice'
import { pageQuery as userPageQuery } from '@/api/user'
import NoticeChangeButton from '@/components/services/button/change/noticeChangeButton'
import NoticeInfoButton from '@/components/services/button/info/noticeInfoButton'

export default {
  name: 'NoticeManagement',
  components: {
    NoticeChangeButton,
    NoticeInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        title: '',
        content: '',
        adminId: ''
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
      // 管理员列表
      adminList: [],
      // 当前登录的管理员ID
      currentAdminId: '',
      // 当前登录的管理员名称
      currentAdminName: ''
    }
  },
  created() {
    // 获取当前登录的管理员信息
    this.getCurrentAdmin()
    // 获取所有管理员列表
    this.fetchAdminList()
    // 页面加载时获取数据
    this.searchForm.title = this.$route.query.title
    this.searchForm.content = this.$route.query.content
    this.searchForm.adminId = this.$route.query.adminId
    this.fetchData()
  },
  methods: {
    // 获取当前登录管理员信息
    getCurrentAdmin() {
      this.currentAdminId =  this.$store.getters.userId
      this.currentAdminName =  this.$store.getters.realName
    },

    // 获取管理员列表
    fetchAdminList() {
      userPageQuery(
        {},
        1,
        1000,
        'admin'
      ).then(response => {
        if (response && response.data && response.data.records) {
          this.adminList = response.data.records
        }
      }).catch(error => {
        console.error('获取管理员列表失败:', error)
      })
    },

    // 获取公告数据
    fetchData() {
      this.tableLoading = true

      const params = {
        title: this.searchForm.title || undefined,
        content: this.searchForm.content || undefined,
        adminId: this.searchForm.adminId || undefined
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
          console.error('获取公告数据出错:', error)
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
        title: '',
        content: '',
        adminId: ''
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
      this.$message.success('公告信息更新成功')
      this.fetchData() // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.error('无效的公告数据')
        return
      }

      this.$confirm('确定要删除该公告吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deleteNotice(row.id)
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
</style>

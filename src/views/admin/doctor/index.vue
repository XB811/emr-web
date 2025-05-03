<template>
  <div class="app-container">
    <el-card class="table-container" shadow="never">
      <!-- 搜索栏 -->
      <div class="filter-container">
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
          <el-form-item label="所属科室">
            <el-select v-model="searchForm.departmentId" placeholder="请选择科室" clearable>
              <el-option
                v-for="item in departmentOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-header">
        <div class="title-wrap">
          <div class="title-bar"></div>
          <h3 class="title-text">医生列表</h3>
        </div>
        <div class="header-btns">
          <doctor-change-button
            create-or-update="create"
            user-type="doctor"
            @update-success="handleUpdateSuccess">
            <el-button type="success" icon="el-icon-plus" size="small">新增医生</el-button>
          </doctor-change-button>
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
        class="custom-table"
      >
        <el-table-column
          prop="username"
          label="用户名"
          align="center"
          width="150"
        />
        <el-table-column
          prop="realName"
          label="真实姓名"
          align="center"
          width="120"
        />
        <el-table-column
          prop="phone"
          label="联系电话"
          align="center"
          width="150"
        />
        <el-table-column
          prop="gender"
          label="性别"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            {{ scope.row.gender ? '女' : '男' }}
          </template>
        </el-table-column>
        <el-table-column
          label="所属科室"
          align="center"
          width="150"
        >
          <template slot-scope="scope">
            {{ getDepartmentName(scope.row.departmentId) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="240"
        >
          <template slot-scope="scope">
            <div class="action-buttons">
              <!-- 详情按钮 -->
              <doctor-info-button
                :id="scope.row.id"
                user-type="doctor"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                  plain
                >详情</el-button>
              </doctor-info-button>

              <!-- 编辑按钮 -->
              <doctor-change-button
                :id="scope.row.id"
                user-type="doctor"
                create-or-update="update"
                @update-success="handleUpdateSuccess"
              >
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
              </doctor-change-button>

              <!-- 删除按钮 -->
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                plain
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page.sync="pagination.current"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pagination.size"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { pageQuery, deletion } from '@/api/user'
import { queryAllDepartments } from '@/api/department'
import DoctorChangeButton from '@/components/user/button/doctorChangeButton'
import DoctorInfoButton from '@/components/user/button/doctorInfoButton'

export default {
  name: 'DoctorManagement',
  components: {
    DoctorChangeButton,
    DoctorInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        realName: '',
        phone: '',
        departmentId: ''
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
      // 科室选项
      departmentOptions: [],
      // 科室id到名称的映射
      departmentMap: {}
    }
  },
  created() {
    // 先获取所有科室
    this.fetchDepartments()
    // 页面加载时获取数据
    this.fetchData()
  },
  methods: {
    // 获取所有科室信息
    fetchDepartments() {
      queryAllDepartments()
        .then(response => {
          if (response && response.data) {
            this.departmentOptions = response.data
            // 创建科室id到名称的映射
            this.departmentMap = {}
            response.data.forEach(dept => {
              this.departmentMap[dept.id] = dept.name
            })
          }
        })
        .catch(error => {
          console.error('获取科室数据失败:', error)
          this.$message.error('获取科室数据失败')
        })
    },

    // 根据科室id获取科室名称
    getDepartmentName(departmentId) {
      return this.departmentMap[departmentId] || '未知科室'
    },

    // 获取医生数据
    fetchData() {
      this.tableLoading = true

      // 每次刷新数据时，同时获取最新的部门信息
      this.fetchDepartments()

      const params = {
        username: this.searchForm.username || undefined,
        realName: this.searchForm.realName || undefined,
        phone: this.searchForm.phone || undefined,
        departmentId: this.searchForm.departmentId || undefined
      }

      pageQuery(
        params,
        this.pagination.current,
        this.pagination.size,
        'doctor'
      )
        .then(response => {
          if (response && response.data) {
            this.tableData = response.data.records
            this.pagination.total = response.data.total
            this.pagination.current = response.data.current
            this.pagination.size = response.data.size
          }
        })
        .catch(error => {
          console.error('获取医生数据出错:', error)
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
        phone: '',
        departmentId: ''
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
    handleUpdateSuccess(operation) {
      const message = operation === 'create' ? '医生创建成功' : '医生信息更新成功';
      this.$message.success(message);
      this.fetchData(); // 刷新数��
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.username) {
        this.$message.error('无效的用户数据')
        return
      }

      this.$confirm('确定要删除该医生吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deletion(row.username, 'doctor')
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

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.table-container {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
}

.filter-container {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .el-form-item {
    margin-bottom: 10px;
    margin-right: 15px;
  }
}

.search-buttons {
  margin-left: auto;

  .el-button {
    padding: 9px 15px;

    & + .el-button {
      margin-left: 10px;
    }
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.title-wrap {
  display: flex;
  align-items: center;
}

.title-bar {
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
  margin-right: 8px;
}

.title-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-table {
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;

  ::v-deep {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      padding: 12px 0;
    }

    .el-table__row {
      td {
        padding: 10px 0;
      }

      &:hover > td {
        background-color: #f0f9eb;
      }
    }

    .el-table__row--striped td {
      background-color: #fafafa;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  .el-button {
    min-width: 76px;
    margin: 0 4px;

    [class^="el-icon-"] {
      margin-right: 3px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  margin-top: 5px;
  border-top: 1px solid #ebeef5;
}

@media screen and (max-width: 768px) {
  .search-buttons {
    margin-left: 0;
    width: 100%;
    display: flex;

    .el-button {
      flex: 1;
    }
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-btns {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 5px;

    .el-button {
      width: 100%;
      margin: 0;
    }
  }
}
</style>

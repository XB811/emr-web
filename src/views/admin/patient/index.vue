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
          <el-form-item label="身份证号">
            <el-input v-model="searchForm.idCard" placeholder="请输入身份证号" clearable />
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
          <h3 class="title-text">患者列表</h3>
        </div>
        <div class="header-btns">
<!--          <patient-change-button-->
<!--            create-or-update="create"-->
<!--            user-type="patient"-->
<!--            @update-success="handleUpdateSuccess">-->
<!--            <el-button type="success" icon="el-icon-plus" size="small">新增患者</el-button>-->
<!--          </patient-change-button>-->
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
          prop="idCard"
          label="身份证号"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            {{ formatIdCard(scope.row.idCard) }}
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
              <patient-info-button
                :id="scope.row.id"
                user-type="patient"
              >
                <el-button
                  size="mini"
                  type="info"
                  icon="el-icon-view"
                  plain
                >详情</el-button>
              </patient-info-button>

              <!-- 编辑按钮 -->
<!--              <patient-change-button-->
<!--                :id="scope.row.id"-->
<!--                user-type="patient"-->
<!--                create-or-update="update"-->
<!--                @update-success="handleUpdateSuccess"-->
<!--              >-->
<!--                <el-button-->
<!--                  size="mini"-->
<!--                  type="primary"-->
<!--                  icon="el-icon-edit"-->
<!--                >编辑</el-button>-->
<!--              </patient-change-button>-->

<!--              &lt;!&ndash; 删除按钮 &ndash;&gt;-->
<!--              <el-button-->
<!--                size="mini"-->
<!--                type="danger"-->
<!--                icon="el-icon-delete"-->
<!--                plain-->
<!--                @click="handleDelete(scope.row)"-->
<!--              >删除</el-button>-->
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
import PatientChangeButton from '@/components/user/button/patientChangeButton'
import PatientInfoButton from '@/components/user/button/patientInfoButton'

export default {
  name: 'PatientManagement',
  components: {
    PatientChangeButton,
    PatientInfoButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        realName: '',
        phone: '',
        idCard: ''
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
    this.fetchData()
  },
  methods: {
    // 获取患者数据
    fetchData() {
      this.tableLoading = true

      const params = {
        username: this.searchForm.username || undefined,
        realName: this.searchForm.realName || undefined,
        phone: this.searchForm.phone || undefined,
        idCard: this.searchForm.idCard || undefined
      }

      pageQuery(
        params,
        this.pagination.current,
        this.pagination.size,
        'patient'
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
          console.error('获取患者数据出错:', error)
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.tableLoading = false
        })
    },

    // 格式化身份证号，保护隐私
    formatIdCard(idCard) {
      if (!idCard) return '未提供';
      if (idCard.length < 15) return idCard;
      return idCard.substring(0, 6) + '********' + idCard.substring(idCard.length - 4);
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
        idCard: ''
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
      const message = operation === 'create' ? '患者创建成功' : '患者信息更新成功';
      this.$message.success(message);
      this.fetchData(); // 刷新数据
    },

    // 处理删除操作
    handleDelete(row) {
      if (!row || !row.username) {
        this.$message.error('无效的用户数据')
        return
      }

      this.$confirm('确定要删除该患者吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableLoading = true
        deletion(row.username, 'patient')
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

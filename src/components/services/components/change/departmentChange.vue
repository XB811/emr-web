<template>
  <div class="department-change-container">
    <el-form ref="departmentForm" :model="departmentForm" :rules="departmentRules" label-width="100px" size="small" v-loading="loading">
      <el-form-item v-if="createOrUpdate === 'update'" label="科室ID" prop="id">
        <el-input v-model="departmentForm.id" disabled></el-input>
      </el-form-item>

      <el-form-item label="科室编码" prop="code" required>
        <el-input v-model="departmentForm.code" placeholder="请输入科室编码"></el-input>
      </el-form-item>

      <el-form-item label="科室名称" prop="name" required>
        <el-input v-model="departmentForm.name" placeholder="请输入科室名称"></el-input>
      </el-form-item>

      <el-form-item label="科室位置" prop="address" required>
        <el-input v-model="departmentForm.address" placeholder="请输入科室位置"></el-input>
      </el-form-item>

      <el-form-item label="科室描述" prop="detail" required>
        <el-input
          type="textarea"
          v-model="departmentForm.detail"
          placeholder="请输入科室详细描述"
          :rows="4">
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  createDepartment,
  updateDepartment,
  queryDepartmentById
} from "@/api/department"

export default {
  name: "departmentChange",
  props:{
    id: {
      type: [String, Number],
      default: null
    },
    createOrUpdate: {
      type: String,
      required: true,
      validator: (value) => {
        return ['create', 'update'].indexOf(value) !== -1
      }
    }
  },
  data() {
    return {
      departmentForm: {
        id: this.id,
        code: '',
        name: '',
        detail: '',
        address: ''
      },
      loading: false,
      departmentRules: {
        code: [
          { required: true, message: '科室编码不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '科室名称不能为空', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '科室位置不能为空', trigger: 'blur' }
        ],
        detail: [
          { required: true, message: '科室描述不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 更新模式下根据 id 获取数据
    if (this.createOrUpdate === 'update' && this.id) {
      // this.fetchDepartmentInfo()
    }
  },
  // mounted() {
  //   if (this.createOrUpdate === 'update' && this.id) {
  //     console.log('组件已挂载，准备获取科室数据')
  //     this.$nextTick(() => {
  //       this.fetchDepartmentInfo()
  //     })
  //   }
  // },
  methods: {
    fetchDepartmentInfo() {
      if (!this.id) {
        console.warn('未提供科室ID，无法获取数据')
        return
      }
      this.loading = true
      console.log('正在获取科室信息，ID:', this.id)

      queryDepartmentById(this.id)
        .then(response => {
          console.log('获取到的科室信息:', response)
          if (response && response.data) {
            const data = response.data
            this.departmentForm = {
              id: data.id,
              code: data.code,
              name: data.name,
              detail: data.detail,
              address: data.address
            }
            console.log('表单数据已更新:', this.departmentForm)
          } else {
            console.error('API返回数据格式不正确', response)
            this.$message.warning('获取科室信息数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取科室信息失败:', error)
          this.$message.error('获取科室信息失败: ' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.departmentForm) {
        this.$refs.departmentForm.clearValidate()
      }
    },

    submitForm() {
      this.$refs.departmentForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 根据创建/更新模式选择不同的API
          const apiRequest = this.createOrUpdate === 'create'
            ? createDepartment(this.departmentForm)
            : updateDepartment(this.departmentForm)

          apiRequest
            .then(response => {
              if (response && response.code === '0') {
                this.$message({
                  type: 'success',
                  message: this.createOrUpdate === 'create' ? '创建科室成功' : '更新科室成功'
                })
                this.$emit('submit-success', this.departmentForm)
              } else {
                throw new Error(response.message || '操作失败')
              }
            })
            .catch(error => {
              console.error(this.createOrUpdate === 'create' ? '创建失败:' : '更新失败:', error)
              this.$message.error(error.message || (this.createOrUpdate === 'create' ? '创建失败' : '更新失败'))
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.log('表单验证未通过')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.department-change-container {
  padding: 0 10px;
}

/* 让输入框占满整行 */
:deep(.el-input) {
  width: 100%;
}

/* 调整文本区域的高度 */
:deep(.el-textarea__inner) {
  min-height: 100px;
}

/* 必填项星号颜色 */
:deep(.el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label:before) {
  color: #f56c6c;
}
</style>

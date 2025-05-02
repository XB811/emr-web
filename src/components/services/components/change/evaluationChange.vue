<template>
  <div class="evaluation-change-container">
    <el-form ref="evaluationForm" :model="evaluationForm" :rules="evaluationRules" label-width="100px" size="small" v-loading="loading">
      <el-form-item v-if="createOrUpdate === 'update'" label="评价ID" prop="id">
        <el-input v-model="evaluationForm.id" disabled></el-input>
      </el-form-item>

      <!-- 只在更新操作时显示病历ID、患者ID和医生ID，且不可编辑 -->
      <el-form-item v-if="createOrUpdate === 'update'" label="病历ID" prop="emrId">
        <el-input v-model="evaluationForm.emrId" disabled></el-input>
      </el-form-item>

      <el-form-item v-if="createOrUpdate === 'update'" label="患者姓名" prop="patientName">
        <el-input v-model="patientName" disabled></el-input>
      </el-form-item>

      <el-form-item v-if="createOrUpdate === 'update'" label="医生姓名" prop="doctorName">
        <el-input v-model="doctorName" disabled></el-input>
      </el-form-item>

      <!-- 创建操作时显示病历ID、患者ID和医生ID，可编辑 -->
      <el-form-item v-if="createOrUpdate === 'create'" label="病历ID" prop="emrId" required>
        <el-input v-model="evaluationForm.emrId" placeholder="请输入病历ID"></el-input>
      </el-form-item>

      <el-form-item v-if="createOrUpdate === 'create'" label="患者ID" prop="patientId" required>
        <el-input v-model="evaluationForm.patientId" placeholder="请输入患者ID"></el-input>
      </el-form-item>

      <el-form-item v-if="createOrUpdate === 'create'" label="医生ID" prop="doctorId" required>
        <el-input v-model="evaluationForm.doctorId" placeholder="请输入医生ID"></el-input>
      </el-form-item>

      <el-form-item label="评价内容" prop="content" required>
        <div class="content-editor">
          <div class="section-title">
            <i class="el-icon-edit-outline"></i>
            <span>编写评价内容</span>
          </div>
          <el-input
            type="textarea"
            v-model="evaluationForm.content"
            placeholder="请输入评价内容"
            :rows="6"
            resize="none">
          </el-input>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  ceateEvaluation as createEvaluation,
  updateEvaluation,
  queryEvaluationById,
  queryEvaluationByEmrId
} from "@/api/evaluation"
import { queryByUserId } from "@/api/user"

export default {
  name: "evaluationChange",
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    emrId: {
      type: [String, Number],
      default: null
    },
    doctorId: {
      type: [String, Number],
      default: null
    },
    patientId: {
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
      evaluationForm: {
        id: this.id,
        emrId: this.emrId,
        doctorId: this.doctorId,
        patientId: this.patientId,
        content: ''
      },
      patientName: '',
      doctorName: '',
      loading: false,
      evaluationRules: {
        emrId: [
          { required: true, message: '病历ID不能为空', trigger: 'blur' }
        ],
        patientId: [
          { required: true, message: '患者ID不能为空', trigger: 'blur' }
        ],
        doctorId: [
          { required: true, message: '医生ID不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '评价内容不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 更新模式下根据 id 获取数据
    if (this.createOrUpdate === 'update' && this.id) {
      // 在组件创建时不立即获取数据，等待父组件调用
    }
    // 创建模式下，初始化表单
    else if (this.createOrUpdate === 'create') {
      this.evaluationForm.emrId = this.emrId
      this.evaluationForm.doctorId = this.doctorId
      this.evaluationForm.patientId = this.patientId
    }
  },
  methods: {
    fetchEvaluationInfo() {
      if (!this.id) {
        console.warn('未提供评价ID，无法获取数据')
        return
      }
      this.loading = true
      console.log('正在获取评价信息，ID:', this.id)

      queryEvaluationById(this.id)
        .then(response => {
          console.log('获取到的评价信息:', response)
          if (response && response.data) {
            const data = response.data
            this.evaluationForm = {
              id: data.id,
              emrId: data.emrId,
              doctorId: data.doctorId,
              patientId: data.patientId,
              content: data.content
            }
            console.log('表单数据已更新:', this.evaluationForm)

            // 获取患者和医生姓名
            this.fetchUserNames()
          } else {
            console.error('API返回数据格式不正确', response)
            this.$message.warning('获取评价信息数据格式不正确')
            this.$emit('fetch-failed', '获取评价信息数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取评价信息失败:', error)
          this.$message.error('获取评价信息失败: ' + (error.message || '未知错误'))
          this.$emit('fetch-failed', error.message || '获取评价信息失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取患者和医生姓名
    fetchUserNames() {
      // 获取患者姓名
      if (this.evaluationForm.patientId) {
        queryByUserId(this.evaluationForm.patientId, 'patient')
          .then(response => {
            if (response && response.data) {
              this.patientName = response.data.realName || '未知患者'
            }
          })
          .catch(error => {
            console.error('获取患者信息失败:', error)
            this.patientName = '获取失败'
          })
      }

      // 获取医生姓名
      if (this.evaluationForm.doctorId) {
        queryByUserId(this.evaluationForm.doctorId, 'doctor')
          .then(response => {
            if (response && response.data) {
              this.doctorName = response.data.realName || '未知医生'
            }
          })
          .catch(error => {
            console.error('获取医生信息失败:', error)
            this.doctorName = '获取失败'
          })
      }
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.evaluationForm) {
        this.$refs.evaluationForm.clearValidate()
      }
    },

    submitForm() {
      this.$refs.evaluationForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 根据创建/更新模式选择不同的API
          const apiRequest = this.createOrUpdate === 'create'
            ? createEvaluation(this.evaluationForm)
            : updateEvaluation(this.evaluationForm)

          apiRequest
            .then(response => {
              if (response && response.code === '0') {
                this.$message({
                  type: 'success',
                  message: this.createOrUpdate === 'create' ? '创建评价成功' : '更新评价成功'
                })
                this.$emit('submit-success', this.evaluationForm)
              } else {
                throw new Error(response.message || '操作失败')
              }
            })
            .catch(error => {
              console.error(this.createOrUpdate === 'create' ? '创建评价失败:' : '更新评价失败:', error)
              this.$message.error(error.message || (this.createOrUpdate === 'create' ? '创建评价失败' : '更新评价失败'))
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
  },
  watch: {
    // 确保 props 的变化能够反映到表单中
    emrId: {
      handler(newVal) {
        this.evaluationForm.emrId = newVal
      },
      immediate: true
    },
    doctorId: {
      handler(newVal) {
        this.evaluationForm.doctorId = newVal
      },
      immediate: true
    },
    patientId: {
      handler(newVal) {
        this.evaluationForm.patientId = newVal
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.evaluation-change-container {
  padding: 0 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #409EFF;
  margin-bottom: 10px;
}

.section-title i {
  color: #409EFF;
}

.content-editor {
  width: 100%;
}

/* 文本域样式 */
:deep(.el-textarea__inner) {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  padding: 12px;
  border-color: #DCDFE6;
  transition: border-color 0.3s;
}

:deep(.el-textarea__inner:focus) {
  border-color: #409EFF;
}

/* 必填项星号颜色 */
:deep(.el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label:before) {
  color: #f56c6c;
}
</style>

<template>
  <div class="emr-change-container">
    <el-form ref="emrForm" :model="emrForm" :rules="emrRules" label-width="100px" size="small" v-loading="loading">
      <el-form-item v-if="createOrUpdate === 'update'" label="病历ID" prop="id">
        <el-input v-model="emrForm.id" disabled></el-input>
      </el-form-item>

      <el-form-item label="患者姓名" prop="patientId">
        <el-input v-model="patientName" disabled></el-input>
      </el-form-item>

      <el-form-item label="科室名称" prop="departmentId">
        <el-input v-model="departmentName" disabled></el-input>
      </el-form-item>

      <el-form-item label="医生姓名" prop="doctorId">
        <el-input v-model="doctorName" disabled></el-input>
      </el-form-item>

      <el-form-item label="主诉" prop="content" required>
        <el-input
          type="textarea"
          v-model="emrForm.content"
          placeholder="请输入患者主诉"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="现病史" prop="presentHistory" required>
        <el-input
          type="textarea"
          v-model="emrForm.presentHistory"
          placeholder="请输入现病史"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="既往史" prop="pastHistory" required>
        <el-input
          type="textarea"
          v-model="emrForm.pastHistory"
          placeholder="请输入既往史"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="过敏史" prop="allergyHistory" required>
        <el-input
          type="textarea"
          v-model="emrForm.allergyHistory"
          placeholder="请输入过敏史"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="诊断" prop="diagnosis" required>
        <el-input
          type="textarea"
          v-model="emrForm.diagnosis"
          placeholder="请输入诊断结果"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="治疗方案" prop="treatmentPlan" required>
        <el-input
          type="textarea"
          v-model="emrForm.treatmentPlan"
          placeholder="请输入治疗方案"
          :rows="3">
        </el-input>
      </el-form-item>

      <el-form-item label="医嘱" prop="doctorAdvice" required>
        <el-input
          type="textarea"
          v-model="emrForm.doctorAdvice"
          placeholder="请输入医嘱"
          :rows="3">
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  createEmr,
  updateEmr,
  queryById
} from "@/api/emr"
import { queryByUserId } from "@/api/user"
import { queryDepartmentById } from "@/api/department"

export default {
  name: "emrChange",
  props:{
    id: {
      type: [String, Number],
      default: null
    },
    patientId: {
      type: [String, Number],
      default: null
    },
    departmentId: {
      type: [String, Number],
      default: null
    },
    doctorId: {
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
      emrForm: {
        id: this.id,
        patientId: this.patientId,
        departmentId: this.departmentId,
        doctorId: this.doctorId,
        content: '',
        presentHistory: '',
        pastHistory: '',
        allergyHistory: '',
        diagnosis: '',
        treatmentPlan: '',
        doctorAdvice: ''
      },
      loading: false,
      patientName: '加载中...',
      departmentName: '加载中...',
      doctorName: '加载中...',
      emrRules: {
        content: [
          { required: true, message: '主诉不能为空', trigger: 'blur' }
        ],
        presentHistory: [
          { required: true, message: '现病史不能为空', trigger: 'blur' }
        ],
        pastHistory: [
          { required: true, message: '既往史不能为空', trigger: 'blur' }
        ],
        allergyHistory: [
          { required: true, message: '过敏史不能为空', trigger: 'blur' }
        ],
        diagnosis: [
          { required: true, message: '诊断不能为空', trigger: 'blur' }
        ],
        treatmentPlan: [
          { required: true, message: '治疗方案不能为空', trigger: 'blur' }
        ],
        doctorAdvice: [
          { required: true, message: '医嘱不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 更新模式下根据 id 获取数据
    if (this.createOrUpdate === 'update' && this.id) {
      // this.fetchEmrInfo()
    } else if (this.createOrUpdate === 'create') {
      // 创建模式下，获取患者、医生、科室信息
      this.fetchPatientInfo()
      this.fetchDoctorInfo()
      this.fetchDepartmentInfo()
    }
  },
  // mounted() {
  //   if (this.createOrUpdate === 'update' && this.id) {
  //     console.log('组件已挂载，准备获取病历数据')
  //     this.$nextTick(() => {
  //       this.fetchEmrInfo()
  //     })
  //   }
  // },
  methods: {
    // 获取患者信息
    fetchPatientInfo() {
      if (!this.patientId) {
        console.warn('未提供患者ID，无法获取数据')
        this.patientName = '未提供患者ID'
        return
      }

      queryByUserId(this.patientId, 'patient')
        .then(response => {
          if (response && response.data) {
            this.patientName = response.data.realName || '未知患者'
          } else {
            this.patientName = '数据获取失败'
          }
        })
        .catch(error => {
          console.error('获取患者信息失败:', error)
          this.patientName = '获取失败'
          this.$emit('fetch-failed', '患者id错误')
        })
    },

    // 获取医生信息
    fetchDoctorInfo() {
      if (!this.doctorId) {
        console.warn('未提供医生ID，无法获取数据')
        this.doctorName = '未提供医生ID'
        return
      }

      queryByUserId(this.doctorId, 'doctor')
        .then(response => {
          if (response && response.data) {
            this.doctorName = response.data.realName || '未知医生'
          } else {
            this.doctorName = '数据获取失败'
          }
        })
        .catch(error => {
          console.error('获取医生信息失败:', error)
          this.doctorName = '获取失败'
          this.$emit('fetch-failed',  '医生id错误')
        })
    },

    // 获取科室信息
    fetchDepartmentInfo() {
      if (!this.departmentId) {
        console.warn('未提供科室ID，无法获取数据')
        this.departmentName = '未提供科室ID'
        return
      }

      queryDepartmentById(this.departmentId)
        .then(response => {
          if (response && response.data) {
            this.departmentName = response.data.name || '未知科室'
          } else {
            this.departmentName = '数据获取失败'
            console.error('获取科室信息失败: 返回数据格式不正确', response)
            this.$emit('fetch-failed', '获取科室信息失败: 返回数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取科室信息失败:', error)
          this.departmentName = '获取失败'
          // 发出获取失败事件，通知父组件关闭弹窗
          this.$emit('fetch-failed',  '科室id错误')
        })
    },

    fetchEmrInfo() {
      if (!this.id) {
        console.warn('未提供病历ID，无法获取数据')
        return
      }
      this.loading = true
      console.log('正在获取病历信息，ID:', this.id)

      queryById(this.id)
        .then(response => {
          console.log('获取到的病历信息:', response)
          if (response && response.data) {
            const data = response.data
            this.emrForm = {
              id: data.id,
              patientId: data.patientId,
              departmentId: data.departmentId,
              doctorId: data.doctorId,
              content: data.content,
              presentHistory: data.presentHistory,
              pastHistory: data.pastHistory,
              allergyHistory: data.allergyHistory,
              diagnosis: data.diagnosis,
              treatmentPlan: data.treatmentPlan,
              doctorAdvice: data.doctorAdvice
            }

            // 存储患者姓名、科室名称和医生姓名
            this.patientName = data.realName || '未知患者'
            this.departmentName = data.departmentName || '未知科室'
            this.doctorName = data.doctorName || '未知医生'

            console.log('表单数据已更新:', this.emrForm)
          } else {
            console.error('API返回数据格式不正确', response)
            this.$message.warning('获取病历信息数据格式不正确')
            // 发出获取失败事件，通知父组件关闭弹窗
            this.$emit('fetch-failed', '获取病历信息数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取病历信息失败:', error)
          this.$message.error('获取病历信息失败: ' + (error.message || '未知错误'))
          // 发出获取失败事件，通知父组件关闭弹窗
          this.$emit('fetch-failed', error.message || '获取病历信息失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.emrForm) {
        this.$refs.emrForm.clearValidate()
      }
    },

    submitForm() {
      this.$refs.emrForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 根据创建/更新模式选择不同的API
          const apiRequest = this.createOrUpdate === 'create'
            ? createEmr(this.emrForm)
            : updateEmr(this.emrForm)

          apiRequest
            .then(response => {
              if (response && response.code === '0') {
                this.$message({
                  type: 'success',
                  message: this.createOrUpdate === 'create' ? '创建病历成功' : '更新病历成功'
                })
                this.$emit('submit-success', this.emrForm)
              } else {
                throw new Error(response.message || '操作失败')
              }
            })
            .catch(error => {
              console.error(this.createOrUpdate === 'create' ? '创建失败:' : '更新失败:', error)
              this.$message.error(error.message || (this.createOrUpdate === 'create' ? '创建病历失败' : '更新病历失败'))
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
.emr-change-container {
  padding: 0 10px;
  /* 移除最大高度和滚动属性，让父容器处理滚动 */
  /* max-height: 70vh; */
  /* overflow-y: auto; */
}

/* 让输入框占满整行 */
:deep(.el-input) {
  width: 100%;
}

/* 调整文本区域的高度 */
:deep(.el-textarea__inner) {
  min-height: 60px;
}

/* 必填项星号颜色 */
:deep(.el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label:before) {
  color: #f56c6c;
}
</style>

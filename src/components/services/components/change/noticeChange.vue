<template>
  <div class="notice-change-container">
    <el-form ref="noticeForm" :model="noticeForm" :rules="noticeRules" label-width="100px" size="small" v-loading="loading">
      <el-form-item v-if="createOrUpdate === 'update'" label="公告ID" prop="id">
        <el-input v-model="noticeForm.id" disabled></el-input>
      </el-form-item>

      <!-- 在创建模式下显示管理员信息 -->
      <el-form-item v-if="createOrUpdate === 'create'" label="管理员" prop="adminName">
        <el-input v-model="noticeForm.adminName" disabled></el-input>
      </el-form-item>

      <el-form-item label="公告标题" prop="title" required>
        <el-input v-model="noticeForm.title" placeholder="请输入公告标题"></el-input>
      </el-form-item>

      <el-form-item label="公告内容" prop="content" required>
        <el-input
          type="textarea"
          v-model="noticeForm.content"
          placeholder="请输入公告内容"
          :rows="8">
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  createNotice,
  updateNotice,
  queryById
} from "@/api/notice"

export default {
  name: "noticeChange",
  props:{
    adminId:{
      type: [String, Number],
      required: function() { return this.createOrUpdate === 'create'; },
    },
    adminName:{
      type: String,
      required: function() { return this.createOrUpdate === 'create'; },
    },
    id: {
      type: [String, Number],
      default: null,
      required: function() { return this.createOrUpdate === 'update'; }
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
      noticeForm: {
        id: this.id,
        adminId: this.adminId,
        adminName: this.adminName,
        title: '',
        content: '',
        updateTime: null
      },
      loading: false,
      noticeRules: {
        title: [
          { required: true, message: '公告标题不能为空', trigger: 'blur' },
          { min: 2, max: 50, message: '标题长度应在2到50个字符之间', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '公告内容不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    if (this.createOrUpdate === 'create') {
      this.noticeForm.adminId = this.adminId
      this.noticeForm.adminName = this.adminName
    }
  },
  methods: {
    fetchNoticeInfo() {
      if (!this.id) {
        console.warn('未提供公告ID，无法获取数据')
        return
      }
      this.loading = true
      console.log('正在获取公告信息，ID:', this.id)

      queryById(this.id)
        .then(response => {
          console.log('获取到的公告信息:', response)
          if (response && response.data) {
            const data = response.data
            this.noticeForm = {
              id: data.id,
              adminId: data.adminId,
              adminName: data.adminName,
              title: data.title,
              content: data.content,
              updateTime: data.updateTime
            }
            console.log('表单数据已更新:', this.noticeForm)
          } else {
            console.error('API返回数据格式不正确', response)
            this.$message.warning('获取公告信息数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取公告信息失败:', error)
          this.$message.error('获取公告信息失败: ' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.noticeForm) {
        this.$refs.noticeForm.clearValidate()
      }
    },

    submitForm() {
      this.$refs.noticeForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 设置当前时间为更新时间
          this.noticeForm.updateTime = new Date().toISOString()

          // 根据创建/更新模式选择不同的API
          const apiRequest = this.createOrUpdate === 'create'
            ? createNotice(this.noticeForm)
            : updateNotice(this.noticeForm)

          apiRequest
            .then(response => {
              if (response && response.code === '0') {
                this.$message({
                  type: 'success',
                  message: this.createOrUpdate === 'create' ? '创建公告成功' : '更新公告成功'
                })
                this.$emit('submit-success', this.noticeForm)
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
  },
  watch: {
    // 确保 adminId 的变化能够反映到表单中
    adminId: {
      handler(newVal) {
        this.noticeForm.adminId = newVal
      },
      immediate: true
    },
    // 确保 adminName 的变化能够反映到表单中
    adminName: {
      handler(newVal) {
        this.noticeForm.adminName = newVal
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.notice-change-container {
  padding: 0 10px;
}
</style>

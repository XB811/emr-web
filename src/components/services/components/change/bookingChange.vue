<template>
  <div class="booking-change-container">
    <el-form ref="bookingForm" :model="bookingForm" :rules="bookingRules" label-width="100px" size="small" v-loading="loading">
      <el-form-item v-if="createOrUpdate === 'update'" label="预约ID" prop="id">
        <el-input v-model="bookingForm.id" disabled></el-input>
      </el-form-item>

      <!-- 只在更新操作时显示医生姓名 -->
      <el-form-item v-if="createOrUpdate === 'update'" label="医生姓名" prop="doctorName" required>
        <el-input v-model="bookingForm.doctorName" disabled></el-input>
      </el-form-item>

      <el-form-item label="可预约时间" prop="availableTime" required>
        <div class="schedule-selector">
          <div class="section-title">
            <i class="el-icon-time"></i>
            <span>选择可预约时间</span>
          </div>

          <el-table
            :data="scheduleData"
            border
            size="mini"
            style="width: 100%">
            <el-table-column
              prop="timeSlot"
              width="80"
              label="时间段">
            </el-table-column>
            <el-table-column label="周一" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][0]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周二" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][1]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周三" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][2]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周四" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][3]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周五" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][4]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周六" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][5]"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="周日" width="70">
              <template slot-scope="scope">
                <el-checkbox v-model="weekSchedule[scope.$index][6]"></el-checkbox>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>

      <el-form-item label="预约状态" prop="isAvailable">
        <div class="status-switch-container">
          <el-switch
            v-model="bookingForm.isAvailable"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
          <span class="status-text" :class="{ 'status-available': bookingForm.isAvailable, 'status-unavailable': !bookingForm.isAvailable }">
            {{ bookingForm.isAvailable ? '可预约' : '不可预约' }}
          </span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  createBooking,
  updateBooking,
  queryById
} from "@/api/booking"

export default {
  name: "bookingChange",
  props:{
    doctorId:{
      type: [String, Number],
      required: true,
    },
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
      bookingForm: {
        id: this.id,
        doctorId: this.doctorId, // 依然保留 doctorId 字段用于提交表单
        doctorName: '',
        availableTime: 0,
        isAvailable: true
      },
      loading: false,
      weekSchedule: [
        [false, false, false, false, false, false, false], // 上午
        [false, false, false, false, false, false, false]  // 下午
      ],
      scheduleData: [
        { timeSlot: '上午' },
        { timeSlot: '下午' }
      ],
      bookingRules: {
        doctorName: [
          { required: true, message: '医生姓名不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 更新模式下根据 id 获取数据
    if (this.createOrUpdate === 'update' && this.id) {
      this.fetchBookingInfo()
    }
    // 创建模式下，初始化 doctorId
    else if (this.createOrUpdate === 'create') {
      this.bookingForm.doctorId = this.doctorId
    }
  },
  mounted() {
    if (this.createOrUpdate === 'update' && this.id) {
      console.log('组件已挂载，准备获取预约数据')
      this.$nextTick(() => {
        this.fetchBookingInfo()
      })
    }
  },
  methods: {
    fetchBookingInfo() {
      if (!this.id) {
        console.warn('未提供预约ID，无法获取数据')
        return
      }
      this.loading = true
      console.log('正在获取预约信息，ID:', this.id)

      queryById(this.id)
        .then(response => {
          console.log('获取到的预约信息:', response)
          if (response && response.data) {
            const data = response.data
            this.bookingForm = {
              id: data.id,
              doctorId: data.doctorId,
              doctorName: data.doctorName,
              availableTime: data.availableTime,
              isAvailable: data.isAvailable === true || data.isAvailable === 'true' || data.isAvailable === 1
            }
            console.log('表单数据已更新:', this.bookingForm)

            // 将二进制时间值转换为复选框状态
            this.updateWeekScheduleFromAvailableTime(data.availableTime)
            console.log('复选框状态已更新:', JSON.stringify(this.weekSchedule))
          } else {
            console.error('API返回数据格式不正确', response)
            this.$message.warning('获取预约信息数据格式不正确')
          }
        })
        .catch(error => {
          console.error('获取预约信息失败:', error)
          this.$message.error('获取预约信息失败: ' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.bookingForm) {
        this.$refs.bookingForm.clearValidate()
      }
    },

    // 将二进制时间值转换为复选框状态
    updateWeekScheduleFromAvailableTime(time) {
      try {
        // 将时间值转换为14位二进制字符串
        const binaryString = this.formatAvailableTime(time)
        console.log('时间值转换为二进制:', binaryString)

        // 初始化复选框状态数组，确保有正确的初始值
        this.weekSchedule = [
          [false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false]
        ]

        // 更新复选框状态
        for (let day = 0; day < 7; day++) {
          // 上午状态 (索引 0, 2, 4, 6, 8, 10, 12)
          this.weekSchedule[0][day] = binaryString[day * 2] === '1'

          // 下午状态 (索引 1, 3, 5, 7, 9, 11, 13)
          this.weekSchedule[1][day] = binaryString[day * 2 + 1] === '1'
        }

        // 确保Vue能够检测到数组变化
        this.weekSchedule = [...this.weekSchedule]
      } catch (error) {
        console.error('更新复选框状态失败:', error)
        this.$message.error('更新复选框状态失败')
      }
    },

    // 将复选框状态转换为二进制时间值
    updateAvailableTimeFromWeekSchedule() {
      let binaryString = ''

      // 生成二进制字符串
      for (let day = 0; day < 7; day++) {
        // 上午状态
        binaryString += this.weekSchedule[0][day] ? '1' : '0'

        // 下午状态
        binaryString += this.weekSchedule[1][day] ? '1' : '0'
      }

      // 将二进制字符串转换为数值
      this.bookingForm.availableTime = parseInt(binaryString, 2)
    },

    // 将availableTime转换为14位二进制字符串
    formatAvailableTime(time) {
      if (time === undefined || time === null) {
        return '00000000000000'
      }

      try {
        // 将整数转换为二进制字符串
        const binaryString = Number(time).toString(2)

        // 补零至14位
        return binaryString.padStart(14, '0')
      } catch (error) {
        console.error('时间格式转换错误:', error, '原始值:', time)
        return '00000000000000'
      }
    },

    submitForm() {
      this.$refs.bookingForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 更新可预约时间
          this.updateAvailableTimeFromWeekSchedule()

          // 创建操作时，如果没有设置医生姓名，则不需要在请求中包含
          if (this.createOrUpdate === 'create' && !this.bookingForm.doctorName) {
            // 可以根据需要设置默认值或从其他地方获取
            this.bookingForm.doctorName = '默认医生'
          }

          // 根据创建/更新模式选择不同的API
          const apiRequest = this.createOrUpdate === 'create'
            ? createBooking(this.bookingForm)
            : updateBooking(this.bookingForm)

          apiRequest
            .then(response => {
              if (response && response.code === '0') {
                this.$message({
                  type: 'success',
                  message: this.createOrUpdate === 'create' ? '创建预约时间成功' : '更新预约时间成功'
                })
                this.$emit('submit-success', this.bookingForm)
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
    // 确保 doctorId 的变化能够反映到表单中
    doctorId: {
      handler(newVal) {
        this.bookingForm.doctorId = newVal
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.booking-change-container {
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

.schedule-selector {
  width: 100%;
}

/* 让表格内的文字和复选框居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}

/* 调整表头样式 */
:deep(.el-table th) {
  background-color: #409EFF;
  color: white;
  padding: 5px 0;
}

/* 调整表格行高 */
:deep(.el-table td) {
  padding: 8px 0;
}

/* 表格外边框圆角 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

/* 复选框样式 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409EFF;
  border-color: #409EFF;
}

.status-switch-container {
  display: flex;
  align-items: center;
}

.status-text {
  margin-left: 10px;
  font-weight: 500;
  font-size: 14px;
}

.status-available {
  color: #13ce66;
}

.status-unavailable {
  color: #ff4949;
}
</style>

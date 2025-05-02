<template>
  <div class="booking-info-container">
    <!-- 首次加载时显示骨架屏 -->
    <div v-if="loading && !bookingInfo" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 有数据时显示预约信息 -->
    <div
      v-else-if="bookingInfo"
      class="booking-info-content"
      v-loading="loading"
      element-loading-text="正在加载预约信息"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)">

      <el-card class="booking-info-card" shadow="hover">
        <div slot="header" class="card-header">
          <div class="booking-header">
            <el-avatar :size="50" icon="el-icon-date" class="booking-avatar"></el-avatar>
            <div class="booking-info-header">
              <div class="doctor-info">
                <span class="info-label"><i class="el-icon-s-custom"></i> 医生姓名：</span>
                <span class="info-content doctor-name">{{ bookingInfo.doctorName }}</span>
              </div>
              <div class="status-info">
                <span class="info-label"><i class="el-icon-s-flag"></i> 预约状态：</span>
                <el-tag size="small" :type="bookingInfo.isAvailable ? 'success' : 'danger'">
                  {{ bookingInfo.isAvailable ? '可预约' : '不可预约' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-section">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-time"></i>
              <span>可预约时间</span>
            </div>
          </div>
          <div class="schedule-table-container">
            <el-table
              :data="scheduleData"
              :cell-style="getCellStyle"
              border
              size="mini"
              style="width: 100%">
              <el-table-column
                prop="timeSlot"
                width="80"
                label="时间段">
              </el-table-column>
              <el-table-column prop="monday" label="周一" width="70" align="center"></el-table-column>
              <el-table-column prop="tuesday" label="周二" width="70" align="center"></el-table-column>
              <el-table-column prop="wednesday" label="周三" width="70" align="center"></el-table-column>
              <el-table-column prop="thursday" label="周四" width="70" align="center"></el-table-column>
              <el-table-column prop="friday" label="周五" width="70" align="center"></el-table-column>
              <el-table-column prop="saturday" label="周六" width="70" align="center"></el-table-column>
              <el-table-column prop="sunday" label="周日" width="70" align="center"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>
    <div v-else class="no-data">
      <el-empty description="没有找到预约信息">
        <el-button type="primary" @click="fetchBookingInfo">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { queryById } from "@/api/booking" // 需要在api目录下创建booking.js

export default {
  name: "bookingInfo",
  props:{
    id:{
      type: [String, Number],
      required: true,
    }
  },
  data(){
    return{
      bookingInfo: null,
      loading: false,
      scheduleData: [
        {
          timeSlot: '上午',
          monday: '不可约',
          tuesday: '不可约',
          wednesday: '不可约',
          thursday: '不可约',
          friday: '不可约',
          saturday: '不可约',
          sunday: '不可约'
        },
        {
          timeSlot: '下午',
          monday: '不可约',
          tuesday: '不可约',
          wednesday: '不可约',
          thursday: '不可约',
          friday: '不可约',
          saturday: '不可约',
          sunday: '不可约'
        }
      ]
    }
  },
  watch:{
    id() {
      this.fetchBookingInfo()
    },
    'bookingInfo.availableTime': {
      handler(newVal) {
        if (newVal !== undefined) {
          this.updateScheduleData();
        }
      },
      immediate: true
    }
  },
  created() {
    this.fetchBookingInfo()
  },
  methods:{
    fetchBookingInfo() {
      if (!this.id) return
      this.loading = true

      queryById(this.id)
        .then(response => {
          this.bookingInfo = response.data
          this.updateScheduleData()
        })
        .catch(error => {
          console.error('获取预约信息失败:', error)
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 将availableTime转换为14位二进制字符串
    formatAvailableTime(time) {
      if (time === undefined || time === null) return '00000000000000';

      // 将整数转换为二进制字符串
      const binaryString = Number(time).toString(2);

      // 补零至14位
      return binaryString.padStart(14, '0');
    },

    // 更新表格数据
    updateScheduleData() {
      if (!this.bookingInfo || this.bookingInfo.availableTime === undefined) return;

      // 如果预约状态为不可预约，则所有时间段都设置为不可约
      if (!this.bookingInfo.isAvailable) {
        for (let row = 0; row < 2; row++) {
          const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          for (let day = 0; day < 7; day++) {
            this.scheduleData[row][daysOfWeek[day]] = '不可约';
          }
        }
        return;
      }

      // 如果预约状态为可预约，则根据二进制位设置时间
      const binaryString = this.formatAvailableTime(this.bookingInfo.availableTime);
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      // 更新上午和下午的预约状态
      for (let i = 0; i < 7; i++) {
        // 设置上午状态 (索引 0, 2, 4, 6, 8, 10, 12)
        this.scheduleData[0][daysOfWeek[i]] = binaryString[i*2] === '1' ? '可预约' : '不可约';

        // 设置下午状态 (索引 1, 3, 5, 7, 9, 11, 13)
        this.scheduleData[1][daysOfWeek[i]] = binaryString[i*2 + 1] === '1' ? '可预约' : '不可约';
      }
    },

    // 设置单元格样式
    getCellStyle({ row, column }) {
      // 对第一列（时间段列）不设置特殊样式
      if (column.property === 'timeSlot') {
        return {
          backgroundColor: '#f5f7fa',
          fontWeight: 'bold'
        };
      }

      const cellValue = row[column.property];
      if (cellValue === '可预约') {
        return {
          color: '#67C23A',
          fontWeight: 'bold',
          backgroundColor: '#F0F9EB'
        };
      } else {
        return {
          color: '#F56C6C',
          backgroundColor: '#FEF0F0'
        };
      }
    }
  }
}
</script>

<style scoped>
.booking-info-container {
  padding: 2%;
}

.loading-container {
  padding: 3%;
}

.booking-info-content {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.booking-info-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  padding: 10px 0;
}

.booking-header {
  display: flex;
  align-items: center;
}

.booking-avatar {
  margin-right: 16px; /* 调整右边距以配合更小的图标 */
  background-color: #409EFF;
}

.booking-title {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.booking-title h2 {
  margin: 0 0 8px 0; /* 调整下边距 */
  font-size: 20px; /* 调整标题大小 */
  font-weight: 600;
  color: #303133;
}

.booking-tags {
  display: flex;
  gap: 8px;
}

.booking-descriptions {
  margin-top: 20px;
}

/* 添加以下样式优化描述列表 */
:deep(.el-descriptions-item__cell) {
  padding: 18px 0;
}

:deep(.el-descriptions-item__label) {
  color: #606266;
}

:deep(.el-descriptions-item__content) {
  padding: 12px 15px !important;
}

.info-label {
  color: #409EFF;  /* 修改为蓝色 */
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  min-width: 100px;
}

.info-label i {
  margin-right: 5px;
  color: #409EFF;  /* 修改为蓝色 */
}

.info-content {
  font-size: 14px;
  padding: 0 8px;
  color: #409EFF;  /* 修改为蓝色 */
  background-color: #ecf5ff;  /* 修改为浅蓝色背景 */
  padding: 4px 12px;
  border-radius: 4px;
}

.section-header {
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #409EFF;  /* 修改为蓝色 */
}

.section-title i {
  color: #409EFF;  /* 修改为蓝色 */
}

.doctor-name {
  color: #409EFF;  /* 修改为蓝色 */
  font-weight: 500;
}

/* 让表格的时间段列也保持蓝色 */
:deep(.el-table td.el-table__cell:first-child) {
  color: #409EFF;  /* 修改为蓝色 */
}

.no-data {
  padding: 3%;
  text-align: center;
}

.field-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  min-width: 100px;
}

.field-label i {
  margin-right: 5px;
  color: #409EFF;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.schedule-table-container {
  margin-top: 10px;
  width: 100%;
  overflow-x: auto;
}

/* 让表格内的文字居中 */
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

.booking-info-header {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 增加间距 */
}

.doctor-info, .status-info {
  display: flex;
  align-items: center;
}
</style>


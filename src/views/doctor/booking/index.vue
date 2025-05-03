<template>
  <div class="doctor-booking-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="card-header">
          <h2>预约时间管理</h2>
          <div class="action-buttons">
            <!-- 根据 hasBookingInfo 状态显示不同的按钮 -->
            <template v-if="hasBookingInfo">
              <booking-change-button
                :doctor-id="doctorId"
                :booking-id="bookingId"
                create-or-update="update"
                @submit-success="handleUpdateSuccess">
                <el-button type="primary" size="small">
                  <i class="el-icon-edit"></i> 修改预约时间
                </el-button>
              </booking-change-button>

              <el-button
                type="info"
                size="small"
                @click="refreshData">
                <i class="el-icon-refresh"></i> 刷新
              </el-button>
            </template>

            <!-- 如果没有预约信息，则只显示创建按钮 -->
<!--            <template v-else>-->
<!--              <booking-change-button-->
<!--                :doctor-id="doctorId"-->
<!--                create-or-update="create"-->
<!--                @submit-success="handleCreateSuccess">-->
<!--                <el-button type="success" size="small">-->
<!--                  <i class="el-icon-plus"></i> 新增预约时间-->
<!--                </el-button>-->
<!--              </booking-change-button>-->
<!--            </template>-->
          </div>
        </div>

        <!-- 预约信息显示区域 -->
        <div v-if="loading" class="loading-area">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 使用 v-show 条件显示 bookingInfo 组件 -->
        <div v-show="hasBookingInfo" class="booking-info-area">
          <booking-info
            ref="bookingInfoComponent"
            :doctor-id="doctorId"
            @info-loaded="handleInfoLoaded"
            @info-failed="handleInfoFailed">
          </booking-info>
        </div>

        <div v-if="!loading && !hasBookingInfo" class="no-data-area">
          <el-empty description="暂无预约时间信息">
            <booking-change-button
              :doctor-id="doctorId"
              create-or-update="create"
              @submit-success="handleCreateSuccess">
              <el-button type="primary">新增预约时间</el-button>
            </booking-change-button>
          </el-empty>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BookingInfo from '@/components/services/components/info/bookingInfo.vue'
import BookingChangeButton from '@/components/services/button/change/bookingChangeButton.vue'
import { queryByDoctorId } from '@/api/booking'
import store from "@/store"

export default {
  name: 'DoctorBookingManagement',
  components: {
    BookingInfo,
    BookingChangeButton
  },
  data() {
    return {
      doctorId: store.getters.userId,
      bookingId: null,
      hasBookingInfo: false,
      loading: true
    }
  },
  created() {
    // 组件创建时查询预约信息
    this.checkBookingInfo()
  },
  mounted() {
    // 在组件挂载后安全地调用子组件方法
    this.$nextTick(() => {
      if (this.$refs.bookingInfoComponent) {
        this.$refs.bookingInfoComponent.fetchBookingInfo()
          .then(data => {
            this.hasBookingInfo = true
            if (data && data.id) {
              this.bookingId = data.id
            }
          })
          .catch(() => {
            this.hasBookingInfo = false
            this.bookingId = null
          })
      }
    })
  },
  methods: {
    // 检查当前医生是否有预约信息
    checkBookingInfo() {
      this.loading = true

      queryByDoctorId(this.doctorId)
        .then(response => {
          if (response && response.data) {
            this.hasBookingInfo = true
            this.bookingId = response.data.id
          } else {
            this.hasBookingInfo = false
            this.bookingId = null
          }
        })
        .catch(() => {
          this.hasBookingInfo = false
          this.bookingId = null
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 处理 bookingInfo 组件加载成功的事件
    handleInfoLoaded(data) {
      this.hasBookingInfo = true
      if (data && data.id) {
        this.bookingId = data.id
      }
    },

    // 处理 bookingInfo 组件加载失败的事件
    handleInfoFailed() {
      this.hasBookingInfo = false
      this.bookingId = null
    },

    // 更新预约信息成功后的处理
    handleUpdateSuccess() {
      this.$message({
        type: 'success',
        message: '预约时间更新成功！'
      })
      this.refreshData()
    },

    // 创建预约信息成功后的处理
    handleCreateSuccess() {
      this.$message({
        type: 'success',
        message: '预约时间创建成功！'
      })
      // 创建成功后刷新数据，检查是否有预约信息
      this.checkBookingInfo()
    },

    // 刷新数据
    refreshData() {
      this.loading = true

      // 如果存在预约信息组件，更新其数据
      this.$nextTick(() => {
        if (this.$refs.bookingInfoComponent) {
          this.$refs.bookingInfoComponent.fetchBookingInfo()
            .then(data => {
              this.hasBookingInfo = true
              if (data && data.id) {
                this.bookingId = data.id
              }
              this.loading = false
            })
            .catch(() => {
              this.hasBookingInfo = false
              this.bookingId = null
              this.loading = false
            })
        } else {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.doctor-booking-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.card-header h2 {
  font-size: 18px;
  color: #303133;
  font-weight: 500;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.loading-area,
.no-data-area {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.no-data-area {
  padding: 40px 0;
  text-align: center;
}

.booking-info-area {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-header h2 {
    margin-bottom: 10px;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

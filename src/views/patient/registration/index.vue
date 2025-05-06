<template>
  <div class="app-container">
    <!-- 添加顶部导航按钮 -->
    <div class="nav-buttons">
      <el-button
        :type="activeView === 'newRegistration' ? 'primary' : 'default'"
        :plain="activeView !== 'newRegistration'"
        @click="switchView('newRegistration')">
        <i class="el-icon-plus"></i> 新增挂号
      </el-button>
      <el-button
        :type="activeView === 'myRegistrations' ? 'primary' : 'default'"
        :plain="activeView !== 'myRegistrations'"
        @click="switchView('myRegistrations')">
        <i class="el-icon-document"></i> 我的挂号
      </el-button>
    </div>

    <!-- 新增挂号视图 -->
    <div v-if="activeView === 'newRegistration'">
      <el-card class="filter-container" shadow="never">
        <div class="filter-title">选择科室</div>
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="科室">
            <el-select
              v-model="filterForm.departmentId"
              placeholder="请选择科室"
              filterable
              clearable
              @change="handleDepartmentChange">
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <div class="department-option">
                  <span>{{ item.name }}</span>
                  <span class="department-code">{{ item.code }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 只有选择部门且查询到医生后才显示医生列表 -->
      <el-card
        v-if="filterForm.departmentId && isDoctorListLoaded"
        class="doctor-list-container"
        shadow="never"
        v-loading="loading">
        <div class="list-title">医生列表</div>

        <div v-if="doctorList.length === 0" class="empty-tip">
          <el-empty description="该科室下暂无可预约医生"></el-empty>
        </div>

        <el-table
          v-else
          :data="doctorList"
          style="width: 100%"
          border
          stripe>
          <el-table-column
            prop="realName"
            label="医生姓名"
            align="center"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="title"
            label="职称"
            align="center"
            min-width="100">
            <template slot-scope="scope">
              {{ scope.row.title || '未设置' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="specialty"
            label="专长"
            align="center"
            min-width="180">
            <template slot-scope="scope">
              <div v-if="scope.row.specialty">
                <el-tag
                  v-for="(item, index) in parseSpecialty(scope.row.specialty)"
                  :key="index"
                  type="success"
                  style="margin: 2px"
                  disable-transitions
                >
                  {{ item }}
                </el-tag>
              </div>
              <div v-else>
                <el-tag type="info" disable-transitions>暂无信息</el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 添加评分列 -->
          <el-table-column
            label="医生评分"
            align="center"
            min-width="120">
            <template slot-scope="scope">
              <el-rate
                v-model="scope.row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}">
              </el-rate>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            align="center"
            width="120">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleSelectDoctor(scope.row)">
                选择预约
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
          v-if="doctorList.length > 0"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page.sync="pagination.current"
          :page-size="pagination.size"
          :total="pagination.total"
          @current-change="handleCurrentChange">
        </el-pagination>
      </el-card>

      <!-- 预约弹窗 -->
      <el-dialog
        title="选择预约时间"
        :visible.sync="bookingDialogVisible"
        width="700px"
        :before-close="handleCloseBookingDialog"
        v-loading="bookingLoading">
        <div v-if="bookingInfo">
          <div class="doctor-booking-header">
            <el-avatar :size="40" icon="el-icon-user-solid"></el-avatar>
            <div class="doctor-booking-info">
              <h3>{{ selectedDoctor ? selectedDoctor.realName : '' }} 医生</h3>
              <div class="doctor-dept">
                <span>{{ currentDepartment ? currentDepartment.name : '' }}</span>
                <span v-if="selectedDoctor && selectedDoctor.title">· {{ selectedDoctor.title }}</span>
              </div>
            </div>
          </div>

          <!-- 预约日期选择 -->
          <div class="booking-date-selection">
            <h4 class="section-title">选择日期</h4>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              :picker-options="datePickerOptions"
              value-format="yyyy-MM-dd"
              @change="handleDateChange">
            </el-date-picker>
          </div>

          <!-- 时间段选择 -->
          <div class="booking-time-selection" v-if="selectedDate">
            <h4 class="section-title">选择时间段</h4>
            <div class="time-slot-options">
              <el-radio-group v-model="selectedTimeSlot">
                <el-radio
                  :label="0"
                  :disabled="!availableTimeSlots.morning">
                  上午
                </el-radio>
                <el-radio
                  :label="1"
                  :disabled="!availableTimeSlots.afternoon">
                  下午
                </el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="booking-info-notice" v-if="!isAvailableDate">
            <el-alert
              title="该日期没有可预约的时间段"
              type="warning"
              :closable="false"
              show-icon>
            </el-alert>
          </div>
        </div>

        <div v-else-if="!bookingLoading" class="no-booking-info">
          <el-alert
            title="该医生暂未设置预约时间，请选择其他医生"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </div>

        <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseBookingDialog">取 消</el-button>
        <el-button
          type="primary"
          @click="submitRegistration"
          :disabled="!canSubmit">
          确认预约
        </el-button>
      </span>
      </el-dialog>
    </div>

    <!-- 我的挂号视图 -->
    <div v-else-if="activeView === 'myRegistrations'">
      <el-card class="my-registrations-container" shadow="never" v-loading="myRegistrationsLoading">
        <div class="list-title">我的挂号记录</div>

        <div v-if="myRegistrations.length === 0" class="empty-tip">
          <el-empty description="暂无挂号记录"></el-empty>
        </div>

        <el-table
          v-else
          :data="myRegistrations"
          style="width: 100%"
          border
          stripe>
          <el-table-column
            prop="departmentName"
            label="科室"
            align="center"
            min-width="120">
          </el-table-column>
          <el-table-column
            prop="doctorName"
            label="医生"
            align="center"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="appointmentDate"
            label="预约日期"
            align="center"
            min-width="150">
            <template slot-scope="scope">
              {{ formatAppointmentDate(scope.row.appointmentDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="appointmentTime"
            label="预约时段"
            align="center"
            width="100">
            <template slot-scope="scope">
              {{ scope.row.appointmentTime === 0 ? '上午' : '下午' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="isFinish"
            label="状态"
            align="center"
            width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isFinish === 1 ? 'success' : 'warning'">
                {{ scope.row.isFinish === 1 ? '已完成' : '待就诊' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 添加操作列 -->
          <el-table-column
            label="操作"
            align="center"
            width="180">
            <template slot-scope="scope">
              <div class="operation-buttons">
                <el-button
                  size="mini"
                  type="primary"
                  :disabled="scope.row.isFinish === 1"
                  @click="handleEditRegistration(scope.row)">
                  修改
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  :disabled="scope.row.isFinish === 1"
                  @click="handleCancelRegistration(scope.row)">
                  取消
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
          v-if="myRegistrations.length > 0"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page.sync="myRegistrationPagination.current"
          :page-size="myRegistrationPagination.size"
          :total="myRegistrationPagination.total"
          @current-change="handleMyRegistrationPageChange">
        </el-pagination>
      </el-card>
    </div>

    <!-- 添加修改预约弹窗 -->
    <el-dialog
      title="修改预约"
      :visible.sync="editDialogVisible"
      width="700px"
      :before-close="handleCloseEditDialog"
      v-loading="editLoading">

      <div v-if="currentBookingInfo && selectedRegistration">
        <div class="doctor-booking-header">
          <el-avatar :size="40" icon="el-icon-user-solid"></el-avatar>
          <div class="doctor-booking-info">
            <h3>{{ selectedRegistration.doctorName }} 医生</h3>
            <div class="doctor-dept">
              <span>{{ selectedRegistration.departmentName }}</span>
            </div>
          </div>
        </div>

        <!-- 预约日期选择 -->
        <div class="booking-date-selection">
          <h4 class="section-title">选择新日期</h4>
          <el-date-picker
            v-model="editDate"
            type="date"
            placeholder="选择日期"
            :picker-options="datePickerOptions"
            value-format="yyyy-MM-dd"
            @change="handleEditDateChange">
          </el-date-picker>
        </div>

        <!-- 时间段选择 -->
        <div class="booking-time-selection" v-if="editDate">
          <h4 class="section-title">选择新时间段</h4>
          <div class="time-slot-options">
            <el-radio-group v-model="editTimeSlot">
              <el-radio
                :label="0"
                :disabled="!editAvailableTimeSlots.morning">
                上午
              </el-radio>
              <el-radio
                :label="1"
                :disabled="!editAvailableTimeSlots.afternoon">
                下午
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="booking-info-notice" v-if="!isEditAvailableDate">
          <el-alert
            title="该日期没有可预约的时间段"
            type="warning"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
      </div>

      <div v-else-if="!editLoading" class="no-booking-info">
        <el-alert
          title="无法获取医生预约信息，请稍后重试"
          type="info"
          :closable="false"
          show-icon>
        </el-alert>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseEditDialog">取 消</el-button>
        <el-button
          type="primary"
          @click="submitEditRegistration"
          :disabled="!canEditSubmit">
          确认修改
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { queryAllDepartments } from '@/api/department'
import { pageQuery as userPageQuery, queryByUserId } from '@/api/user'
import { queryByDoctorId } from '@/api/booking'
import { createRegistration, pageQuery, updateRegistration, dleteRegistration } from '@/api/registration'
import { getAverageRating } from '@/api/evaluation' // 导入获取评分的API
import store from '@/store'

export default {
  name: 'PatientRegistration',
  data() {
    return {
      // 添加视图切换控制变量
      activeView: 'newRegistration',

      // 我的挂号相关数据
      myRegistrations: [],
      myRegistrationPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      myRegistrationsLoading: false,

      // 科室相关数据
      departmentList: [],
      departmentCache: null,
      departmentCacheExpiry: null,

      // 医生相关数据
      doctorList: [],
      filterForm: {
        departmentId: ''
      },
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      loading: false,
      currentDepartment: null,
      isDoctorListLoaded: false,

      // 预约相关数据
      bookingDialogVisible: false,
      bookingLoading: false,
      bookingInfo: null,
      selectedDoctor: null,
      selectedDate: '',
      selectedTimeSlot: null,
      availableTimeSlots: {
        morning: false,
        afternoon: false
      },
      datePickerOptions: {
        disabledDate(date) {
          return date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                 date > new Date(new Date().setDate(new Date().getDate() + 30));
        }
      },
      patientId: store.getters.userId,

      // 修改预约相关数据
      editDialogVisible: false,
      editLoading: false,
      selectedRegistration: null,
      currentBookingInfo: null,
      editDate: '',
      editTimeSlot: null,
      editAvailableTimeSlots: {
        morning: false,
        afternoon: false
      }
    }
  },
  computed: {
    // ...现有的计算属性...
    isAvailableDate() {
      return this.availableTimeSlots.morning || this.availableTimeSlots.afternoon;
    },
    canSubmit() {
      return this.selectedDate &&
        this.selectedTimeSlot !== null &&
        this.isAvailableDate &&
        ((this.selectedTimeSlot === 0 && this.availableTimeSlots.morning) ||
          (this.selectedTimeSlot === 1 && this.availableTimeSlots.afternoon));
    },
    // 计算当前选择日期是星期几（0-6，0代表周日）
    selectedDayOfWeek() {
      if (!this.selectedDate) return null;

      const date = new Date(this.selectedDate);
      let day = date.getDay(); // 0-6, 0是周日
      return day;
    },
    // 修改预约相关计算属性
    isEditAvailableDate() {
      return this.editAvailableTimeSlots.morning || this.editAvailableTimeSlots.afternoon;
    },
    canEditSubmit() {
      return this.editDate &&
        this.editTimeSlot !== null &&
        this.isEditAvailableDate &&
        ((this.editTimeSlot === 0 && this.editAvailableTimeSlots.morning) ||
          (this.editTimeSlot === 1 && this.editAvailableTimeSlots.afternoon));
    }
  },
  created() {
    // 页面创建时获取所有科室信息
    this.fetchDepartments()
  },
  methods: {
    // 添加视图切换方法
    switchView(view) {
      this.activeView = view;
      if (view === 'myRegistrations') {
        this.fetchMyRegistrations();
      }
    },

    // 添加获取我的挂号记录方法
    fetchMyRegistrations() {
      if (!this.patientId) {
        this.$message.error('获取患者ID失败');
        return;
      }

      // 确保部门数据已加载
      this.fetchDepartments().then(() => {
        this.myRegistrationsLoading = true;

        pageQuery(
          { patientId: this.patientId },
          this.myRegistrationPagination.current - 1,
          this.myRegistrationPagination.size
        )
          .then(response => {
            if (response && response.data) {
              const records = response.data.records || [];

              // 创建一个Promise数组，用于存储所有queryByUserId请求
              const doctorPromises = records.map(registration => {
                return queryByUserId(registration.doctorId, 'doctor')
                  .then(doctorResponse => {
                    if (doctorResponse && doctorResponse.data) {
                      // 将医生姓名添加到挂号记录中
                      registration.doctorName = doctorResponse.data.realName || '未知医生';

                      // 获取医生的部门ID
                      const departmentId = doctorResponse.data.departmentId;

                      // 如果有部门ID，从缓存中查找部门名称
                      if (departmentId && this.departmentCache) {
                        const department = this.departmentCache.find(dept => dept.id === departmentId);
                        if (department) {
                          registration.departmentName = department.name;
                        }
                      }

                      // 如果没有找到部门名称，使用默认值
                      if (!registration.departmentName) {
                        registration.departmentName = doctorResponse.data.departmentName || '未知科室';
                      }
                    }
                    return registration;
                  })
                  .catch(() => {
                    // 如果查询失败，设置默认值
                    registration.doctorName = '未知医生';
                    registration.departmentName = '未知科室';
                    return registration;
                  });
              });

              // 等待所有医生信息查询完成
              Promise.all(doctorPromises)
                .then(updatedRegistrations => {
                  this.myRegistrations = updatedRegistrations;
                  this.myRegistrationPagination.total = response.data.total || 0;
                  this.myRegistrationPagination.current = (response.data.current || 0) + 1;
                  this.myRegistrationPagination.size = response.data.size || 10;
                })
                .finally(() => {
                  this.myRegistrationsLoading = false;
                });
            } else {
              this.$message.error('获取挂号记录失败');
              this.myRegistrations = [];
              this.myRegistrationsLoading = false;
            }
          })
          .catch(error => {
            console.error('获取挂号记录出错:', error);
            this.$message.error('获取挂号记录失败');
            this.myRegistrations = [];
            this.myRegistrationsLoading = false;
          });
      });
    },

    // 添加我的挂号分页切换方法
    handleMyRegistrationPageChange(page) {
      this.myRegistrationPagination.current = page;
      this.fetchMyRegistrations();
    },

    // 格式化预约日期显示
    formatAppointmentDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
    },

    // 获取所有部门信息并缓存
    fetchDepartments() {
      // 检查是否有有效缓存
      const now = Date.now();
      if (this.departmentCache && this.departmentCacheExpiry && this.departmentCacheExpiry > now) {
        console.log('使用缓存的部门数据');
        this.departmentList = this.departmentCache;
        return Promise.resolve(this.departmentCache);
      }

      // 无有效缓存，从API获取
      return queryAllDepartments()
        .then(response => {
          if (response && response.code === '0') {
            // 存储部门数据
            this.departmentList = response.data || [];

            // 缓存部门数据，设置30分钟过期
            this.departmentCache = [...this.departmentList];
            this.departmentCacheExpiry = now + (30 * 60 * 1000);

            console.log('成功获取部门数据并缓存');
            return this.departmentList;
          } else {
            this.$message.error('获取科室信息失败');
            return [];
          }
        });
    },

    // 重置其他方法中的查询逻辑，使用缓存数据
    handleDepartmentChange(departmentId) {
      if (!departmentId) {
        this.doctorList = [];
        this.isDoctorListLoaded = false;
        return;
      }

      // 从缓存的部门列表中查找当前选中的部门
      this.currentDepartment = this.departmentList.find(dept => dept.id === departmentId) || null;
      this.pagination.current = 1; // 重置页码
      this.fetchDoctors();
    },

    // 根据部门ID查询医生列表
    fetchDoctors() {
      if (!this.filterForm.departmentId) {
        return;
      }

      this.loading = true;
      this.isDoctorListLoaded = false;

      // 构造查询参数
      const queryParams = {
        departmentId: this.filterForm.departmentId,
        userType: 'doctor'
      };

      // 调用API查询医生列表
      userPageQuery(
        queryParams,
        this.pagination.current - 1,
        this.pagination.size,
        'doctor'
      )
        .then(response => {
          if (response && response.data) {
            const doctors = (response.data.records || []).map(doctor => {
              // 处理专长字段，将JSON字符串转换为数组
              return {
                ...doctor,
                specialtyArray: this.parseSpecialty(doctor.specialty),
                rating: 0 // 初始化评分为0
              };
            });

            // 为每个医生获取评分
            const ratingPromises = doctors.map(doctor => {
              return getAverageRating(doctor.id)
                .then(response => {
                  if (response && response.data !== undefined) {
                    // 处理-1的情况（无评分）
                    doctor.rating = response.data === -1 ? 0 : response.data;
                  }
                  return doctor;
                })
                .catch(error => {
                  console.error(`获取医生${doctor.id}的评分失败:`, error);
                  return doctor;
                });
            });

            // 等待所有评分获取完成
            Promise.all(ratingPromises)
              .then(doctorsWithRatings => {
                this.doctorList = doctorsWithRatings;
                this.pagination.total = response.data.total || 0;
                this.pagination.current = (response.data.current || 0) + 1;
                this.isDoctorListLoaded = true;
              })
              .finally(() => {
                this.loading = false;
              });
          } else {
            this.doctorList = [];
            this.$message.error('获取医生列表失败');
            this.loading = false;
          }
        })
        .catch(error => {
          console.error('获取医生列表失败:', error);
          this.doctorList = [];
          this.$message.error('获取医生列表失败');
          this.loading = false;
        });
    },

    handleCurrentChange(page) {
      this.pagination.current = page;
      this.fetchDoctors();
    },

    parseSpecialty(val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return [];
      }
    },

    // 选择医生
    handleSelectDoctor(doctor) {
      this.selectedDoctor = doctor;
      this.fetchDoctorBookingInfo(doctor.id);
    },
    // 获取医生预约信息
    fetchDoctorBookingInfo(doctorId) {
      this.bookingDialogVisible = true;
      this.bookingLoading = true;
      this.bookingInfo = null;
      this.selectedDate = '';
      this.selectedTimeSlot = null;

      queryByDoctorId(doctorId)
        .then(response => {
          if (response && response.data) {
            this.bookingInfo = response.data;
          } else {
            this.bookingInfo = null;
          }
        })
        .finally(() => {
          this.bookingLoading = false;
        });
    },

    // 处理日期变化
    handleDateChange(date) {
      if (!date || !this.bookingInfo) {
        this.availableTimeSlots = {
          morning: false,
          afternoon: false
        };
        this.selectedTimeSlot = null;
        return;
      }

      // 根据选择的日期和医生的可预约时间，判断哪些时间段可以预约
      const dayOfWeek = new Date(date).getDay(); // 0-6, 0是周日
      const binaryString = this.formatAvailableTime(this.bookingInfo.availableTime);

      // 调整索引，将周日从0调整到6的位置
      const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // 计算上午和下午的时间槽位在二进制字符串中的索引
      const morningIndex = adjustedDayIndex * 2;
      const afternoonIndex = adjustedDayIndex * 2 + 1;

      this.availableTimeSlots = {
        morning: binaryString[morningIndex] === '1' && this.bookingInfo.isAvailable,
        afternoon: binaryString[afternoonIndex] === '1' && this.bookingInfo.isAvailable
      };

      // 如果当前选择的时间段不可用，则重置选择
      if ((this.selectedTimeSlot === 0 && !this.availableTimeSlots.morning) ||
        (this.selectedTimeSlot === 1 && !this.availableTimeSlots.afternoon)) {
        this.selectedTimeSlot = null;
      }

      // 如果只有一个时间段可用，自动选择
      if (this.availableTimeSlots.morning && !this.availableTimeSlots.afternoon) {
        this.selectedTimeSlot = 0;
      } else if (!this.availableTimeSlots.morning && this.availableTimeSlots.afternoon) {
        this.selectedTimeSlot = 1;
      }
    },

    // 将availableTime转换为14位二进制字符串
    formatAvailableTime(time) {
      if (time === undefined || time === null) return '00000000000000';

      // 将整数转换为二进制字符串
      const binaryString = Number(time).toString(2);

      // 补零至14位
      return binaryString.padStart(14, '0');
    },

    // 关闭预约弹窗
    handleCloseBookingDialog() {
      this.bookingDialogVisible = false;
      this.bookingInfo = null;
      this.selectedDate = '';
      this.selectedTimeSlot = null;
    },
    // 提交预约
    submitRegistration() {
      if (!this.canSubmit || !this.patientId || !this.selectedDoctor) {
        this.$message.error('预约信息不完整，请检查');
        return;
      }

      const registrationData = {
        patientId: this.patientId,
        doctorId: this.selectedDoctor.id,
        appointmentDate: this.selectedDate,
        appointmentTime: this.selectedTimeSlot,
        departmentId: this.filterForm.departmentId
      };

      this.bookingLoading = true;

      createRegistration(registrationData)
        .then(response => {
          this.$message.success('预约成功！');
          this.handleCloseBookingDialog();
        })
        .finally(() => {
          this.bookingLoading = false;
        });
    },

    // 处理修改预约
    handleEditRegistration(registration) {
      this.selectedRegistration = registration;
      this.editDialogVisible = true;
      this.editLoading = true;
      this.editDate = '';
      this.editTimeSlot = null;

      // 获取医生的预约信息
      queryByDoctorId(registration.doctorId)
        .then(response => {
          if (response && response.data) {
            this.currentBookingInfo = response.data;
            // 默认显示当前预约的日期和时间段
            this.editDate = registration.appointmentDate;
            this.editTimeSlot = registration.appointmentTime;
            this.handleEditDateChange(this.editDate);
          } else {
            this.currentBookingInfo = null;
            this.$message.warning('无法获取医生预约信息');
          }
        })
        .finally(() => {
          this.editLoading = false;
        });
    },

    // 处理编辑时日期变化
    handleEditDateChange(date) {
      if (!date || !this.currentBookingInfo) {
        this.editAvailableTimeSlots = {
          morning: false,
          afternoon: false
        };
        this.editTimeSlot = null;
        return;
      }

      // 根据选择的日期和医生的可预约时间，判断哪些时间段可以预约
      const dayOfWeek = new Date(date).getDay(); // 0-6, 0是周日
      const binaryString = this.formatAvailableTime(this.currentBookingInfo.availableTime);

      // 调整索引，将周日从0调整到6的位置
      const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // 计算上午和下午的时间槽位在二进制字符串中的索引
      const morningIndex = adjustedDayIndex * 2;
      const afternoonIndex = adjustedDayIndex * 2 + 1;

      this.editAvailableTimeSlots = {
        morning: binaryString[morningIndex] === '1' && this.currentBookingInfo.isAvailable,
        afternoon: binaryString[afternoonIndex] === '1' && this.currentBookingInfo.isAvailable
      };

      // 如果当前选择的时间段不可用，则重置选择
      if ((this.editTimeSlot === 0 && !this.editAvailableTimeSlots.morning) ||
        (this.editTimeSlot === 1 && !this.editAvailableTimeSlots.afternoon)) {
        this.editTimeSlot = null;
      }

      // 如果只有一个时间段可用，自动选择
      if (this.editAvailableTimeSlots.morning && !this.editAvailableTimeSlots.afternoon) {
        this.editTimeSlot = 0;
      } else if (!this.editAvailableTimeSlots.morning && this.editAvailableTimeSlots.afternoon) {
        this.editTimeSlot = 1;
      }
    },

    // 关闭修改预约弹窗
    handleCloseEditDialog() {
      this.editDialogVisible = false;
      this.selectedRegistration = null;
      this.currentBookingInfo = null;
      this.editDate = '';
      this.editTimeSlot = null;
    },

    // 提交修改预约
    submitEditRegistration() {
      if (!this.canEditSubmit || !this.selectedRegistration) {
        this.$message.error('修改信息不完整，请检查');
        return;
      }

      // 检查是否有实际修改
      if (this.editDate === this.selectedRegistration.appointmentDate &&
          this.editTimeSlot === this.selectedRegistration.appointmentTime) {
        this.$message.info('预约信息未变更');
        this.handleCloseEditDialog();
        return;
      }

      const updateData = {
        id: this.selectedRegistration.id,
        patientId: this.selectedRegistration.patientId,
        doctorId: this.selectedRegistration.doctorId,
        appointmentDate: this.editDate,
        appointmentTime: this.editTimeSlot
      };

      this.editLoading = true;

      updateRegistration(updateData)
        .then(response => {
          if (response && response.code === '0') {
            this.$message.success('预约修改成功！');
            this.handleCloseEditDialog();
            // 刷新挂号记录列表
            this.fetchMyRegistrations();
          } else {
            this.$message.error('修改预约失败: ' + (response.message || '未知错误'));
          }
        })
        .catch(error => {
          console.error('修改预约出错:', error);
          this.$message.error('修改预约失败');
        })
        .finally(() => {
          this.editLoading = false;
        });
    },

    // 处理取消预约
    handleCancelRegistration(registration) {
      this.$confirm('确定要取消此次预约吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.myRegistrationsLoading = true;

        dleteRegistration(registration.id)
          .then(response => {
            if (response && response.code === '0') {
              this.$message.success('预约已取消');
              // 刷新挂号记录列表
              this.fetchMyRegistrations();
            } else {
              this.$message.error('取消预约失败: ' + (response.message || '未知错误'));
              this.myRegistrationsLoading = false;
            }
          })
          .catch(error => {
            console.error('取消预约出错:', error);
            this.$message.error('取消预约失败');
            this.myRegistrationsLoading = false;
          });
      }).catch(() => {
        // 用户取消操作
      });
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 添加导航按钮样式 */
.nav-buttons {
  display: flex;
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.nav-buttons .el-button {
  flex: 1;
  margin: 0;
  border-radius: 0;
  height: 50px;
  font-size: 16px;
}

.nav-buttons .el-button:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.nav-buttons .el-button:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 我的挂号容器样式 */
.my-registrations-container {
  margin-bottom: 20px;
}

/* 现有样式 */
.filter-container, .doctor-list-container {
  margin-bottom: 20px;
}

.filter-title, .list-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.department-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-code {
  color: #909399;
  font-size: 12px;
}

.empty-tip {
  padding: 30px 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 编辑预约弹窗样式 */
.doctor-booking-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.doctor-booking-info {
  margin-left: 15px;
}

.doctor-booking-info h3 {
  margin: 0;
  font-size: 18px;
}

.doctor-dept {
  color: #606266;
  font-size: 14px;
  margin-top: 5px;
}

.section-title {
  margin-top: 15px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.booking-date-selection,
.booking-time-selection {
  margin-bottom: 20px;
}

.time-slot-options {
  margin-top: 10px;
}

.booking-info-notice {
  margin-top: 20px;
}
</style>


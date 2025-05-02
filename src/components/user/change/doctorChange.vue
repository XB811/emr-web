<template>
  <div class="doctor-change-container">
    <el-form ref="operatorForm" :model="operatorForm" :rules="operatorRules" label-width="80px" size="small" v-loading="loading">
      <!-- 创建时不显示用户名字段 -->
      <el-form-item v-if="createOrUpdate === 'update'" label="用户名" prop="username" required="true">
        <el-input v-model="operatorForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="createOrUpdate === 'create'">
        <el-input v-model="operatorForm.password" :type="passwordType" ref="password">
          <i slot="suffix" class="el-icon-view" @click="showPwd"></i>
        </el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName" required="true" >
        <el-input v-model="operatorForm.realName">
        </el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="operatorForm.gender">
          <el-option label="男" value="false"></el-option>
          <el-option label="女" value="true"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone" required="true">
        <el-input v-model="operatorForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="职称" prop="title">
        <el-cascader
          v-model="titleValue"
          :options="titleOptions"
          @change="handleTitleChange"
          placeholder="请选择职称"
          clearable
          :props="{
            expandTrigger: 'hover',
            checkStrictly: false
          }">
        </el-cascader>
      </el-form-item>
      <el-form-item label="所属科室" prop="departmentId">
        <el-select v-model="operatorForm.departmentId" placeholder="请选择科室">
          <el-option
            v-for="item in departmentOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="专业领域" prop="specialties">
        <el-select
          v-model="operatorForm.specialty"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择专业领域（可多选或自定义）">
          <el-option v-for="item in specialtyOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { queryActualByUserId, register, updateById } from "@/api/user"
import { validPassword, validPhone, validRealName, validUsername } from "@/utils/validate";
import { queryAllDepartments } from "@/api/department"; // 添加部门列表API导入

export default {
  name: 'DoctorChange',
  props:{
    userType:{
      type: String,
      default: 'doctor'
    },
    id:{
      type: [String, Number],
      required: true,
    },
    createOrUpdate:{
      type: String,
      required: true,
    }
  },
  data(){
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('用户名或手机号不合法'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error('密码至少包含字母、数字、特殊字符，长度为6-16位'))
      } else {
        callback()
      }
    }
    const validateRealName = (rule, value, callback) => {
      if (!validRealName(value)) {
        callback(new Error('真实姓名必须为2-4位汉字'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if(!validPhone(value)) {
        callback(new Error('手机号不合法'))
      } else {
        callback()
      }
    }
    return{
      createForm:{
        username: null,
        password: null,
        realName: null,
        phone: null,
        userType: this.userType,
        title: null,
        gender: {
          type: String,
          default: false,
        },
        departmentId: null,
        specialty: []
      },
      updateForm:{
        id: this.id,
        username: null,
        password: null,
        realName: null,
        phone: null,
        gender: {
          type: String,
          default: false
        },
        userType: this.userType,
        title: null,
        departmentId: null,
        specialty: []
      },
      operatorForm: null,
      loading: false,
      passwordType: 'password',
      specialtyOptions: [
        '糖尿病', '高血压', '心脏病', '呼吸系统疾病', '消化系统疾病',
        '神经系统疾病', '肿瘤', '骨科', '皮肤病', '儿科疾病',
        '妇产科疾病', '精神心理疾病', '眼科疾病', '耳鼻喉疾病'
      ],
      departmentOptions: [], // 科室选项列表
      titleValue: [], // 级联选择器的值
      // 职称的级联选项
      titleOptions: [
        {
          value: '医士',
          label: '医士',
        },
        {
          value: '医师',
          label: '医师',
          children: [
            { value: '一级医师', label: '一级医师' },
            { value: '二级医师', label: '二级医师' },
          ]
        },
        {
          value: '主治医师',
          label: '主治医师',
          children: [
            { value: '一级主治医师', label: '一级主治医师' },
            { value: '二级主治医师', label: '二级主治医师' },
            { value: '三级主治医师', label: '三级主治医师' }
          ]
        },
        {
          value: '副主任医师',
          label: '副主任医师',
          children: [
            { value: '一级副主任医师', label: '一级副主任医师' },
            { value: '二级副主任医师', label: '二级副主任医师' },
            { value: '三级副主任医师', label: '三级副主任医师' }
          ]
        },
        {
          value: '主任医师',
          label: '主任医师',
          children: [
            { value: '一级主任医师', label: '一级主任医师' },
            { value: '二级主任医师', label: '二级主任医师' },
            { value: '三级主任医师', label: '三级主任医师' }
          ]
        }
      ],
      operatorRules:{
        username:[{require: true, trigger: 'blur',validator: validateUsername},],
        password:[{require: this.createOrUpdate==='create', trigger: 'blur',validator: validatePassword}],
        realName:[{require: true, trigger: 'blur',validator: validateRealName},],
        gender:[{
          required: true,
          message: '请选择性别',
          trigger: 'blur'
        }],
        phone:[{require: true, trigger: 'blur',validator: validatePhone},],
        title: [{ required: true, message: '请选择职称', trigger: 'change' }],
        departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }]
      }
    }
  },
  created() {
    // 获取科室列表
    this.fetchDepartments();

    // 根据 createOrUpdate 设置 operatorForm 指向
    if (this.createOrUpdate === 'create') {
      this.operatorForm = this.createForm;
    } else {
      this.operatorForm = this.updateForm;
      // 如果是 update，获取用户信息填充表单
      this.getUserInfo();
    }
  },
  methods: {
    // 获取科室列表
    fetchDepartments() {
      this.loading = true;
      queryAllDepartments()
        .then(response => {
          if (response && response.data) {
            this.departmentOptions = response.data;
          }
        })
        .catch(error => {
          console.error('获取科室列表失败:', error);
          this.$message.error('获取科室列表失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getUserInfo() {
      this.loading = true;
      queryActualByUserId(this.id, this.userType)
        .then(response => {
          if (response && response.data) {
            const userData = response.data;
            // 填充 updateForm
            this.updateForm.username = userData.username;
            this.updateForm.realName = userData.realName;
            this.updateForm.phone = userData.phone;
            this.updateForm.title = userData.title;
            this.updateForm.departmentId = userData.departmentId;
            this.updateForm.gender=String(userData.gender);

            // 根据职称设置级联选择器的值
            this.initTitleValue(userData.title);

            this.updateForm.departmentId = userData.departmentId;

            // 处理specialty字段
            if (userData.specialty) {
              if (typeof userData.specialty === 'string') {
                try {
                  this.updateForm.specialty = JSON.parse(userData.specialty);
                } catch (e) {
                  // 如果解析失败，将字符串分割为数组
                  this.updateForm.specialty = userData.specialty.split(',').map(item => item.trim());
                }
              } else if (Array.isArray(userData.specialty)) {
                this.updateForm.specialty = userData.specialty;
              }
            }
          }
        })
        .catch(error => {
          console.error('获取医生信息失败:', error);
          this.$message.error('获取医生信息失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 初始化职称选择器的值
    initTitleValue(title) {
      if (!title) {
        this.titleValue = [];
        return;
      }

      // 匹配职称的一级和二级选项
      for (const option of this.titleOptions) {
        // 如果标题精确匹配一级选项
        if (title === option.value) {
          this.titleValue = [option.value];
          return;
        }

        // 检查是否匹配二级选项
        if (option.children) {
          for (const child of option.children) {
            if (title === child.value) {
              this.titleValue = [option.value, child.value];
              return;
            }
          }
        }
      }

      // 如果没有匹配项，尝试找到最接近的一级选项
      for (const option of this.titleOptions) {
        if (title.includes(option.value)) {
          this.titleValue = [option.value];
          return;
        }
      }

      this.titleValue = [];
    },

    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },

    // 重置表单验证信息
    resetFormValidation() {
      if (this.$refs.operatorForm) {
        this.$refs.operatorForm.clearValidate();
      }
    },

    // 处理职称选择变化
    handleTitleChange(value) {
      // 如果选择了二级职称，将其设为title值
      if (value.length > 1) {
        this.operatorForm.title = value[1];
      } else if (value.length === 1) {
        // 如果只选择了一级职称，直接使用该值
        this.operatorForm.title = value[0];
      } else {
        this.operatorForm.title = null;
      }
    },

    submitForm() {
      // 提交表单前验证
      this.$refs.operatorForm.validate(valid => {
        if (valid) {
          this.loading = true;

          // 处理提交的 specialty 数据，确保它是字符串
          const formData = JSON.parse(JSON.stringify(this.operatorForm));
          if (Array.isArray(formData.specialty)) {
            formData.specialty = JSON.stringify(formData.specialty);
          }

          // 根据 createOrUpdate 决定调用哪个API，添加userType参数
          const apiRequest = this.createOrUpdate === 'create'
            ? register(formData, this.userType)
            : updateById(formData, this.userType);

          apiRequest
            .then(response => {
              console.log(response);
              if (response && response.code === "0") {  // 修改为字符串"0"匹配
                this.$message.success(this.createOrUpdate === 'create' ? '注册成功！' : '更新成功！');
                this.$emit('update-success', this.operatorForm);
              } else {
                throw new Error(response.message || '操作失败');
              }
            })
            .catch(error => {
              console.error(this.createOrUpdate === 'create' ? '注册失败:' : '更新失败:', error);
              this.$message.error(error.message || (this.createOrUpdate === 'create' ? '注册失败' : '更新失败'));
            })
            .finally(() => {
              this.loading = false;
            });
          // 刷新组件的数据
          this.getUserInfo();
        } else {
          console.log('参数不合法')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.doctor-change-container {
  padding: 0 10px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-cascader {
  width: 100%;
}
</style>


<!--全局组件之上方导航栏组件，负责顶部布局和用户操作界面-->
<template>
  <div class="navbar">
    <!-- 左侧菜单按钮，控制侧边栏的展开与折叠 -->
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <!-- 面包屑导航组件，显示当前页面的层级路径 -->
    <breadcrumb class="breadcrumb-container" />

    <!-- 右侧菜单区域，包含用户信息和操作选项 -->
    <div class="right-menu">
      <!-- 用户头像下拉菜单，点击触发 -->
      <el-dropdown class="avatar-container" trigger="click">
        <!-- 头像包装器 -->
        <div class="avatar-wrapper">
          <!-- 用户头像，使用Vuex中存储的avatar数据 -->
          <img v-if="avatar" :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <span v-else class ="realName-avatar">{{ realName?.charAt(0)}}</span>
          <!-- 在头像左侧显示用户名 -->
          <span class="realName">{{ realName }}</span>

          <!-- 下拉箭头图标 -->
          <i class="el-icon-caret-bottom" />
        </div>
        <!-- 下拉菜单内容 -->
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- 首页链接 -->
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <!-- Github项目链接 -->
          <a target="_blank" href="https://github.com/XB811/emr-web">
            <el-dropdown-item>项目地址</el-dropdown-item>
          </a>
          <!-- 修改密码 -->
          <a target="_blank" @click.prevent="updatePasswordDialog">
            <el-dropdown-item>修改密码</el-dropdown-item>
          </a>
          <!-- 退出登录选项 -->
          <el-dropdown-item  @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
<!--    放置dialog-->
<!--    sync可以接受子组件的传值，修改showDialog的值-->
    <el-dialog @close="btnCancel" width="500px" title="修改密码" :visible.sync="showDialog" append-to-body="true">
      <el-form ref="passForm" label-width="120px" :model="passForm" :rules="rules">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passForm.oldPassword" show-password size="small" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passForm.newPassword" show-password size="small" />
        </el-form-item>
        <el-form-item label="重复密码" prop="confirmPassword">
          <el-input v-model="passForm.confirmPassword" show-password size="small" />
        </el-form-item>
        <el-form-item>
          <el-button @click="btnOK" size="mini" type="primary" >确认修改</el-button>
          <el-button @click="btnCancel" size="mini" >取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
// 导入Vuex的mapGetters辅助函数，用于将store中的getter映射到组件计算属性
import { mapGetters } from 'vuex'
// 导入面包屑导航组件，显示页面层级
import Breadcrumb from '@/components/Breadcrumb'
// 导入汉堡菜单组件，控制侧边栏
import Hamburger from '@/components/Hamburger'
import {updatePassword} from "@/api/user";
import {validPassword} from "@/utils/validate";

export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      // 密码长度校验
      if (!validPassword(value)) {
        callback(new Error('新密码的长度为6-16位之间'))
      } else {
        callback()
      }
    }
    return  {
      passForm: {
        oldPassword: '', // 旧密码
        newPassword: '', // 新密码
        confirmPassword: '' // 确认密码字段
      },
      rules: {
        oldPassword: [{required: true, message: '旧密码不能为空', trigger: 'blur'}], // 旧密码
        newPassword: [{required: true, message: '新密码不能为空', trigger: 'blur'}, {
          trigger: 'blur',
          validator: validatePassword,
          message: '新密码的长度为6-16位之间,包含字母数字特殊字符'
        }], // 新密码
        confirmPassword: [{required: true, message: '重复密码不能为空', trigger: 'blur'}, {
          trigger: 'blur',
          validator: (rule, value, callback) => {
            // value
            if (this.passForm.newPassword === value) {
              callback()
            } else {
              callback(new Error('重复密码和新密码输入不一致'))
            }
          }
        }] // 确认密码字段
      },
      showDialog: false // 是否显示弹层
    }
  },
  // 注册要使用的组件
  components: {
    Breadcrumb, // 面包屑导航组件
    Hamburger   // 汉堡菜单组件
  },
  // 计算属性
  computed: {
    // 使用mapGetters从store中获取状态
    ...mapGetters([
      'sidebar', // 侧边栏状态（是否展开）
      'avatar',   // 用户头像URL
      'realName' // 当前登录用户的用户名
    ])
  },
  // 组件方法
  methods: {
    // 切换侧边栏展开/收起状态
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 退出登录方法
    async logout() {
      // 调用store中的logout action
      await this.$store.dispatch('user/logout')
      // 退出后重定向到登录页，并保存当前路径用于登录后跳转回来
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      // 多用户场景，不同role的可访问权限不同，重定向可能够会发生无权访问404的现象，退出登录后不重定向回来
      this.$router.push(`/login`)
    },
    updatePasswordDialog() {
      this.showDialog = true
    },
    // 确定
    btnOK() {
      this.$refs.passForm.validate(async isOK => {
        if (isOK) {
          // 调用接口
          await updatePassword(this.passForm,this.$store.getters.userType)
          this.$message.success('修改密码成功')
          this.btnCancel()
        }
      })
    },
    btnCancel() {
      this.$refs.passForm.resetFields() // 重置表单
      // 关闭弹层
      this.showDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;           /* 导航栏高度 */
  overflow: hidden;       /* 隐藏溢出内容 */
  position: relative;     /* 相对定位 */
  background: #fff;       /* 白色背景 */
  box-shadow: 0 1px 4px rgba(0,21,41,.08); /* 底部阴影效果 */

  .hamburger-container {
    line-height: 46px;    /* 行高 */
    height: 100%;         /* 占满父元素高度 */
    float: left;          /* 左浮动 */
    cursor: pointer;      /* 鼠标指针形状为手型 */
    transition: background .3s; /* 背景颜色过渡效果 */
    -webkit-tap-highlight-color:transparent; /* 移动端触摸时无高亮 */

    &:hover {
      background: rgba(0, 0, 0, .025) /* 悬停时的背景色 */
    }
  }

  .breadcrumb-container {
    float: left;          /* 左浮动 */
  }

  .right-menu {
    float: right;         /* 右浮动 */
    height: 100%;         /* 占满父元素高度 */
    line-height: 50px;    /* 行高 */

    &:focus {
      outline: none;      /* 取消焦点轮廓 */
    }

    .right-menu-item {
      display: inline-block; /* 行内块元素 */
      padding: 0 8px;     /* 内边距 */
      height: 100%;       /* 占满父元素高度 */
      font-size: 18px;    /* 字体大小 */
      color: #5a5e66;     /* 字体颜色 */
      vertical-align: text-bottom; /* 垂直对齐方式 */

      &.hover-effect {
        cursor: pointer;  /* 鼠标指针形状为手型 */
        transition: background .3s; /* 背景颜色过渡效果 */

        &:hover {
          background: rgba(0, 0, 0, .025) /* 悬停时的背景色 */
        }
      }
    }

    .avatar-container {
      margin-right: 30px; /* 右边距 */

      .avatar-wrapper {
        margin-top: 5px;  /* 顶部边距 */
        position: relative; /* 相对定位 */
        .realName {
          margin-right: 15px; /* 调整与头像的间距 */
          font-size: 16px; /* 增大字体大小 */
          font-weight: bold; /* 加粗字体 */
          color: #4a4a4a; /* 使用更柔和的深灰色 */
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* 添加轻微的文字阴影 */
        }

        .user-avatar {
          cursor: pointer; /* 鼠标指针形状为手型 */
          width: 40px;     /* 头像宽度 */
          height: 40px;    /* 头像高度 */
          border-radius: 10px; /* 圆角边框 */
        }
        .realName-avatar {
          width: 40px; /* 与user-avatar保持一致 */
          height: 40px;
          display: inline-flex; /* 使用flex布局更好地居中 */
          align-items: center;
          justify-content: center;
          border-radius: 50%; /* 标准圆形 */
          background: linear-gradient(135deg, #04c9be, #02a8f3); /* 更现代的渐变色 */
          color: #fff;
          font-size: 16px; /* 适合的字体大小 */
          font-weight: 500; /* 适当的字体粗细 */
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15); /* 精细的阴影 */
          transition: all 0.3s ease; /* 添加过渡效果 */

          &:hover {
            transform: translateY(-2px); /* 悬停时轻微上浮 */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 悬停时增强阴影 */
          }
        }

        .el-icon-caret-bottom {
          cursor: pointer; /* 鼠标指针形状为手型 */
          position: absolute; /* 绝对定位 */
          right: -20px;    /* 右侧偏移 */
          top: 25px;       /* 顶部偏移 */
          font-size: 12px; /* 字体大小 */
        }
      }
    }
  }
}
</style>

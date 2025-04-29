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
              Home
            </el-dropdown-item>
          </router-link>
          <!-- Github项目链接 -->
          <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <!-- 文档链接 -->
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a>
          <!-- 退出登录选项，带有分隔线 -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
// 导入Vuex的mapGetters辅助函数，用于将store中的getter映射到组件计算属性
import { mapGetters } from 'vuex'
// 导入面包屑导航组件，显示页面层级
import Breadcrumb from '@/components/Breadcrumb'
// 导入汉堡菜单组件，控制侧边栏
import Hamburger from '@/components/Hamburger'

export default {
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
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
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

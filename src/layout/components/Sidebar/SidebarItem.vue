<!--递归渲染菜单结构：通过递归自身来构建多级嵌套的菜单树
智能处理路由显示逻辑：根据路由配置自动判断单个子路由和多子路由的不同显示方式
路径解析：正确处理菜单项的路径，包括外部链接和内部路由-->
<template>
  <!-- 当菜单项不隐藏时才显示 -->
  <div v-if="!item.hidden">
    <!-- 情况1：当只有一个要显示的子菜单项，并且该子项没有子级或子级都隐藏，且父级未设置alwaysShow属性时 -->
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <!-- 通过app-link组件渲染链接，仅当子项有meta属性时才渲染 -->
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <!-- 使用Item组件渲染图标和标题 -->
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <!-- 情况2：当有多个子菜单项或设置了alwaysShow属性时，使用el-submenu渲染可展开的子菜单 -->
    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <!-- 子菜单的标题部分 -->
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <!-- 递归渲染子菜单项 -->
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path' // 导入path模块，用于路径解析
import { isExternal } from '@/utils/validate' // 导入外部链接验证函数
import Item from './Item' // 导入菜单项图标和标题组件
import AppLink from './Link' // 导入链接组件，负责处理内部/外部链接
import FixiOSBug from './FixiOSBug' // 导入修复iOS菜单点击bug的mixin

export default {
  name: 'SidebarItem', // 组件名称
  components: { Item, AppLink }, // 注册子组件
  mixins: [FixiOSBug], // 使用mixin修复iOS点击bug
  props: {
    // 菜单项数据对象
    item: {
      type: Object,
      required: true
    },
    // 是否为嵌套菜单
    isNest: {
      type: Boolean,
      default: false
    },
    // 基础路径，用于构建完整路径
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // 修复 https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: 使用render函数重构
    this.onlyOneChild = null // 存储唯一的显示子项
    return {}
  },
  methods: {
    /**
     * 判断是否只有一个需要显示的子菜单项
     * @param {Array} children - 子菜单数组
     * @param {Object} parent - 父菜单对象
     * @returns {Boolean} - 是否只有一个显示的子菜单
     */
    hasOneShowingChild(children = [], parent) {
      // 过滤出所有不隐藏的子菜单项
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // 临时设置唯一子项(当只有一个显示的子项时使用)
          this.onlyOneChild = item
          return true
        }
      })

      // 当只有一个子路由时，默认显示该子路由
      if (showingChildren.length === 1) {
        return true
      }

      // 当没有可显示的子路由时，显示父路由本身
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },

    /**
     * 解析路径，处理相对路径、绝对路径和外部链接
     * @param {String} routePath - 路由路径
     * @returns {String} - 解析后的完整路径
     */
    resolvePath(routePath) {
      // 如果是外部链接，直接返回
      if (isExternal(routePath)) {
        return routePath
      }
      // 如果基础路径是外部链接，返回基础路径
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      // 解析相对路径，合并基础路径和路由路径
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>

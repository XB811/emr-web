<!--这个组件在整体布局的上边顶栏的最左侧
负责控制侧边栏的弹出和关闭-->
<template>
  <!-- 汉堡菜单容器，设置内边距并绑定点击事件 -->
  <div style="padding: 0 15px;" @click="toggleClick">
    <!--
      SVG 图标作为汉堡菜单
      :class - 根据 isActive 属性动态添加 'is-active' 类
      viewBox - 定义 SVG 视口的坐标系统
      width/height - 设置 SVG 图标大小
    -->
    <svg
      :class="{'is-active':isActive}"
      class="hamburger"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <!-- SVG 路径定义汉堡菜单图标的形状 -->
      <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Hamburger', // 组件名称
  props: {
    // 组件属性定义
    isActive: {
      type: Boolean, // 类型为布尔值
      default: false // 默认值为 false，表示初始状态为未激活
    }
  },
  methods: {
    // 切换点击事件处理方法
    toggleClick() {
      // 触发父组件的 toggleClick 事件，用于控制侧边栏的展开/收起
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped>
/* 汉堡菜单图标的基本样式 */
.hamburger {
  display: inline-block; /* 行内块级元素 */
  vertical-align: middle; /* 垂直居中对齐 */
  width: 20px; /* 设置宽度 */
  height: 20px; /* 设置高度 */
}

/* 激活状态下的样式：旋转 180 度，实现动画效果 */
.hamburger.is-active {
  transform: rotate(180deg);
}
</style>

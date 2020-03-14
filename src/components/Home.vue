<template>
  <el-container class="home-container">
    <!--头部区-->
    <el-header>
      <div>
        <img src="../assets/logo1.png" alt="">
        <span>Z X L管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主题区-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">| | |</div>
        <!--侧边栏-->
        <el-menu background-color="#333744" text-color="#fff"
          active-text-color="#409EFF" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false"
        :router="true" :default-active="activePath">
          <!--一级菜单-->
          <el-submenu v-for="item in menulist" :key="item.id" :index="item.id + ''">
            <!--一级菜单的模板去-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
            @click="saveNavState('/' + subItem.path)">
              <template slot="title">
              <!--图标-->
              <i class="el-icon-menu"></i>
              <!--文本-->
              <span>{{subItem.authName}}</span>
             </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主题-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 被激活链接的地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
.el-header{
  background-color: #373D41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #fff;
  font-size: 25px;
  > div {
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    };
  }
}
  .el-aside{
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main{
    background-color: #EAEDF1;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    cursor: pointer;
  }
</style>

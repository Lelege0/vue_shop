import Vue from 'vue'
import VueRouter from 'vue-router'
// eslint-disable-next-line no-unused-vars
import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)

// eslint-disable-next-line no-unused-vars
const vueRouter = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航守卫
vueRouter.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从哪个路径跳转过来
  // next是一个函数，放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default vueRouter

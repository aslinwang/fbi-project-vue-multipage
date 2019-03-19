import City from 'views/City'
import Home from 'views/Home'
import Login from 'views/Login'
import Post from 'views/Post'
import Posts from 'views/Posts'
import Router from 'vue-router'
import Vue from 'vue'

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  linkActiveClass: 'main-nav-active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/posts',
      name: 'posts',
      component: Posts
    },
    {
      path: '/posts/:id',
      name: 'post',
      component: Post
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/city',
      name: 'city',
      component: City
    },
    {
      path: '/private',
      name: 'private',
      component: {
        template: '<div>Private content.</div>'
      },
      meta: { requiresAuth: true }
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // const isLoggedIn = auth.loggedIn()
    const isLoggedIn = false

    if (!isLoggedIn) {
      router.push({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  console.info(`${new Date().toLocaleString()}: ${to.path}`)
})

export default router
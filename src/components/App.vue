<template>
  <div id="app">
    <main-nav></main-nav>
    <router-view></router-view>
  </div>
</template>

<script>
  import MainNav from 'components/common/nav'

  export default {
    components: {
      MainNav
    }
  }
</script>
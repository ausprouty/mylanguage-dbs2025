

<script>

export default {
 name: 'RestorePage',
 created(){
    var previousPage = localStorage.getItem('currentPath', '/index');
    if (previousPage = '/'){
      previousPage = '/index'
    }
    this.$router.push(previousPage );
  },
}
</script>
<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

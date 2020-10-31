<template>
  <div>Error not found!</div>
</template>

<script>
export default {
  name: 'NotFound',

  created() {
    document.title = this.$options.name + ' | ' + this.$documentTitle;
  }
};
</script>

<style></style>

<template>
    <img
      src="~/assets/images/ivy-gear_64x64.png"
      :width="size"
      :height="size"
      :alt="alt || 'IvyGear Icon'"
      class="ivy-gear-icon"
    />
  </template>
  
  <script setup>
  defineProps({
    size: {
      type: [String, Number],
      default: 64,
    },
    alt: {
      type: String,
      default: '',
    },
  })
  </script>
  
  <style scoped>
  .ivy-gear-icon {
    margin-right: 1rem;
    display: inline-block;
    vertical-align: middle;
  }
  </style>
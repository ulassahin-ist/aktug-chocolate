<template>
  <div>
    <h2>Menu</h2>
    <div v-for="item in menu" :key="item.id">
      <img :src="item.image" width="120" />
      <h3>{{ item.name }}</h3>
      <p>{{ item.price }}₺</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const menu = ref([
  { id: 1, name: "Chocolate Cake", price: 60, image: "/cake.jpg" },
  { id: 2, name: "Macaron", price: 25, image: "/macaron.jpg" },
]);
</script>

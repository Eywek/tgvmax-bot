<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="flex justify-between items-center mb-8">
      <p class="text-4xl">Bookers</p>
      <button
        type="button"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        @click="showModal"
      >
        Add a booker
      </button>
    </div>
    <div v-if="this.$store.state.bookers.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="booker in this.$store.state.bookers" v-bind:key="booker.id">
      <div class="px-6 py-4">
        <div class="text-gray-700 text-base">
          {{ booker.name }} <i>via</i> {{ booker.type }}
          <button @click="deleteBooker(booker)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <ModalBooker
      v-show="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>

import ModalBooker from './ModalBooker.vue'

export default {
  name: "ListBookers",
  components: {
    ModalBooker
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    async deleteBooker (booker) {
      await fetch(`${process.env.API_URL}/bookers/${booker.id}`, { method: 'DELETE' })
      const index = this.$store.state.bookers.findIndex(n => n.id === booker.id)
      this.$store.state.bookers.splice(index, 1)
    },
    showModal() {
      this.isModalVisible = true
    },
    closeModal() {
      this.isModalVisible = false
    }
  }
}
</script>

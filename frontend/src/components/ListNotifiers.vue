<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="flex justify-between items-center mb-8">
      <p class="text-4xl">Notifiers</p>
      <button
        type="button"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        @click="showModal"
      >
        Add a notifier
      </button>
    </div>
    <div v-if="this.$store.state.notifiers.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="notifier in this.$store.state.notifiers" v-bind:key="notifier.id">
      <div class="px-6 py-4">
        <div class="text-gray-700 text-base">
          {{ notifier.name }} <i>via</i> {{ notifier.type }}
          <button @click="deleteNotifier(notifier)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <ModalNotifier
      v-show="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>
import ModalNotifier from './ModalNotifier.vue'

export default {
  name: "ListNotifiers",
  components: {
    ModalNotifier,
  },
  data() {
    return {
      isModalVisible: false,
    }
  },
  methods: {
    async deleteNotifier (notifier) {
      await fetch(`${process.env.API_URL}/notifiers/${notifier.id}`, { method: 'DELETE' })
      const index = this.$store.state.notifiers.findIndex(n => n.id === notifier.id)
      this.$store.state.notifiers.splice(index, 1)
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

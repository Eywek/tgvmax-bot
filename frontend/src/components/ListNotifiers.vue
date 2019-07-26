<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <p class="text-4xl mb-8">Notifiers</p>
    <div v-if="this.$store.state.notifiers.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="notifier in this.$store.state.notifiers">
      <div class="px-6 py-4">
        <div class="text-gray-700 text-base">
          {{ notifier.name }} <i>via</i> {{ notifier.type }}
          <button @click="deleteNotifier(notifier)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListNotifiers",
  methods: {
    async deleteNotifier (notifier) {
      await fetch(`${process.env.API_URL}/notifiers/${notifier.id}`, { method: 'DELETE' })
      const index = this.$store.state.notifiers.findIndex(n => n.id === notifier.id)
      this.$store.state.notifiers.splice(index, 1)
    }
  }
}
</script>

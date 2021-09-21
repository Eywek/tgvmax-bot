<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <p class="text-4xl mb-8">Bookers</p>
    <div v-if="this.$store.state.bookers.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="booker in this.$store.state.bookers">
      <div class="px-6 py-4">
        <div class="text-gray-700 text-base">
          {{ booker.name }} <i>via</i> {{ booker.type }}
          <button @click="deleteBooker(booker)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListBookers",
  methods: {
    async deleteBooker (booker) {
      await fetch(`${process.env.API_URL}/bookers/${booker.id}`, { method: 'DELETE' })
      const index = this.$store.state.bookers.findIndex(n => n.id === booker.id)
      this.$store.state.bookers.splice(index, 1)
    }
  }
}
</script>

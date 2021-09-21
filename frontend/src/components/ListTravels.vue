<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <p class="text-4xl mb-8">Travels</p>
    <div v-if="this.$store.state.travels.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="travel in this.$store.state.travels">
      <div class="px-6 py-4">
        <div class="font-bold text-xl">
          {{ travel.from }} → {{ travel.to }}
          <div class="text-gray-500 float-right text-base font-normal">
            {{ new Date(travel.date).toISOString().split('T')[0] }}
            <span v-if="travel.minHour"><span v-if="!travel.maxHour">></span>{{ travel.minHour }}h</span><span v-if="travel.minHour && travel.maxHour">-</span><span v-if="travel.maxHour"><span v-if="!travel.minHour"><</span>{{ travel.maxHour }}h</span>
          </div>
        </div>
        <p v-if="travel.book" class="text-gray-700 text-base">
          Le train sera réservé avec {{ travel.booker.type }} ({{ travel.booker.name }})
        </p>
        <p class="text-gray-700 text-base">
          Vous serez notifié via {{ travel.notifier.type }} ({{ travel.notifier.name }})
        </p>
      </div>
      <div class="px-6 pb-4">
        <button @click="deleteTravel(travel)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
        <div class="clearfix"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListTravels",
  methods: {
    async deleteTravel (travel) {
      await fetch(`${process.env.API_URL}/travels/${travel.id}`, { method: 'DELETE' })
      const index = this.$store.state.travels.findIndex(t => t.id === travel.id)
      this.$store.state.travels.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="flex justify-between items-center mb-8">
      <p class="text-4xl">Travels</p>
      <button
        type="button"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        @click="showModal"
      >
        Add a travel
      </button>
    </div>
    <div v-if="this.$store.state.travels.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="travel in this.$store.state.travels" v-bind:key="travel.id">
      <div class="px-6 py-4">
        <div class="font-bold text-xl">
          {{ travel.from }} → {{ travel.to }}
          <div class="text-gray-500 float-right text-base font-normal">
            {{ new Intl.DateTimeFormat('sv', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(travel.date)) }}
            <span v-if="travel.minHour">
              <span v-if="!travel.maxHour">≥</span>
              {{ travel.minHour }}h<span v-if="travel.minMinute">{{ travel.minMinute }}</span>
            </span>
            <span v-if="travel.minHour && travel.maxHour">-</span>
            <span v-if="travel.maxHour">
              <span v-if="!travel.minHour">≤</span>
              {{ travel.maxHour }}h<span v-if="travel.maxMinute">{{ travel.maxMinute }}</span>
            </span>
          </div>
        </div>
        <p class="text-gray-700 text-base" v-if="!travel.booked">
          Le train sera vérifié <span v-if="travel.book">et reservé </span>avec {{ travel.booker.type }} ({{ travel.booker.name }})
        </p>
        <p class="text-gray-700 text-base" v-if="travel.booked">
          Le train a été reservé avec {{ travel.booker.type }} ({{ travel.booker.name }})
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

    <ModalTravel
      v-show="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>

import ModalTravel from './ModalTravel.vue'

export default {
  name: "ListTravels",
  components: {
    ModalTravel
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    async deleteTravel (travel) {
      if (travel.cron && !confirm(`Ce travel appartient a une Cron, il ne sera pas recréé s'il est supprimé. Etes-vous sur?`)) {
        return
      }
      await fetch(`${process.env.API_URL}/travels/${travel.id}`, { method: 'DELETE' })
      const index = this.$store.state.travels.findIndex(t => t.id === travel.id)
      this.$store.state.travels.splice(index, 1)
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

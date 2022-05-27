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

    <div class="flex flex-col" v-if="this.$store.state.travels.length > 0">
      <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-4 inline-block min-w-full sm:px-6 lg:px-8">
          <div class="overflow-hidden">
            <table class="min-w-full text-center">
              <thead class="border-b bg-gray-200">
                <tr>
                  <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                    Qui
                  </th>
                  <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                    Trajet
                  </th>
                  <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="bg-white border-b"
                  v-for="travel in this.$store.state.travels" v-bind:key="travel.id"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span v-if="travel.book" class="font-medium">{{ travel.booker.name }}</span>
                    <span v-if="!travel.book" class="font-medium">{{ travel.notifier.name }}</span>
                    <span class="font-light">
                      via <span class="italic">{{ travel.notifier.type }}</span>
                      <span v-if="travel.book">& <span class="italic">{{ travel.booker.type }}</span></span>
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-medium">{{ travel.fromFormatted }}</span> → <span class="font-medium">{{ travel.toFormatted }}</span><br>
                    <span class="font-light">
                      {{ travel.departureDate }}
                      <span v-if="travel.minHour && !travel.maxHour">
                        après {{ travel.minHour }}h<span v-if="travel.minMinute">{{ travel.minMinute }}</span>
                      </span>
                      <span v-if="!travel.minHour && travel.maxHour">
                        avant {{ travel.maxHour }}h<span v-if="travel.maxMinute">{{ travel.maxMinute }}</span>
                      </span>
                      <span v-if="travel.minHour && travel.maxHour">
                        entre
                        {{ travel.minHour }}h<span v-if="travel.minMinute">{{ travel.minMinute }}</span>
                        et
                        {{ travel.maxHour }}h<span v-if="travel.maxMinute">{{ travel.maxMinute }}</span>
                      </span>
                    </span>
                  </td>
                  <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap flex justify-center items-center">
                    <button @click="deleteTravel(travel)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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

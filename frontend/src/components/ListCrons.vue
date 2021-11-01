<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="flex justify-between items-center mb-8">
      <p class="text-4xl">Crons</p>
      <button
        type="button"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        @click="showModal"
      >
        Add a cron
      </button>
    </div>
    <div v-if="this.$store.state.crons.length === 0" class="flex justify-center items-center">
      <img src="../assets/benoit.png" class="rounded-full">
    </div>
    <div class="rounded overflow-hidden border-r border-b border-l border-t border-gray-400 mb-4" v-for="cron in this.$store.state.crons" v-bind:key="cron.id">
      <div class="px-6 py-4">
        <div class="font-bold text-xl">
          {{ cron.from }} → {{ cron.to }}
          <div class="text-gray-500 float-right text-base font-normal">
            <span>{{ cron.cron }}</span>
            <span v-if="cron.minHour"><span v-if="!cron.maxHour">></span>{{ cron.minHour }}h</span><span v-if="cron.minHour && cron.maxHour">-</span><span v-if="cron.maxHour"><span v-if="!cron.minHour"></span>{{ cron.maxHour }}h</span>
          </div>
        </div>
        <p class="text-gray-700 text-base">
          Le train sera vérifié <span v-if="cron.book">et reservé </span>avec {{ cron.booker.type }} ({{ cron.booker.name }})
        </p>
        <p class="text-gray-700 text-base">
          Vous serez notifié via {{ cron.notifier.type }} ({{ cron.notifier.name }})
        </p>
      </div>
      <div class="px-6 pb-4">
        <button @click="deleteCron(cron)" class="inline-block bg-red-700 rounded-full px-3 py-1 text-sm text-white mr-2 float-right">Supprimer</button>
        <div class="clearfix"></div>
      </div>
    </div>

    <ModalCron
      v-show="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>

import ModalCron from './ModalCron.vue'

export default {
  name: "ListCrons",
  components: {
    ModalCron
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    async deleteCron (cron) {
      await fetch(`${process.env.API_URL}/crons/${cron.id}`, { method: 'DELETE' })
      const index = this.$store.state.crons.findIndex(t => t.id === cron.id)
      this.$store.state.crons.splice(index, 1)
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

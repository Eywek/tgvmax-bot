<template>
  <Modal
    @close="close"
  >
    <template v-slot:header>
      Add a travel
    </template>

    <template v-slot:body>
      <form>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="from">Gare de départ</label>
          <autocomplete
            :source="autocompleteEndpoint"
            results-property="items"
            placeholder="From"
            :results-display="autocompleteSelected('from')"
            :resultsFormatter="formatAutocomplete"
            inputClass="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none">
          </autocomplete>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="to">Gare d'arrivée</label>
          <autocomplete
            :source="autocompleteEndpoint"
            results-property="items"
            placeholder="To"
            :results-display="autocompleteSelected('to')"
            :resultsFormatter="formatAutocomplete"
            inputClass="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none">
          </autocomplete>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="date">Date</label>
          <v-date-picker
            v-model='date'
            :input-props='{
              class: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none",
              placeholder: "Date"
            }'
          />
        </div>
        <div class="flex mb-4">
          <div class="w-1/2 pr-2">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="minHour">Heure minimum</label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                id="minHour"
                type="text"
                placeholder="Optionnal"
                v-model="minHour"
              />
            </div>
          </div>
          <div class="w-1/2 pl-2">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="minMinute">Minute minimum</label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                id="minMinute"
                type="text"
                placeholder="Optionnal"
                v-model="minMinute"
              />
            </div>
          </div>
        </div>
        <div class="flex mb-4">
          <div class="w-1/2 pr-2">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="maxHour">Heure maximum</label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                id="maxHour"
                type="text"
                placeholder="Optionnal"
                v-model="maxHour"
              />
            </div>
          </div>
          <div class="w-1/2 pl-2">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="maxMinute">Minute maximum</label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                id="maxMinute"
                type="text"
                placeholder="Optionnal"
                v-model="maxMinute"
              />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="booker">Booker</label>
          <select
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="booker"
            type="text"
            v-model="booker"
          >
            <option disabled value="">Select a booker</option>
            <option v-for="booker in bookers" v-bind:key="booker.id" v-bind:value="booker.id">
              {{ booker.name }} ({{ booker.type }})
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="book">Reservation automatique</label>
          <input
            class="form-checkbox leading-tight focus:outline-none"
            id="book"
            type="checkbox"
            v-model="book"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="notifier">Notifier</label>
          <select
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="notifier"
            type="text"
            v-model="notifier"
          >
            <option disabled value="">Select a notifier</option>
            <option v-for="notifier in notifiers" v-bind:key="notifier.id" v-bind:value="notifier.id">
              {{ notifier.name }}
            </option>
          </select>
        </div>
      </form>
    </template>

    <template v-slot:footer>
      <button class="px-4 bg-transparent p-3 rounded text-blue-500 hover:bg-gray-100 hover:text-blue-700 mr-2" @click="close">Cancel</button>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        type="button"
        v-on:click="submitTravel"
      >Lancer la recherche</button>
    </template>
  </Modal>
</template>

<script>
import Autocomplete from 'vuejs-auto-complete'
import Modal from './Modal.vue'
import store from '../store'

export default {
  name: 'App',
  components: {
    Autocomplete,
    Modal,
  },
  data() {
    return {
      from: null,
      to: null,
      date: new Date(),
      minHour: null,
      minMinute: null,
      maxHour: null,
      maxMinute: null,
      notifier: null,
      booker: null,
      book: true,
      autocompleteEndpoint: `${process.env.API_URL}/stations/autocomplete?searchTerm=`
    }
  },
  computed: {
    bookers() { return store.state.bookers },
    notifiers() { return store.state.notifiers },
  },
  methods: {
    formatAutocomplete (results) {
      return results.map(r => ({ label: r.name, id: r.id }))
    },
    autocompleteSelected (key) {
      return (value) => {
        this[key] = value.id
        return value.label
      }
    },
    async submitTravel () {
      const res = await fetch(`${process.env.API_URL}/travels`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.from,
          to: this.to,
          date: this.date.toISOString().split('T')[0],
          minHour: parseInt(this.minHour),
          minMinute: parseInt(this.minMinute),
          maxHour: parseInt(this.maxHour),
          maxMinute: parseInt(this.maxMinute),
          notifier: this.notifier,
          booker: this.booker,
          book: this.book
        })
      })
      this.$store.state.travels.push(await res.json())
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style>
.autocomplete .autocomplete__inputs {
  padding: 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.autocomplete .autocomplete__icon {
  display: none
}
.autocomplete .autocomplete__box {
  background: transparent;
  border: 0;
  padding: 0;
}
</style>
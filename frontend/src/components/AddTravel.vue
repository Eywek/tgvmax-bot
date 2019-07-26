<template>
  <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
        <option v-for="notifier in this.$store.state.notifiers" v-bind:value="notifier.id">
          {{ notifier.name }}
        </option>
      </select>
    </div>

    <div class="text-center">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        type="button"
        v-on:click="submitTravel"
      >Lancer la recherche</button>
    </div>
  </form>
</template>

<script>
import Autocomplete from 'vuejs-auto-complete'

export default {
  name: "AddTravel",
  components: {
    Autocomplete
  },
  data() {
    return {
      from: null,
      to: null,
      date: new Date(),
      minHour: null,
      maxHour: null,
      notifier: null,
      autocompleteEndpoint: `${process.env.API_URL}/stations/autocomplete?uc=fr-FR&searchField=origin&searchTerm=`
    }
  },
  async mounted() {
    const res = await fetch(`${process.env.API_URL}/notifiers`)
    this.$store.state.notifiers = await res.json()
  },
  methods: {
    formatAutocomplete (results) {
      return results.filter((result) => {
        return result.category === 'station' && (result.type === 'G' || result.type === 'L')
      })
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
          date: new Date(this.date.toDateString() + ' UTC'),
          minHour: this.minHour,
          maxHour: this.maxHour,
          notifier: this.notifier
        })
      })
      this.$store.state.travels.push(await res.json())
    }
  }
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

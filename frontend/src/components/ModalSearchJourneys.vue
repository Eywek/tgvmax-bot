<template>
  <Modal
    @close="close"
  >
    <template v-slot:header>
      Search journeys
    </template>

    <template v-slot:body>
      <div v-if="loading">
        <svg role="status" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"></path>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="rgb(66, 153, 225)"></path>
        </svg>
      </div>

      <div v-if="!loading && journeys !== null && journeys.length === 0">
        <p>Sorry, we found nothing!</p>
      </div>

      <div v-if="!loading && journeys !== null && journeys.length >= 1">
        <table class="table-auto w-full mb-4">
          <tbody class="">
            <tr v-for="journey in journeys" v-bind:key="journey.book.folderId" class="p-4">
              <td
                class="rounded cursor-pointer hover:bg-gray-200"
                v-on:click="book(journey)"
                :disabled="loading"
              >
                <p class="m-2">
                  <b>{{ journey.fromFormatted }}</b> ➜ <b>{{ journey.toFormatted }}</b><br />
                  {{ journey.formattedDepartureDate }} → {{ journey.formattedArrivalDate }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>

      <form v-if="!loading && journeys === null">
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
              class: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none z-10",
              placeholder: "Date"
            }'
          />
        </div>
      </form>
    </template>

    <template v-slot:footer>
      <button class="px-4 bg-transparent p-3 rounded text-blue-500 hover:bg-gray-100 hover:text-blue-700 mr-2" @click="close">Cancel</button>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
        type="button"
        v-on:click="search"
        :disabled="loading"
      >Search</button>
    </template>
  </Modal>
</template>

<script>
  import Autocomplete from 'vuejs-auto-complete'
  import Modal from './Modal.vue'

  export default {
    name: 'ModalSearchTravels',
    props: [ 'bookerId' ],
    components: {
      Autocomplete,
      Modal,
    },
    data() {
      return {
        from: null,
        to: null,
        loading: false,
        journeys: null,
        date: new Date(),
        autocompleteEndpoint: `${process.env.API_URL}/stations/autocomplete?searchTerm=`
      }
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
      async search () {
        this.loading = true
        this.journeys = null
        const result = await fetch(
          `${process.env.API_URL}/travels/journeys?${new URLSearchParams({
            from: this.from,
            to: this.to,
            date: this.date.toLocaleDateString('sv'),
            bookerId: this.bookerId,
          })}
          `
        )
        this.loading = false
        this.journeys = await result.json()
      },
      async book (journey) {
        if (!confirm('Are you sure to book this journey?')) {
          return
        }

        this.loading = true
        const res = await fetch(`${process.env.API_URL}/travels/journeys/book`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookerId: this.bookerId,
            segmentIds: journey.book.segmentIds,
            folderId: journey.book.folderId,
            searchId: journey.book.searchId,
          })
        })
        this.loading = false

        if (!res.ok) {
          alert('Sorry, we could not book this journey. Please try again later.')
          return
        }

        alert('Journey booked!')
        this.close()
      },
      close() {
        this.$emit('close');
        setTimeout(() => {
          this.from = null
          this.to = null
          this.date = new Date()
          this.journeys = null
        }, 500);
      },
    },
  };
</script>
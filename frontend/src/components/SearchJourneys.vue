<template>
  <div class="flex flex-wrap mb-4">
    <div class="w-full md:w-1/3 p-0 md:p-10 md:pr-5">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
            <label class="block text-gray-700 text-sm font-bold mb-2" for="date">Date minimum</label>
            <v-date-picker
              v-model='date'
              :input-props='{
                class: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none z-10",
                placeholder: "Date"
              }'
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="date">Date maximum</label>
            <v-date-picker
              v-model='untilDate'
              :input-props='{
                class: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none z-10",
                placeholder: "Date"
              }'
            />
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
              <option v-for="booker in this.$store.state.bookers" v-bind:key="booker.id" v-bind:value="booker.id">
                {{ booker.name }} ({{ booker.type }})
              </option>
            </select>
          </div>
        </form>

        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
          type="button"
          v-on:click="search"
          :disabled="loading"
        >Search</button>
      </div>
    </div>

    <div class="w-full md:w-2/3 p-0 md:p-10 md:pl-5">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="flex flex-col">
          <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-4 inline-block min-w-full sm:px-6 lg:px-8">
              <div class="overflow-hidden">
                <table class="min-w-full text-center">
                  <thead class="border-b bg-gray-200">
                    <tr>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                        Départ
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                        Arrivée
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="bg-white border-b" v-if="journeys === null">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        Lancer la recherche pour voir les trains disponibles.
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                    <tr class="bg-white border-b" v-if="!loading && journeys !== null && journeys.length === 0">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        Nous n'avons trouvé aucun trains
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                    <tr
                      class="bg-white border-b"
                      v-if="journeys !== null && journeys.length > 0"
                      v-for="journey in journeys"
                      v-bind:key="journey.book.folderId"
                    >
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="font-medium">{{ journey.fromFormatted }}</span><br>
                        <span class="font-light">{{ journey.formattedDepartureDate }}</span>
                      </td>
                      <td class="text-sm px-6 py-4 whitespace-nowrap">
                        <span class="font-medium">{{ journey.toFormatted }}</span><br>
                        <span class="font-light">{{ journey.formattedArrivalDate }}</span>
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        <button
                          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                          :class="{ 'opacity-50 cursor-not-allowed': bookLoading }"
                          type="button"
                          v-on:click="book(journey)"
                          :disabled="bookLoading"
                        >Réserver</button>
                      </td>
                    </tr>
                    <tr class="bg-white border-b" v-if="loading">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex justify-center items-center">
                        <svg role="status" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"></path>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="rgb(66, 153, 225)"></path>
                        </svg>
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                        <span class="italic" v-if="lastDateSearched">Trains scannés jusqu'au {{ lastDateSearched }}</span>
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Autocomplete from 'vuejs-auto-complete'

  export default {
    name: 'SearchJourneys',
    props: [],
    components: {
      Autocomplete,
    },
    data() {
      return {
        booker: null,
        from: null,
        to: null,
        loading: false,
        journeys: null,
        lastDateSearched: null,
        bookLoading: false,
        date: new Date(),
        untilDate: new Date(),
        autocompleteEndpoint: `${process.env.API_URL}/stations/autocomplete?searchTerm=`
      }
    },
    watch: {
      date (value) {
        this.untilDate = value
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
        this.journeys = []
        this.lastDateSearched = null
        const params = {
          from: this.from,
          to: this.to,
          date: this.date.toLocaleDateString('sv'),
          bookerId: this.booker,
        }
        if (this.untilDate.toISOString() !== this.date.toISOString()) {
          params.untilDate = this.untilDate.toLocaleDateString('sv')
        }
        const result = await fetch(
          `${process.env.API_URL}/travels/journeys?${new URLSearchParams(params)}`
        )
        const decoder = new TextDecoder()
        const reader = result.body.getReader()
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const search = JSON.parse(decoder.decode(value))
          this.journeys.push(...search.trips)
          this.lastDateSearched = search.lastDate
        }
        this.loading = false
      },
      async book (journey) {
        this.bookLoading = true
        const res = await fetch(`${process.env.API_URL}/travels/journeys/book`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookerId: this.booker,
            segmentIds: journey.book.segmentIds,
            folderId: journey.book.folderId,
            searchId: journey.book.searchId,
          })
        })
        this.bookLoading = false

        if (!res.ok) {
          alert('Sorry, we could not book this journey. Please try again later.')
          return
        }

        alert('Journey booked!')
      }
    },
  };
</script>

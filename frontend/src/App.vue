<template>
  <div id="app">
    <SearchJourneys />
    <div class="flex flex-wrap mb-4">
      <div class="w-full md:w-2/3 p-0 md:p-10 md:pr-5">
        <ListTravels/>
        <ListCrons />
      </div>
      <div class="w-full md:w-1/3 p-0 md:p-10 md:pl-5">
        <ListBookers/>
        <ListNotifiers/>
      </div>
    </div>
  </div>
</template>

<script>
import ListTravels from './components/ListTravels'
import ListCrons from './components/ListCrons'
import ListBookers from './components/ListBookers'
import ListNotifiers from './components/ListNotifiers'
import SearchJourneys from './components/SearchJourneys.vue'

export default {
  name: 'App',
  components: {
    ListTravels,
    ListCrons,
    ListBookers,
    ListNotifiers,
    SearchJourneys
},
  async mounted() {
    const travels = await fetch(`${process.env.API_URL}/travels`)
    this.$store.state.travels = await travels.json()

    const crons = await fetch(`${process.env.API_URL}/crons`)
    this.$store.state.crons = await crons.json()

    const notifiers = await fetch(`${process.env.API_URL}/notifiers`)
    this.$store.state.notifiers = await notifiers.json()

    const bookers = await fetch(`${process.env.API_URL}/bookers`)
    this.$store.state.bookers = await bookers.json()
  }
}
</script>

<style>
</style>

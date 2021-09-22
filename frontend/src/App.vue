<template>
  <div id="app">
    <div class="flex flex-wrap mb-4">
      <div class="w-full md:w-1/2 p-10">
        <AddTravel/>
        <AddBooker/>
        <AddNotifier/>
      </div>
      <div class="w-full md:w-1/2 p-10">
        <ListTravels/>
        <ListBookers/>
        <ListNotifiers/>
      </div>
    </div>
  </div>
</template>

<script>
import AddTravel from './components/AddTravel'
import AddBooker from './components/AddBooker'
import AddNotifier from './components/AddNotifier'
import ListTravels from './components/ListTravels'
import ListBookers from './components/ListBookers'
import ListNotifiers from './components/ListNotifiers'

export default {
  name: 'App',
  components: {
    AddTravel,
    AddBooker,
    AddNotifier,
    ListTravels,
    ListBookers,
    ListNotifiers
  },
  async mounted() {
    const res = await fetch(`${process.env.API_URL}/travels`)
    this.$store.state.travels = await res.json()
  }
}
</script>

<style>
</style>

<template>
  <Modal
    @close="close"
  >
    <template v-slot:header>
      Add a notifier
    </template>

    <template v-slot:body>
      <form>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">Nom</label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="name"
            type="text"
            placeholder="Name"
            v-model="name"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="type">Type</label>
          <select
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="type"
            type="text"
            v-model="type"
          >
            <option disabled value="">Select a type</option>
            <option v-for="type in types" v-bind:key="type" v-bind:value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">Nom d'utilisateur du service</label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="username"
            type="text"
            placeholder="Username"
            v-model="username"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Mot de passe du service</label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
            id="password"
            type="password"
            placeholder="Password"
            v-model="password"
          />
        </div>
      </form>
    </template>

    <template v-slot:footer>
      <button class="px-4 bg-transparent p-3 rounded text-blue-500 hover:bg-gray-100 hover:text-blue-700 mr-2" @click="close">Cancel</button>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        type="button"
        v-on:click="submitNotifier"
      >Sauvegarder</button>
    </template>
  </Modal>
</template>

<script>
import Modal from './Modal.vue'

export default {
  name: 'App',
  components: {
    Modal,
  },
  data() {
    return {
      name: null,
      username: null,
      password: null,
      type: null,
      types: ['sms']
    }
  },
  methods: {
    async submitNotifier () {
      const res = await fetch(`${process.env.API_URL}/notifiers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          username: this.username,
          password: this.password,
          type: this.type
        })
      })
      this.$store.state.notifiers.push(await res.json())
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
  },
};
</script>
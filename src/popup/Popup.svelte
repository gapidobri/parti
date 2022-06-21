<script lang="ts">
  import { runtime, storage } from 'webextension-polyfill';

  let serverUrl: string = '';

  storage.local
    .get('serverUrl')
    .then((keys) => (serverUrl = keys['serverUrl']));

  function handleSave() {
    storage.local.set({ serverUrl: serverUrl });
    runtime.sendMessage({ name: 'reloadsettings', data: null });
    window.close();
  }

  let room: string = '';

  async function handleJoinRoom() {
    runtime.sendMessage({
      name: 'joinroom',
      data: room,
    });
  }

  async function handleLeaveRoom() {
    runtime.sendMessage({
      name: 'leaveroom',
      data: room,
    });
  }
</script>

<main>
  <h1>Parti 🎉</h1>

  <settings>
    <label for="url">
      Server url
      <input id="url" bind:value={serverUrl} />
    </label>

    <button id="save" on:click={handleSave}>Save</button>

    <label for="room">
      Room
      <input id="room" type="text" bind:value={room} />
    </label>
    <button on:click={handleJoinRoom}>Join room</button>
    <button on:click={handleLeaveRoom}>Leave room</button>
  </settings>
</main>

<style>
  main {
    padding: 16px;

    display: flex;
    flex-direction: column;
  }

  h1 {
    font-size: 32px;
  }

  settings {
    margin-top: 16px;

    display: flex;
    flex-direction: column;
  }

  input {
    margin-left: 8px;
    padding-left: 8px;

    border-style: solid;
    border-width: 2px;
    border-color: #00000033;
    border-radius: 8px;
  }

  #save {
    margin-left: 8px;
  }
</style>

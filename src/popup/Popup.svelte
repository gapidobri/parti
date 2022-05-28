<script lang="ts">
  import { runtime, storage } from 'webextension-polyfill';

  let serverUrl: string = '';

  storage.local
    .get('serverUrl')
    .then((keys) => (serverUrl = keys['serverUrl']));

  function handleSave() {
    storage.local.set({ serverUrl: serverUrl });
    runtime.sendMessage('reloadSettings');
    window.close();
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
  }

  #url {
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

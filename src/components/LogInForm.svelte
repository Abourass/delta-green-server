<script lang="ts">
  import Agents from '../Agents';
  import {user} from '../stores/user';
  import {password} from '../stores/user';
  import Password from './Password.svelte';
  import TextInput from './TextInput.svelte';

  export let loggedIn = false;

  const login = (event: Event) => {
    event.preventDefault();
    const records = Agents.filter((agent) => (agent.user === $user && agent.password === $password));
    if (records.length === 1) loggedIn = true;
  };
</script>

<form class="w-full mt-8 px-8 pt-10 pb-6 rounded-md flex flex-col justify-center" on:submit={login}>
  <TextInput label="User" bind:value={$user} labelClasses="mb-1" inputClasses="bg-zinc-900"/>
  <Password bind:value={$password} />
  <button
    type="submit"
    class="rounded bg-slate-700 mt-3 w-20 mx-auto text-xl border-2 border-blue-300 border-opacity-25 hover:border-delta-green"
  >Log In</button>
</form>

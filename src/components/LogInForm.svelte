<script>
  import Agents from '../Agents';
  import {user} from '../stores/user';
  import {password} from '../stores/user';
  import Password from './Password.svelte';
  import TextInput from './TextInput.svelte';

  export let loggedIn = false;

  const login = (event) => {
    event.preventDefault();
    console.log({ user: $user, password: $password })
    const records = Agents.filter((agent) => (agent.user === $user && agent.password === $password));
    if (records.length === 1) loggedIn = true;
  };
</script>

<form class="mt-8 px-8 pt-10 pb-6 rounded-md bg-gray-900 flex flex-col justify-center" on:submit={login}>
  <TextInput type="text" label="User" bind:value={$user}/>
  <Password bind:value={$password} />
  <button
    type="submit"
    class="rounded bg-gray-800 mt-3 w-20 mx-auto text-xl border-2 border-light-blue-500 border-opacity-25"
  >Log In</button>
</form>

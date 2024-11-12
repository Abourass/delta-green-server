<script>
  import Typewriter from 'svelte-typewriter';
</script>

<Typewriter cascade interval={20}>
  <br />
  <h1><span class="text-delta-green">Charles Dexter Ward (17)</span></h1>
  <p>- Still missing, no body found.</p>
  <p>- Discovered childhood home address; currently in care of Dr. Jonathan Willet at Broadmoor High Security Psychiatric Hospital, Crowthorne, Berkshire.</p>
  <p>- Believes his mother lied to him.</p>
  <p>- Suffers from delusions of grandeur; claims his grandfather’s name on his birth certificate is incorrect.</p>
  <p>- Connection to <span class="text-delta-green">Joseph Curwin</span>?</p>
  <p>- In therapy since age 13, based in Providence, Rhode Island.</p>
  <br />
  <a href="/lucy_hawthorn">Next: Lucy Hawthorn</a>
</Typewriter>

<style>
  .text-delta-green {
    color: #008000;
  }
  h1 {
    font-size: 2rem;
    font-weight: bold;
  }
  a {
    color: blue;
    text-decoration: underline;
  }
</style>

<template>
  <div id="app">
    <ul>
      <li>DPS: {{ combatData.Combatant.YOU.ENCDPS }}</li>
      <li>HPS: {{ combatData.Combatant.YOU.ENCHPS }}</li>
      <li>DURATION: {{ combatData.Combatant.YOU.duration }}</li>
    </ul>
  </div>
</template>

<script>
import OverlayAPI from '../../..';

export default {
  name: 'App',
  data() {
    return {
      overlay: null,
      combatData: {
        Combatant: {
          YOU: {
            ENCDPS: '',
            ENCHPS: '',
            duration: '',
          },
        },
      },
    };
  },
  mounted() {
    this.overlay = new OverlayAPI({
      CombatData: (data) => {
        this.combatData = data;
      },
    });
  },
};
</script>

<style>
</style>

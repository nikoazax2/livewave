<template>
  <div class="teams">
    <div class="bar-container" :class="{ voted: vote }">
      <button
        v-for="team in teams"
        :key="team.id"
        class="bar-segment"
        :class="{ mine: vote?.id === team.id }"
        :style="{ width: getWidth(team), '--team': team.color }"
        :title="`Voter pour ${team.name}`"
        @click="clickteam(team)"
      >
        <span>{{ team.name }}</span>
        <small v-if="vote">{{ getWidth(team) }}</small>
        <v-icon v-else size="14">mdi-gesture-tap</v-icon>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Teams",
  props: {
    teams: {
      type: Array,
      required: false,
      default: () => [],
    },
    vote: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    totalCount() {
      return this.teams.reduce((sum, team) => sum + team.count, 0) || 1;
    },
  },
  methods: {
    getWidth(team) {
      if (this.teams.reduce((sum, t) => sum + t.count, 0) === 0) return `${Math.round(100 / this.teams.length)}%`;
      return `${Math.round((team.count / this.totalCount) * 100)}%`;
    },
    clickteam(team) {
      if (this.vote == null || this.vote.id != team.id) {
        this.$emit("teamClick", team);
        this.$emit("vote", team);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.teams {
  padding: 12px 18px 4px;
}

.bar-container {
  display: flex;
  gap: 4px;
  height: 38px;
  border-radius: 14px;
  overflow: hidden;
}

.bar-segment {
  --team: #8b3dff;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  border: none;
  color: white;
  font-family: var(--lw-font-display);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  background: linear-gradient(180deg, color-mix(in srgb, var(--team) 90%, white 10%), color-mix(in srgb, var(--team) 70%, black 30%));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.2s;
  overflow: hidden;
  white-space: nowrap;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    opacity: 0.8;
  }

  &:hover {
    filter: brightness(1.15);
  }

  &.mine {
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
  }
}
</style>

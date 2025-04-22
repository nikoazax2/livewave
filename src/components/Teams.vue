<template>
    <div class="d-flex align-center justify-space-between" style="width: 100%; padding: 0 20px;">
        <div class="bar-container">
            <v-btn v-for="team in teams" :key="team.id" class="bar-segment" :style="{
                height: vote ? '15px' : '25px',
                width: getWidth(team),
                backgroundColor: team.color,
            }" :title="`Voter pour ${team.name}`" variant="flat" density="compact" @click="clickteam(team)">

                {{ team.name }} {{ vote ? '' : '👆' }}
            </v-btn>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Teams',
    props: {
        teams: {
            type: Array,
            required: false,
            default: () => []
        },
        vote: {
            type: Object,
            required: false,
            default: null
        }
    }, 
    computed: {
        totalCount() {
            return this.teams.reduce((sum, team) => sum + team.count, 0) || 1;
        }
    },
    methods: {
        getWidth(team) {
            return `${Math.round((team.count / this.totalCount) * 100)}%`;
        },
        clickteam(team) {
            if (this.vote == null) {
                this.$emit('teamClick', team)
                // this.vote = team
                this.$emit('vote', team)
            } else if (this.vote.id != team.id) {
                this.$emit('teamClick', team)
                this.$emit('vote', team)
            } else { 
            }
        }
    },
};
</script>

<style scoped>
.bar-container {
    display: flex;
    width: calc(100% - 20px);
    border-radius: 10px;
    overflow: hidden;
    margin: 0 10px;
}

.bar-segment {
    min-width: 2px;
    padding: 0 !important;
    border-radius: 0 !important;
    transition: width 0.3s ease;
    color: white;
    font-size: 12px;
}
</style>
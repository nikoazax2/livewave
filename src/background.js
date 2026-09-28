import { reactive } from 'vue'

export const background = reactive({ image: null })

export const pulseBackground = () => window.dispatchEvent(new CustomEvent('livewave:pulse'))

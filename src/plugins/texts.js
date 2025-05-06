import texts from '../texts.json'

export default {
  install(app) {
    app.config.globalProperties.$texts = texts

    // Optionnel : tu peux aussi injecter une langue par défaut
    app.config.globalProperties.$lang = 'fr'
  }
}

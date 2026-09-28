import { readFileSync } from "fs";
import { pick } from "./text.js";

const config = JSON.parse(readFileSync(new URL("./shows.json", import.meta.url), "utf8"));
const MIN = 60000;

export const HOST_NAME = "LiveWave";

// Questions de l'animateur, relatives au debut de l'emission (en minutes)
const MATCH = [
  { slot: "h-kickoff", at: 1, q: ["⚽ Coup d'envoi ! Votre prono pour {display} ?", "C'est parti ! Qui marque en premier ce soir ?"] },
  { slot: "h-early", at: 22, q: ["Premier quart d'heure : vous sentez le match comment ?", "Qui est le plus dangereux sur le terrain pour l'instant ?"] },
  { slot: "h-half", at: 48, q: ["⏱️ Mi-temps ! Satisfaits du score ?", "Pause : un changement à faire pour la 2e période ?"] },
  { slot: "h-late", at: 75, q: ["Dernier quart d'heure : ça tient ou ça craque ?", "Le tournant du match selon vous ?"] },
  { slot: "h-end", at: 100, q: ["Coup de sifflet final bientôt : homme du match ?", "Votre note sur 10 pour ce match ?"] },
];

const SHOW = [
  { slot: "h-start", at: 2, q: ["📺 C'est parti pour {display} ! Vous regardez avec qui ce soir ?", "Bienvenue sur le chat de {display} ! D'où vous regardez ?"] },
  { slot: "h-early", at: 25, q: ["Votre moment préféré jusqu'ici ?", "Qui vous a le plus marqué pour l'instant ?"] },
  { slot: "h-mid", at: 55, q: ["Ça vous a surpris, ce qui vient de se passer ?", "Team qui ce soir ? 👀"] },
  { slot: "h-late", at: 90, q: ["Dernière ligne droite : votre verdict sur la soirée ?", "Une note sur 10 pour l'épisode de ce soir ?"] },
];

// Avant l'emission : accueil, programme du soir et question d'ouverture (en minutes avant le debut)
const PRE = [
  { slot: "p-welcome", at: -25, q: ["👋 Bienvenue sur le chat de {display} ! Ça commence à {time} sur {channel}, installez-vous 🍿"] },
  { slot: "p-program", at: -15, q: ["📝 Au programme ce soir : {description}"], needs: "description" },
  { slot: "p-poll", at: -6, q: ["Avant de commencer : {pre}", "Petit tour de table avant le début : {pre}"] },
];

const PRE_QUESTION = {
  match: "votre prono pour le score final ? ⚽",
  show: "vous attendez quoi de l'épisode de ce soir ? 👀",
};

export function hostSlots(event) {
  const start = new Date(event.datestart).getTime();
  const end = new Date(event.dateend).getTime();
  const show = config.shows.find((s) => s.name === event.nameformat);
  const plan = event.kind === "match" ? MATCH : SHOW;
  const pre = PRE.filter((p) => !p.needs || event[p.needs]).map((p) => ({ slot: p.slot, at: start + p.at * MIN, questions: p.q }));
  const during = plan
    .map((p, i) => ({
      slot: p.slot,
      at: start + p.at * MIN,
      questions: show?.questions?.[i] ? [show.questions[i]] : p.q,
    }))
    .filter((s) => s.at < end - 5 * MIN);
  return [...pre, ...during];
}

const timeOf = (d) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", minute: "2-digit" }).format(new Date(d)).replace(":", "h").replace(/h00$/, "h");

export const hostText = (event, slot) =>
  pick(slot.questions)
    .replace("{display}", event.nameformat)
    .replace("{time}", timeOf(event.datestart))
    .replace("{channel}", event.channel || "")
    .replace("{description}", (event.description || "").replace(/\.\.\.$/, "…"))
    .replace("{pre}", PRE_QUESTION[event.kind === "match" ? "match" : "show"]);

export const stripAccents = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

// "Belgique - France" -> "BelgiqueFrance", "#VMAs" -> "VMAs"
export const slugify = (s = "") =>
  stripAccents(s)
    .replace(/^#/, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (w === w.toUpperCase() && w.length <= 4 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("")
    .slice(0, 60);

export const hashtag = (s = "") => (s.startsWith("#") ? s.replace(/\s+/g, "") : `#${slugify(s)}`);

const TZ = "Europe/Paris";

export const parisDate = (d = new Date()) =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export const parisHour = (d) => {
  const parts = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).formatToParts(d);
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  return mm === "00" ? `${Number(hh)}h` : `${Number(hh)}h${mm}`;
};

export const parisMinutes = (d) => {
  const [hh, mm] = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d).split(":");
  return Number(hh) * 60 + Number(mm);
};

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Longueur telle que X la compte : chaque URL vaut 23 caracteres
export const xLength = (text) => [...text.replace(/https?:\/\/\S+/g, "x".repeat(23))].length;

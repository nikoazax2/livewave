import fs from "fs";
import readline from "readline";
import { execSync } from "child_process";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Nouvelle URL pour og:image : ", (newOgImage) => {
    if (!newOgImage.startsWith("http")) {
        console.error("❌ URL invalide.");
        rl.close();
        return;
    }

    const filePath = "index.html";

    let html = fs.readFileSync(filePath, "utf-8");

    // Remplacer og:image
    html = html.replace(
        /<meta property="og:image" content="[^"]+" \/>/,
        `<meta property="og:image" content="${newOgImage}" />`
    );

    // Remplacer twitter:image si présent
    html = html.replace(
        /<meta name="twitter:image" content="[^"]+" \/>/,
        `<meta name="twitter:image" content="${newOgImage}" />`
    );

    fs.writeFileSync(filePath, html);
    console.log("✅ Fichier index.html mis à jour.");

    try {
        execSync("git add index.html");
        execSync(`git commit -m "update(SEO): change og:image URL"`);
        execSync("git push");
        console.log("✅ Modifications poussées sur le dépôt Git.");
    } catch (err) {
        console.error("❌ Erreur lors du push Git :", err.message);
    }

    rl.close();
});

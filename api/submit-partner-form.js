// Contenu pour : api/submit-partner-form.js
const Airtable = require('airtable');

// --- Configuration Airtable ---
// Récupérer les secrets depuis les variables d'environnement Vercel
// IMPORTANT: Ces variables NE DOIVENT PAS commencer par NEXT_PUBLIC_
const AIRTABLE_PAT = process.env.AIRTABLE_PAT; // Votre Personal Access Token Airtable
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // L'ID de votre Base ("app...")
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME; // Le nom exact de votre Table

// Vérification initiale des variables d'environnement au démarrage de la fonction
if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.error("FATAL ERROR: Variables d'environnement Airtable manquantes ou invalides.");
    // Vous pourriez vouloir lancer une erreur ici pour empêcher la fonction de démarrer
    // throw new Error("Configuration Airtable incomplète côté serveur.");
}

// Initialiser le client Airtable (seulement si les clés sont présentes)
const base = AIRTABLE_PAT && AIRTABLE_BASE_ID
    ? new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID)
    : null;

// --- Handler de la Fonction Serverless ---
module.exports = async (req, res) => {
    // 1. Autoriser uniquement les requêtes POST
    if (req.method !== 'POST') {
        console.warn(`Méthode non autorisée reçue: ${req.method}`);
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }

    // 2. Vérifier si la configuration Airtable est valide
    if (!base) {
        console.error("Erreur critique: Configuration Airtable non initialisée (variables manquantes?).");
        return res.status(500).json({ error: "Erreur de configuration du serveur." });
    }

    try {
        // 3. Récupérer et valider les données du formulaire
        const formData = req.body;
        console.log("Données reçues:", formData); // Pour le débogage dans les logs Vercel

        // Assurez-vous que les clés ici correspondent aux attributs 'name' de votre formulaire HTML
        const { establishmentName, email, phone, establishmentType } = formData;

        if (!establishmentName || !email || !phone || !establishmentType) {
            console.warn("Validation échouée: Données de formulaire incomplètes reçues.", formData);
            return res.status(400).json({ error: "Données du formulaire incomplètes." });
        }

        // 4. Préparer les données pour Airtable
        // !! IMPORTANT !! : Les clés ici ('Nom Etablissement', 'Email', etc.)
        // doivent correspondre EXACTEMENT aux noms des colonnes dans votre Table Airtable.
        const fieldsToCreate = {
            // Adaptez ces noms à vos colonnes Airtable EXACTES
            'Nom Etablissement': establishmentName,
            'Email': email,
            'Telephone': phone,
            'Type Etablissement': establishmentType,
            // Vous pouvez ajouter d'autres champs ici si nécessaire
            // 'Date Soumission': new Date().toISOString(), // Si vous n'utilisez pas le champ "Created Time"
        };
        console.log("Champs à créer dans Airtable:", fieldsToCreate);

        // 5. Envoyer les données à Airtable
        await base(AIRTABLE_TABLE_NAME).create([
            { fields: fieldsToCreate },
        ]);

        console.log("Données envoyées avec succès à Airtable.");

        // 6. Répondre au client avec succès
        return res.status(200).json({ message: "Formulaire soumis avec succès !" });

    } catch (error) {
        // 7. Gérer les erreurs (Validation, Airtable API, etc.)
        console.error("Erreur lors de la création de l'enregistrement Airtable:", error);
        // Renvoyer une erreur générique au client
        return res.status(500).json({ error: "Une erreur est survenue lors de la soumission du formulaire." });
    }
};
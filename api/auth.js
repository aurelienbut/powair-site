// api/auth.js - API d'authentification pour la page webinaire
const Airtable = require('airtable');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Configuration Airtable ---
const AIRTABLE_PAT = process.env.AIRTABLE_PAT; // Personal Access Token Airtable
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // ID de votre Base
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || 'Utilisateurs'; // Table des utilisateurs
const JWT_SECRET = process.env.JWT_SECRET; // Secret pour signer les JWT (IMPORTANT: définir dans les variables d'environnement Vercel)

// Vérification des variables d'environnement essentielles
if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !JWT_SECRET) {
    console.error("ERREUR CRITIQUE: Variables d'environnement manquantes pour l'authentification");
}

// Initialisation d'Airtable
const base = AIRTABLE_PAT && AIRTABLE_BASE_ID
    ? new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID)
    : null;

module.exports = async (req, res) => {
    // 1. N'autoriser que les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }

    // 2. Vérifier si la configuration est valide
    if (!base || !JWT_SECRET) {
        return res.status(500).json({ error: "Erreur de configuration du serveur." });
    }

    try {
        // 3. Récupérer les identifiants
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        // 4. Rechercher l'utilisateur dans Airtable
        const records = await base(AIRTABLE_USERS_TABLE).select({
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1
        }).firstPage();

        // 5. Vérifier si l'utilisateur existe
        if (records.length === 0) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        const user = records[0].fields;

        // 6. Vérifier le mot de passe
        // Dans un environnement de production, les mots de passe devraient être hachés
        // Pour cet exemple, nous supposons que les mots de passe dans Airtable sont hachés avec bcrypt
        const passwordMatch = await bcrypt.compare(password, user.PasswordHash) // OU user.PasswordHash si vous utilisez des mots de passe hachés
            || password === user.Password; // Fallback sur un mot de passe en clair pour les tests
        
        if (!passwordMatch) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        // 7. Créer un token JWT
        const token = jwt.sign(
            { 
                userId: records[0].id,
                email: user.Email,
                name: user.Name || user.Nom,
                role: user.Role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' } // Le token expire après 24 heures
        );

        // 8. Renvoyer le token et les informations de base de l'utilisateur
        return res.status(200).json({
            token,
            user: {
                id: records[0].id,
                email: user.Email,
                name: user.Name || user.Nom,
                role: user.Role || 'user'
            }
        });

    } catch (error) {
        console.error("Erreur d'authentification:", error);
        
        // Gérer les erreurs spécifiques pour donner plus de contexte
        if (error.message && error.message.includes('Invalid API key')) {
            return res.status(500).json({ error: "Erreur de configuration Airtable" });
        }
        
        return res.status(500).json({ error: "Erreur lors de l'authentification" });
    }
};
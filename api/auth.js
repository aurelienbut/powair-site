// api/auth.js - API d'authentification pour la page webinaire - VERSION DÉBOGAGE
const Airtable = require('airtable');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Configuration Airtable ---
const AIRTABLE_PAT = process.env.AIRTABLE_PAT; // Personal Access Token Airtable
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // ID de votre Base
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || 'Utilisateurs'; // Table des utilisateurs
const JWT_SECRET = process.env.JWT_SECRET; // Secret pour signer les JWT

// Vérification des variables d'environnement essentielles avec plus de logs
console.log("--- VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT ---");
console.log("AIRTABLE_PAT défini:", !!AIRTABLE_PAT);
console.log("AIRTABLE_BASE_ID défini:", !!AIRTABLE_BASE_ID);
console.log("JWT_SECRET défini:", !!JWT_SECRET);
console.log("AIRTABLE_USERS_TABLE:", AIRTABLE_USERS_TABLE);

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !JWT_SECRET) {
    console.error("ERREUR CRITIQUE: Variables d'environnement manquantes pour l'authentification");
}

// Initialisation d'Airtable
const base = AIRTABLE_PAT && AIRTABLE_BASE_ID
    ? new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID)
    : null;

console.log("Base Airtable initialisée:", !!base);

module.exports = async (req, res) => {
    console.log("--- DÉBUT TRAITEMENT REQUÊTE AUTH ---");
    console.log("Méthode HTTP:", req.method);
    
    // 1. N'autoriser que les requêtes POST
    if (req.method !== 'POST') {
        console.log("Méthode refusée:", req.method);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }

    // 2. Vérifier si la configuration est valide
    if (!base || !JWT_SECRET) {
        console.error("Configuration invalide - Base:", !!base, "JWT_SECRET:", !!JWT_SECRET);
        return res.status(500).json({ error: "Erreur de configuration du serveur." });
    }

    try {
        // 3. Récupérer les identifiants
        const { email, password } = req.body;
        console.log("Tentative de connexion pour l'email:", email);
        console.log("Mot de passe fourni (longueur):", password ? password.length : 0);

        if (!email || !password) {
            console.log("Email ou mot de passe manquant");
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        // 4. Rechercher l'utilisateur dans Airtable
        console.log("Recherche dans la table:", AIRTABLE_USERS_TABLE);
        console.log("Formule de filtre:", `{Email} = '${email}'`);
        
        const records = await base(AIRTABLE_USERS_TABLE).select({
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1
        }).firstPage();

        console.log("Nombre d'enregistrements trouvés:", records.length);

        // 5. Vérifier si l'utilisateur existe
        if (records.length === 0) {
            console.log("Aucun utilisateur trouvé avec cet email");
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        const user = records[0].fields;
        const userId = records[0].id;
        
        console.log("Utilisateur trouvé, ID:", userId);
        console.log("Champs disponibles:", Object.keys(user).join(", "));
        console.log("Valeur de Email:", user.Email);
        console.log("Valeur de Name/Nom:", user.Name || user.Nom || "Non défini");
        console.log("Valeur de Role:", user.Role || "Non défini");
        console.log("Password défini:", !!user.Password);
        console.log("PasswordHash défini:", !!user.PasswordHash);

        // 6. Vérifier le mot de passe avec une meilleure gestion des erreurs
        let passwordMatch = false;
        
        // Vérification détaillée pour éviter les erreurs bcrypt
        if (user.PasswordHash) {
            try {
                console.log("Tentative de vérification avec PasswordHash");
                passwordMatch = await bcrypt.compare(password, user.PasswordHash);
                console.log("Résultat de la comparaison bcrypt:", passwordMatch);
            } catch (bcryptError) {
                console.error("Erreur bcrypt:", bcryptError);
                // On continue pour essayer le mot de passe en clair
            }
        }
        
        // Si bcrypt a échoué ou PasswordHash n'existe pas, essayer le mot de passe en clair
        if (!passwordMatch && user.Password) {
            console.log("Tentative de vérification avec Password en clair");
            console.log("Mot de passe saisi:", password);
            console.log("Mot de passe stocké:", user.Password);
            passwordMatch = (password === user.Password);
            console.log("Résultat de la comparaison en clair:", passwordMatch);
        }
        
        if (!passwordMatch) {
            console.log("Échec de l'authentification: mot de passe incorrect");
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        console.log("Authentification réussie");

        // 7. Créer un token JWT
        const tokenPayload = { 
            userId,
            email: user.Email,
            name: user.Name || user.Nom || email.split('@')[0], // Fallback sur la partie locale de l'email
            role: user.Role || 'user'
        };
        
        console.log("Payload du token JWT:", JSON.stringify(tokenPayload));
        
        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '24h' } // Le token expire après 24 heures
        );

        console.log("Token JWT généré avec succès");

        // 8. Renvoyer le token et les informations de base de l'utilisateur
        const responseData = {
            token,
            user: {
                id: userId,
                email: user.Email,
                name: user.Name || user.Nom || email.split('@')[0],
                role: user.Role || 'user'
            }
        };
        
        console.log("Réponse envoyée:", JSON.stringify(responseData, null, 2).replace(token, '[TOKEN_MASQUÉ]'));
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Erreur d'authentification complète:", error);
        console.error("Stack trace:", error.stack);
        
        // Gérer les erreurs spécifiques pour donner plus de contexte
        if (error.message) {
            console.error("Message d'erreur:", error.message);
            
            if (error.message.includes('Invalid API key')) {
                return res.status(500).json({ error: "Erreur de configuration Airtable: Clé API invalide" });
            }
            
            if (error.message.includes('Not found')) {
                return res.status(500).json({ error: "Erreur de configuration Airtable: Base ou table introuvable" });
            }
            
            if (error.message.includes('Rate Limit Exceeded')) {
                return res.status(429).json({ error: "Limite de requêtes Airtable dépassée. Veuillez réessayer plus tard." });
            }
        }
        
        return res.status(500).json({ error: "Erreur lors de l'authentification. Consultez les logs pour plus de détails." });
    }
};
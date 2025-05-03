// api/verify-token.js - API pour vérifier la validité d'un token JWT
const jwt = require('jsonwebtoken');

// Secret pour vérifier les JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Vérifier si la configuration est valide
if (!JWT_SECRET) {
  console.error("ERREUR CRITIQUE: JWT_SECRET manquant dans les variables d'environnement");
}

module.exports = async (req, res) => {
  // 1. N'autoriser que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }

  try {
    // 2. Récupérer le token dans l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token manquant ou format incorrect" });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 3. Vérifier si JWT_SECRET est configuré
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Erreur de configuration du serveur" });
    }
    
    // 4. Vérifier la validité du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 5. Vérifier si le token a expiré
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ error: "Token expiré" });
    }
    
    // 6. Token valide, renvoyer les informations d'utilisateur
    return res.status(200).json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    
    // 7. Gérer les différentes erreurs JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token invalide" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expiré" });
    } else {
      return res.status(500).json({ error: "Erreur lors de la vérification du token" });
    }
  }
};
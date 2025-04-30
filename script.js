// Contenu pour script.js

// --- Injection dynamique du script Google Maps ---
function loadGoogleMapsScript() {
    // Utilise la variable d'environnement injectée par Vercel (préfixée par NEXT_PUBLIC_)
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

    // Vérification simple (Vercel remplacera process.env.KEY par sa valeur lors du build,
    // mais pour le client-side JS pur, cette approche peut être moins directe.
    // Alternative plus robuste si process.env ne fonctionne pas directement ici :
    // Injecter la clé via un attribut data sur le body ou un script tag spécifique
    // généré lors d'un build step, mais pour Vercel statique, le NEXT_PUBLIC_ devrait marcher.
    // Assumons que Vercel rend 'undefined' si non défini.
    // Note: dans un environnement local sans Vercel, process.env sera vide.

    // Tentative de récupération directe (peut ne pas fonctionner sans build step complexe)
    // Remplacer par une méthode plus sûre si nécessaire en production
    // Par exemple, en définissant la clé dans les settings Vercel et en espérant l'injection
    // Ou en ayant un petit script de build. Pour l'instant, on suit la doc Vercel.

    // IMPORTANT : Pour les tests locaux SANS Vercel, cette clé sera undefined.
    // Vous pourriez ajouter une clé de test locale ici:
    // const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || 'VOTRE_CLE_DE_TEST_LOCALE';

    if (!apiKey || apiKey === 'undefined') { // Vérification plus large
        console.error("Clé API Google Maps manquante ou non définie. Vérifiez la variable d'environnement NEXT_PUBLIC_Maps_API_KEY dans Vercel et assurez-vous qu'elle est accessible côté client.");
        const mapElement = document.getElementById("map");
        if (mapElement) {
            mapElement.innerHTML = '<p style="text-align: center; padding-top: 50px; color: var(--text-light);">Erreur de configuration : Clé API Google Maps manquante.</p>';
        }
        return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker`;
    script.async = true;
    script.defer = true;
    // Gérer les erreurs de chargement du script Google Maps lui-même
    script.onerror = () => {
        console.error("Erreur lors du chargement du script Google Maps API. Vérifiez la clé et la connexion.");
         const mapElement = document.getElementById("map");
         if (mapElement) {
            mapElement.innerHTML = '<p style="text-align: center; padding-top: 50px; color: var(--text-light);">Impossible de charger le script Google Maps.</p>';
         }
    };
    document.head.appendChild(script);
}

// Appeler la fonction pour charger le script dès que possible
loadGoogleMapsScript();
// --- Fin de l'injection dynamique ---


// --- Fonctions pour les styles de carte Google Maps (définies globalement) ---
// Styles mis à jour pour la palette Gradient Bleu/Cyan
function getLightMapStyles() {
    return [
        { elementType: "geometry", stylers: [{ color: "#F8FAFC" }] }, // bg-alt-light
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#5a7a9e" }] }, // text-light-light
        { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4C86F9" }] }, // gradient-start-color
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#E5E7EB" }] }, // border-color-light
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#5a7a9e" }] }, // text-light-light
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E0F2FE" }] }, // Légèrement bleuté
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#5a7a9e" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#5a7a9e" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#D1E3FF" }] }, // Bleu très pale
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#111827" }] }, // text-color-light
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#4C86F9" }] },
        { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#E5E7EB" }] },
        { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#E5E7EB" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#A8D8FF" }] }, // text-light-dark (eau claire)
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#111827" }] }
    ];
}

function getDarkMapStyles() {
    return [
        { elementType: "geometry", stylers: [{ color: "#121212" }] }, // bg-color-dark
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#A8D8FF" }] }, // text-light-dark
        { elementType: "labels.text.stroke", stylers: [{ color: "#121212" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#374151" }] }, // border-color-dark
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#00C4FF" }] }, // gradient-end-color
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#A8D8FF" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#A8D8FF" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1E1E1E" }] }, // bg-alt-dark
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#00C4FF" }] },
        { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#121212" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#1E1E1E" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#4C86F9" }] }, // gradient-start-color (plus sombre)
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#374151" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#374151" }] },
        { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4A5568" }] }, // Un gris un peu plus clair
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#4C86F9" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#A8D8FF" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B132B" }] }, // Bleu nuit très sombre
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#A8D8FF" }] }
    ];
}

// --- Fonction pour créer/mettre à jour le marqueur (définie globalement) ---
function createMapMarkerContent() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const markerIcon = document.createElement('div');
    // Utilise le gradient pour le fond du marqueur
    markerIcon.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-image: var(--gradient-primary);
        background-color: var(--gradient-start-color); /* Fallback */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${isDarkMode ? 'var(--main-white)' : 'var(--dark-bg-base)'}; /* Bordure contrastante */
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transition: all 0.3s ease; /* Pour changement de bordure */
    `;
    // Icone contrastante
    markerIcon.innerHTML = `<i class="fas fa-bolt" style="color: ${isDarkMode ? 'var(--dark-bg-base)' : 'var(--main-white)'}; font-size: 14px; text-shadow: 0 0 3px rgba(0,0,0,0.5); transition: color 0.3s ease;"></i>`;
    return markerIcon;
}

// Doit être globale si appelée depuis le theme switcher
function updateMapMarker(mapInstance, markerInstance) {
    if (mapInstance && markerInstance && typeof google !== 'undefined' && google.maps && google.maps.marker) {
        const newContent = createMapMarkerContent();
        // Recrée le marqueur pour appliquer le nouveau contenu/style
        markerInstance.setMap(null); // Supprime l'ancien
        // Recréer avec le nouveau contenu (AdvancedMarkerElement ne permet pas de setContent directement)
        window.currentMarker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstance,
            position: markerInstance.position,
            title: markerInstance.title,
            content: newContent
        });
    }
}

// --- Fonction pour initialiser la Google Map (définie globalement pour le callback) ---
// Gardez une référence globale pour la carte et le marqueur si besoin (pour le theme switch)
window.currentMapInstance = null;
window.currentMarker = null;

async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) { console.error("L'élément #map n'a pas été trouvé."); return; }
    const defaultLocation = { lat: 48.8566, lng: 2.3522 }; // Paris

    // Vérifier si l'API Google Maps est chargée
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error("L'API Google Maps n'est pas chargée.");
         mapElement.innerHTML = '<p style="text-align: center; padding-top: 50px; color: var(--text-light);">Erreur: API Google Maps non chargée.</p>';
        return;
    }

    try {
        // Attend le chargement des bibliothèques maps et marker
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        const isDarkMode = document.body.classList.contains('dark-mode');

        const map = new Map(mapElement, {
            center: defaultLocation,
            zoom: 12,
            mapId: 'POWAIR_GRADIENT_MAP_ID', // Assurez-vous d'avoir un Map ID cloud configuré si vous l'utilisez
            styles: isDarkMode ? getDarkMapStyles() : getLightMapStyles(),
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        // Sauvegarde l'instance de la carte
        window.currentMapInstance = map;

        const markerContent = createMapMarkerContent();

        // Crée le marqueur avancé
        const marker = new AdvancedMarkerElement({
            map: map,
            position: defaultLocation,
            title: "Borne Pow'air (Exemple)",
            content: markerContent, // Utilise l'élément DOM personnalisé
        });

        // Sauvegarde l'instance du marqueur
        window.currentMarker = marker;

        // TODO: Ajouter ici la logique pour charger et afficher les vrais marqueurs depuis vos données
        // Exemple:
        // const locations = [ { lat: 48.86, lng: 2.34, title: "Borne 1"}, ... ];
        // locations.forEach(loc => {
        //   new AdvancedMarkerElement({ map: map, position: loc, title: loc.title, content: createMapMarkerContent() });
        // });

    } catch (error) {
        console.error("Erreur Google Maps lors de l'initialisation:", error);
        if (mapElement) {
            mapElement.innerHTML = '<p style="text-align: center; padding-top: 50px; color: var(--text-light);">Impossible de charger la carte.<br>Vérifiez votre clé API, le Map ID et la console pour les erreurs.</p>';
        }
    }
}


// --- Début du Script Principal (logique qui dépend du DOM) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Gestion du Header "scrolled" ---
    const header = document.querySelector('header');
    if(header) {
        const scrollThreshold = 50;
        const checkScroll = () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll(); // Vérifier au chargement initial
    }

    // --- Gestion du Menu Mobile ---
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
    const bodyForMenu = document.body;

    if (mobileMenuButton && mobileMenu) {
        const icon = mobileMenuButton.querySelector('i');

        const toggleMenu = (open) => {
            if(open) {
                mobileMenu.classList.add('active');
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                bodyForMenu.style.overflow = 'hidden'; // Empêche le scroll du body
                mobileMenuButton.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.remove('active');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                bodyForMenu.style.overflow = ''; // Réautorise le scroll
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        }

        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            toggleMenu(!isOpen);
        });

        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Fermer le menu seulement si c'est un lien interne (#)
                if (link.getAttribute('href').startsWith('#')) {
                     toggleMenu(false);
                }
            });
        });
    }

    // --- Gestion du Mode Sombre / Clair ---
    const modeSwitch = document.querySelector('.mode-switch');
    const bodyForTheme = document.body;

    if (modeSwitch) {
        const modeIcon = modeSwitch.querySelector('i');
        let currentMode = localStorage.getItem('themeMode');

        const applyTheme = (mode) => {
            if (mode === 'dark') {
                bodyForTheme.classList.add('dark-mode');
                modeIcon.classList.remove('fa-moon');
                modeIcon.classList.add('fa-sun');
                modeSwitch.setAttribute('aria-label', 'Passer au mode clair');
            } else { // light or null
                bodyForTheme.classList.remove('dark-mode');
                modeIcon.classList.remove('fa-sun');
                modeIcon.classList.add('fa-moon');
                modeSwitch.setAttribute('aria-label', 'Passer au mode sombre');
            }
            // Met à jour la carte si elle existe et est initialisée
            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined' && window.currentMapInstance) {
                const isNowDarkMode = bodyForTheme.classList.contains('dark-mode');
                window.currentMapInstance.setOptions({ styles: isNowDarkMode ? getDarkMapStyles() : getLightMapStyles() });
                // Met à jour aussi le marqueur
                if (window.currentMarker) {
                    updateMapMarker(window.currentMapInstance, window.currentMarker);
                }
            }
        }

        // Déterminer le mode initial
        if (!currentMode) { // Si aucun mode n'est sauvegardé
             if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                 currentMode = 'dark';
             } else {
                 currentMode = 'light';
             }
            // Ne pas sauvegarder le mode système par défaut, seulement les choix utilisateur
        }

        applyTheme(currentMode); // Appliquer le thème initial

        modeSwitch.addEventListener('click', () => {
            currentMode = bodyForTheme.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('themeMode', currentMode); // Sauvegarder le choix utilisateur
            applyTheme(currentMode);
        });

         // Écouter les changements de préférence système s'il n'y a pas de choix utilisateur
         window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (!localStorage.getItem('themeMode')) { // Seulement si l'utilisateur n'a pas choisi
                currentMode = event.matches ? "dark" : "light";
                applyTheme(currentMode);
            }
        });
    }


    // --- Gestion des Animations au Scroll (Intersection Observer) ---
    const animatedElements = document.querySelectorAll(
        '.section-title-container, .step, .benefit-card, .map-container, .pricing-card, .download-container, .hero-text, .hero-image, .hero-buttons, .scroll-down, .partners-benefits, .partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card'
    );
    let countersStarted = false; // Flag pour démarrer les compteurs une seule fois

    if ("IntersectionObserver" in window && animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    // Démarrer les compteurs si la section stats devient visible ET qu'ils n'ont pas démarré
                    if (entry.target.classList.contains('partners-stats') && !countersStarted) {
                       // Vérifier si le parent n'est pas le contenu caché initialement
                       if (!entry.target.closest('.partner-hidden-content:not(.visible)')) {
                           startCounters();
                           countersStarted = true;
                       }
                    }
                     // Optionnel: dés-observer après la première animation si elle ne doit se jouer qu'une fois
                     // observerInstance.unobserve(entry.target);
                }
                // Optionnel: retirer la classe si l'élément redevient non visible (pour rejouer l'animation)
                // else { entry.target.classList.remove('active'); }
            });
        }, { threshold: 0.1 }); // Déclencher quand 10% est visible

        animatedElements.forEach(el => {
             // N'observer que les éléments qui ne sont PAS dans le contenu caché initialement
             if (!el.closest('.partner-hidden-content')) {
                observer.observe(el);
             }
        });
    } else {
        // Fallback pour les navigateurs sans Intersection Observer : tout activer
        animatedElements.forEach(el => {
             if (!el.closest('.partner-hidden-content')) {
                el.classList.add('active');
             }
        });
        // Fallback pour les compteurs s'ils sont visibles dès le début
        const initialStatsSection = document.querySelector('.partners-stats:not(.partner-hidden-content .partners-stats)');
        if (initialStatsSection && !countersStarted) {
             startCounters();
             countersStarted = true;
        }
    }

    // --- Fonction pour démarrer les compteurs ---
    function startCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            // Vérifier si le compteur est visible et n'a pas déjà été animé
            if (counter.offsetParent === null || counter.dataset.animated) return;
            counter.dataset.animated = true; // Marquer comme animé

            const target = parseInt(counter.getAttribute('data-count'), 10);
            if (isNaN(target)) return; // Sécurité

            const duration = 1500; // ms
            let startTimestamp = null;

            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                counter.textContent = Math.floor(progress * target);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    counter.textContent = target; // Assurer la valeur finale exacte
                }
            };
            window.requestAnimationFrame(step);
        });
    }

    // --- Slider de témoignages ---
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const slides = document.querySelectorAll('.testimonial-slide');
    let currentSlide = 0;
    let slideInterval;
    const sliderElement = document.querySelector('.testimonial-slider'); // Pour vérifier la visibilité

    function goToSlide(index) {
        if (!slides.length || !dots.length) return;
        // Ne pas changer si le slider est caché (ex: dans partner-hidden-content)
        if (sliderElement && sliderElement.offsetParent === null) return;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length; // Assure un index valide

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval(); // Redémarrer le timer lors d'un clic manuel
        });
    });

    function startInterval() {
        if (!slides.length || slides.length < 2) return;
        clearInterval(slideInterval); // Nettoyer au cas où
        slideInterval = setInterval(() => {
             // Vérifier la visibilité à chaque intervalle aussi
             if (sliderElement && sliderElement.offsetParent !== null) {
                goToSlide(currentSlide + 1);
             }
        }, 5000); // Changer toutes les 5 secondes
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    // Initialisation du slider
    if (slides.length > 0) {
        goToSlide(0); // Afficher la première slide
        if (slides.length > 1) {
             startInterval(); // Démarrer le défilement auto si plus d'une slide
        }
    }


    // --- Gestion du Toggle pour la Section Partenaires ---
    const partnerToggleButton = document.querySelector('.partner-toggle-button');
    const partnerHiddenContent = document.querySelector('.partner-hidden-content');
    const hiddenAnimatedElements = partnerHiddenContent ? partnerHiddenContent.querySelectorAll('.partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card') : [];

    if (partnerToggleButton && partnerHiddenContent) {

         // Créer un observer spécifique pour les éléments cachés, si IO est supporté
         let observerForHidden = null;
         if ("IntersectionObserver" in window) {
              observerForHidden = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active');
                            // Démarrer les compteurs si la section stats devient visible via toggle
                            if (entry.target.classList.contains('partners-stats') && !countersStarted) {
                                startCounters();
                                countersStarted = true;
                            }
                            // Optionnel: dés-observer après la première fois
                            // observerForHidden.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
         }


        partnerToggleButton.addEventListener('click', () => {
            const isVisible = partnerHiddenContent.classList.contains('visible');
            const toggleIcon = partnerToggleButton.querySelector('i');

            if (isVisible) {
                partnerHiddenContent.classList.remove('visible');
                partnerToggleButton.setAttribute('aria-expanded', 'false');
                toggleIcon.classList.remove('fa-minus-circle');
                toggleIcon.classList.add('fa-plus-circle');
                partnerToggleButton.childNodes[1].textContent = ' En savoir plus sur le partenariat'; // Ajuste le texte

                // Optionnel: Dés-observer les éléments maintenant cachés
                if(observerForHidden) {
                     hiddenAnimatedElements.forEach(el => observerForHidden.unobserve(el));
                }


            } else {
                partnerHiddenContent.classList.add('visible');
                partnerToggleButton.setAttribute('aria-expanded', 'true');
                toggleIcon.classList.remove('fa-plus-circle');
                toggleIcon.classList.add('fa-minus-circle');
                partnerToggleButton.childNodes[1].textContent = ' Réduire'; // Ajuste le texte


                // Démarrer les compteurs s'ils sont dans le contenu caché et pas déjà démarrés
                const statsInsideHidden = partnerHiddenContent.querySelector('.partners-stats');
                if (statsInsideHidden && !countersStarted) {
                     // Utiliser un léger délai pour s'assurer que l'élément est rendu
                     setTimeout(() => {
                        // Double vérification de visibilité avant de démarrer
                        if (statsInsideHidden.offsetParent !== null) {
                            startCounters();
                            countersStarted = true;
                        }
                     }, 50);
                }

                // Activer ou observer les éléments nouvellement visibles
                hiddenAnimatedElements.forEach(el => {
                    if (observerForHidden) {
                        // Observer seulement s'il n'est pas déjà actif (au cas où)
                        if (!el.classList.contains('active')) {
                            observerForHidden.observe(el);
                        }
                    } else {
                        // Fallback : activer immédiatement
                        el.classList.add('active');
                    }
                });

                 // Redémarrer l'intervalle du slider s'il est dans le contenu caché
                 if (sliderElement && partnerHiddenContent.contains(sliderElement)) {
                     resetInterval();
                 }


                // Scroll vers le bouton après un court délai pour laisser le layout se stabiliser
                setTimeout(() => {
                    partnerToggleButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    }

}); // Fin de DOMContentLoaded
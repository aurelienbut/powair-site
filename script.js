// script.js

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
        checkScroll();
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
                bodyForMenu.style.overflow = 'hidden';
                mobileMenuButton.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.remove('active');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                bodyForMenu.style.overflow = '';
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        }

        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            toggleMenu(!isOpen);
        });

        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
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
            } else {
                bodyForTheme.classList.remove('dark-mode');
                modeIcon.classList.remove('fa-sun');
                modeIcon.classList.add('fa-moon');
                modeSwitch.setAttribute('aria-label', 'Passer au mode sombre');
            }
            // Note: Le style de la carte Leaflet/OSM n'est pas automatiquement mis à jour ici.
            // Des solutions CSS (filtres) ou des fournisseurs de tuiles spécifiques sont nécessaires pour un thème sombre de carte.
        }

        if (!currentMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentMode = 'dark';
            localStorage.setItem('themeMode', 'dark');
        } else if (!currentMode) {
            currentMode = 'light';
        }
        applyTheme(currentMode);

        modeSwitch.addEventListener('click', () => {
            currentMode = bodyForTheme.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('themeMode', currentMode);
            applyTheme(currentMode);
        });
    }


    // --- Gestion des Animations au Scroll (Intersection Observer) ---
    const animatedElements = document.querySelectorAll(
        '.section-title-container, .step, .benefit-card, .pricing-card, .download-container, .hero-text, .hero-image, .hero-buttons, .scroll-down, .partners-benefits, .partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card'
        // Note : le conteneur de la carte .map-container n'est plus animé ici par défaut
    );
    let countersStarted = false;

    if ("IntersectionObserver" in window && animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Start counters only if the stats section is directly visible (not inside hidden content initially)
                    if (entry.target.classList.contains('partners-stats') && !countersStarted && !entry.target.closest('.partner-hidden-content')) {
                        startCounters();
                        countersStarted = true;
                    }
                    // Optionally unobserve if animation should only run once
                    // observerInstance.unobserve(entry.target);
                }
                // else { entry.target.classList.remove('active'); } // Optionally reverse animation
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        animatedElements.forEach(el => {
            // Only observe elements that are not initially hidden
            if (!el.closest('.partner-hidden-content')) {
                observer.observe(el);
            }
        });
    } else {
        // Fallback for browsers without Intersection Observer
        animatedElements.forEach(el => {
            if (!el.closest('.partner-hidden-content')) {
               el.classList.add('active');
            }
        });
        // Fallback for counters
        const statsSectionVisible = document.querySelector('.partners-stats:not(.partner-hidden-content .partners-stats)');
        if (statsSectionVisible && !countersStarted) {
            startCounters();
            countersStarted = true;
        }
    }

    // Function to start counters
    function startCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            // Check if counter is visible and not already animated
            if (counter.offsetParent === null || counter.dataset.animated) return; // Check if visible in DOM
            counter.dataset.animated = true; // Mark as animated

            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = 1500; // ms
            let startTimestamp = null;

            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                counter.textContent = Math.floor(progress * target);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    counter.textContent = target; // Ensure final value is exact
                }
            };
            window.requestAnimationFrame(step);
        });
    }

    // Slider de témoignages
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const slides = document.querySelectorAll('.testimonial-slide');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        if (!slides.length || !dots.length) return; // Ensure elements exist
        // Check if the slider itself is visible before proceeding
        const parentSlider = slides.length > 0 ? slides[0].closest('.testimonial-slider') : null;
        if (parentSlider && parentSlider.offsetParent === null) return; // Don't cycle if hidden

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (index >= 0 && index < slides.length) {
           slides[index].classList.add('active');
           if (dots[index]) dots[index].classList.add('active'); // Check dot exists
           currentSlide = index;
        } else {
           // Fallback to first slide if index is out of bounds
           slides[0].classList.add('active');
           if (dots[0]) dots[0].classList.add('active');
           currentSlide = 0;
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval(); // Reset timer on manual navigation
        });
    });

    function startInterval() {
       if (!slides.length || slides.length < 2) return; // No interval needed for 0 or 1 slide
       clearInterval(slideInterval); // Clear existing interval
       slideInterval = setInterval(() => {
           // Check visibility again inside interval, in case it got hidden
           const parentSlider = slides.length > 0 ? slides[0].closest('.testimonial-slider') : null;
           if (parentSlider && parentSlider.offsetParent !== null) { // Check if slider is visible
               const nextSlide = (currentSlide + 1) % slides.length;
               goToSlide(nextSlide);
           }
       }, 5000); // Change slide every 5 seconds
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    // Initial setup for slider
    if (slides.length > 1) {
        goToSlide(0); // Start at the first slide
        startInterval();
    } else if (slides.length === 1) {
        goToSlide(0); // Show the single slide
    }

    // --- Initialisation de la Carte Leaflet ---
    const mapElement = document.getElementById('map');

    if (mapElement) { // Vérifie si l'élément de la carte existe sur la page actuelle
        try {
            // Coordonnées pour centrer la carte (France) et niveau de zoom initial
            const mapCenter = [46.603354, 1.888334]; // Centre approximatif de la France métropolitaine
            const initialZoom = 6;

            // Initialiser la carte Leaflet
            const powairMap = L.map('map').setView(mapCenter, initialZoom);

            // Ajouter le fond de carte OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18, // Zoom maximum autorisé
                minZoom: 5   // Zoom minimum (évite de trop dézoomer)
            }).addTo(powairMap);

            powairMap.invalidateSize(); // Ajoutez cette ligne
        
            console.log("Carte Leaflet initialisée.");

            // --- Ajout d'un marqueur exemple pour un commerçant ---

            // 1. Coordonnées du commerçant (exemple : Paris)
            const commercantCoords = [48.8566, 2.3522];

            // 2. Contenu HTML pour la popup (vous pouvez le personnaliser)
            const popupContent = `
                <b>Café des Arts (Partenaire)</b><br>
                12 Rue de Rivoli<br>
                75001 Paris<br>
                Batteries disponibles !
            `; // Utilisez des sauts de ligne <br> ou une structure HTML plus complexe

            // 3. Créer le marqueur et lui attacher la popup
            const commercantMarker = L.marker(commercantCoords)
                                      .addTo(powairMap) // Ajoute le marqueur à la carte
                                      .bindPopup(popupContent); // Lie la popup au marqueur

            // Optionnel : Ouvrir la popup par défaut au chargement
            // commercantMarker.openPopup();

            // --- Pour afficher TOUS vos commerçants ---
            // Idéalement, vous auriez une liste (array) de vos commerçants avec leurs coordonnées
            // Exemple : const listeCommercants = [
            //   { nom: "Café des Arts", lat: 48.8566, lon: 2.3522, adresse: "...", statut: "Disponible" },
            //   { nom: "Librairie Page & Plume", lat: 45.7640, lon: 4.8357, adresse: "...", statut: "Bientôt disponible" },
            //   // ... autres commerçants
            // ];
            //
            // Puis vous feriez une boucle sur cette liste :
            // listeCommercants.forEach(commercant => {
            //    const marker = L.marker([commercant.lat, commercant.lon]).addTo(powairMap);
            //    const popupHtml = `<b>${commercant.nom}</b><br>${commercant.adresse}<br>Statut: ${commercant.statut}`;
            //    marker.bindPopup(popupHtml);
            // });
            // --- Fin exemple pour plusieurs commerçants ---

        } catch (error) {
            console.error("Erreur lors de l'initialisation de la carte Leaflet:", error);
            mapElement.innerHTML = "<p style='color: red; text-align: center; padding-top: 50px;'>Impossible de charger la carte. Veuillez réessayer plus tard.</p>";
        }
    }
    // --- Fin Initialisation Carte Leaflet ---


    // --- Gestion Soumission Formulaire Partenaire ---
    const partnerForm = document.getElementById('partner-form');
    const partnerSubmitButton = document.getElementById('partner-submit-button');
    const partnerFormMessage = document.getElementById('partner-form-message');

    // Vérifier si les éléments existent avant d'ajouter l'écouteur
    if (partnerForm && partnerSubmitButton && partnerFormMessage) {
        partnerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêche le rechargement de la page

            // Désactiver le bouton et afficher un message de chargement/réinitialiser
            partnerSubmitButton.disabled = true;
            partnerSubmitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            partnerFormMessage.textContent = ''; // Effacer ancien message
            partnerFormMessage.style.color = 'inherit';

            // Récupérer les données du formulaire
            const formData = new FormData(partnerForm);
            const data = Object.fromEntries(formData.entries()); // Convertit FormData en objet JS simple

            try {
                // Envoyer les données à notre fonction serverless Vercel
                // ATTENTION: Cette partie nécessite toujours une API backend pour fonctionner réellement.
                // Si vous n'avez pas d'API, vous devrez utiliser une autre méthode (mailto, service tiers, etc.)
                const response = await fetch('/api/submit-partner-form', { // L'URL de notre fonction
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Indiquer qu'on envoie du JSON
                    },
                    body: JSON.stringify(data), // Convertir l'objet JS en chaîne JSON
                });

                // Attendre la réponse JSON de la fonctionnnnn
                const result = await response.json();

                if (response.ok) {
                    // Succès (statut 2xx)
                    partnerFormMessage.textContent = result.message || "Merci ! Votre demande a bien été envoyée.";
                    partnerFormMessage.style.color = 'var(--accent-color)'; // Utiliser une couleur du thème
                    partnerForm.reset(); // Vider le formulaire
                    console.log("Formulaire envoyé avec succès:", result);
                } else {
                    // Erreur gérée par le backend (statut 4xx ou 5xx)
                    partnerFormMessage.textContent = result.error || `Erreur ${response.status}: Veuillez réessayer.`;
                    partnerFormMessage.style.color = '#E53E3E'; // Rouge pour l'erreur
                    console.error("Erreur retournée par l'API:", result);
                }

            } catch (error) {
                // Erreur réseau (fetch échoué) ou erreur de parsing JSON
                console.error("Erreur lors de l'envoi du fetch:", error);
                // Afficher un message plus utile si fetch échoue (pas d'API)
                 if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                     partnerFormMessage.textContent = "Erreur: Impossible de contacter le serveur d'API (/api/submit-partner-form). Vérifiez l'URL ou l'état du serveur.";
                 } else {
                     partnerFormMessage.textContent = "Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.";
                 }
                partnerFormMessage.style.color = '#E53E3E'; // Rouge pour l'erreur
            } finally {
                // Réactiver le bouton dans tous les cas (succès ou erreur)
                partnerSubmitButton.disabled = false;
                // Ajuster le texte du bouton selon le formulaire (présent sur les deux pages)
                if (partnerSubmitButton.textContent.includes('ma demande')) {
                    partnerSubmitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer ma demande';
                } else {
                    partnerSubmitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Devenir Partenaire';
                }

            }
        });
    } else {
        console.warn("Éléments du formulaire partenaire non trouvés. La soumission ne sera pas active.");
    }
    // --- Fin Gestion Soumission Formulaire Partenaire ---

}); // Fin de DOMContentLoaded

// --- Fin du Script Principal ---
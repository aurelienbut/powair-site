// script.js

// --- Début du Script Principal ---
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
             // Met à jour la carte si elle existe
             if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined' && document.getElementById('map') && window.currentMapInstance) {
                 const isNowDarkMode = bodyForTheme.classList.contains('dark-mode');
                 window.currentMapInstance.setOptions({ styles: isNowDarkMode ? getDarkMapStyles() : getLightMapStyles() });
                 updateMapMarker(window.currentMapInstance, window.currentMarker);
             }
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
         '.section-title-container, .step, .benefit-card, .map-container, .pricing-card, .download-container, .hero-text, .hero-image, .hero-buttons, .scroll-down, .partners-benefits, .partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card'
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
                    // No need to unobserve for simple fade/slide-in
                }
                // Optionally unobserve if animation should only run once
                // else { entry.target.classList.remove('active'); }
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


     // --- Gestion du Toggle pour la Section Partenaires ---
    const partnerToggleButton = document.querySelector('.partner-toggle-button');
    const partnerHiddenContent = document.querySelector('.partner-hidden-content');
    const hiddenAnimatedElements = partnerHiddenContent ? partnerHiddenContent.querySelectorAll('.partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card') : [];

    if (partnerToggleButton && partnerHiddenContent) {
        partnerToggleButton.addEventListener('click', () => {
            const isVisible = partnerHiddenContent.classList.contains('visible');

            // Re-create observer specifically for hidden elements when needed
            const observerForHidden = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                         entry.target.classList.add('active');
                         // Start counters if stats section becomes visible via toggle
                         if (entry.target.classList.contains('partners-stats') && !countersStarted) {
                             startCounters();
                             countersStarted = true; // Mark as started globally
                         }
                     }
                 });
               }, { threshold: 0.1 }) : null;

            if (isVisible) {
                partnerHiddenContent.classList.remove('visible');
                partnerToggleButton.innerHTML = '<i class="fas fa-plus-circle"></i> En savoir plus sur le partenariat';
                partnerToggleButton.setAttribute('aria-expanded', 'false');
                // Optional: Disconnect observer for hidden elements if created
            } else {
                partnerHiddenContent.classList.add('visible');
                partnerToggleButton.innerHTML = '<i class="fas fa-minus-circle"></i> Réduire';
                partnerToggleButton.setAttribute('aria-expanded', 'true');

                 // If stats are inside hidden and not started, attempt to start
                 if (!countersStarted && partnerHiddenContent.contains(document.querySelector('.partners-stats'))) {
                     // Use timeout to ensure element is rendered before check
                     setTimeout(() => { startCounters(); countersStarted = true; }, 50);
                 }

                 // Observe newly visible elements or activate them directly
                 if (observerForHidden) {
                     hiddenAnimatedElements.forEach(el => {
                         if (!el.classList.contains('active')) { // Observe only if not already active
                             observerForHidden.observe(el);
                         }
                     });
                 } else {
                     // Fallback: Activate all hidden elements immediately
                     hiddenAnimatedElements.forEach(el => el.classList.add('active'));
                 }

                 // Scroll to the button after revealing content
                 setTimeout(() => {
                     partnerToggleButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                 }, 50); // Small delay to allow layout shift
            }
        });
    }

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
                partnerFormMessage.textContent = "Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.";
                partnerFormMessage.style.color = '#E53E3E'; // Rouge pour l'erreur
            } finally {
                // Réactiver le bouton dans tous les cas (succès ou erreur)
                partnerSubmitButton.disabled = false;
                partnerSubmitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Devenir Partenaire';
            }
        });
    } else {
        console.warn("Éléments du formulaire partenaire non trouvés. La soumission ne sera pas active.");
    }
    // --- Fin Gestion Soumission Formulaire Partenaire ---

// Assurez-vous que ce code est bien AVANT le }); final du bloc DOMContentLoaded
// }); // <-- Fin de l'écouteur DOMContentLoaded (NE PAS COPIER CETTE LIGNE, juste pour indication)


}); // Fin de DOMContentLoaded

// --- Fonctions pour les styles de carte Google Maps ---
// (Ces fonctions sont globales car appelées par le callback Google Maps et le theme switcher)

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

// --- Fonction pour créer/mettre à jour le marqueur ---
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

 function updateMapMarker(mapInstance, markerInstance) {
    if (mapInstance && markerInstance && typeof google !== 'undefined' && google.maps && google.maps.marker) {
        const newContent = createMapMarkerContent();
        // Recrée le marqueur pour appliquer le nouveau contenu/style
        markerInstance.setMap(null); // Supprime l'ancien
        window.currentMarker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstance,
            position: markerInstance.position,
            title: markerInstance.title,
            content: newContent
        });
    }
 }

// --- Fonction pour initialiser la Google Map (globale à cause du callback) ---
async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) { console.error("L'élément #map n'a pas été trouvé."); return; }
    const defaultLocation = { lat: 48.8566, lng: 2.3522 }; // Paris

    try {
        // Attend le chargement des bibliothèques maps et marker
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        const isDarkMode = document.body.classList.contains('dark-mode');

        const map = new Map(mapElement, {
            center: defaultLocation,
            zoom: 12,
            mapId: 'POWAIR_GRADIENT_MAP_ID', // Utilise un Map ID spécifique si tu en as créé un pour ce style
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

        // TODO: Ajouter ici la logique pour charger et afficher les vrais marqueurs depuis tes données
        // Exemple:
        // const locations = [ { lat: 48.86, lng: 2.34, title: "Borne 1"}, ... ];
        // locations.forEach(loc => {
        //    new AdvancedMarkerElement({ map: map, position: loc, title: loc.title, content: createMapMarkerContent() });
        // });

    } catch (error) {
        console.error("Erreur Google Maps:", error);
        if (mapElement) {
            mapElement.innerHTML = '<p style="text-align: center; padding-top: 50px; color: var(--text-light);">Impossible de charger la carte.<br>Vérifiez votre clé API, le Map ID et la console pour les erreurs.</p>';
        }
    }
}
// --- Fin du Script Principal ---
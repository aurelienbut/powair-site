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

    // --- Gestion du Menu Mobil   e ---
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

    // --- HERO CAROUSEL ---
    const heroCarouselElement = document.querySelector('.hero-carousel');
    if (heroCarouselElement) {
        const slides = heroCarouselElement.querySelectorAll('.carousel-slide');
        let currentIndex = 0;
        const totalSlides = slides.length;
        const slideInterval = 1500; // Temps en ms entre chaque slide (3.5 secondes)

        function showSlide(index) {
            if (totalSlides === 0) return;
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            showSlide(currentIndex);
        }

        if (totalSlides > 0) {
            showSlide(currentIndex); // Afficher la première slide immédiatement
            setInterval(nextSlide, slideInterval);
             // Activer l'animation d'apparition du carrousel lui-même
            setTimeout(() => {
                heroCarouselElement.classList.add('active');
            }, 200); // Léger délai pour que ça s'anime après le texte
        }
    }

    // S'assurer que le code d'animation d'apparition pour .hero-text et .hero-buttons est toujours là.
    // Si vous avez déplacé .hero-image, assurez-vous que la classe .active est ajoutée au .hero-carousel
    // au bon moment pour l'animation d'entrée.

    const heroText = document.querySelector('.hero-text');
    const heroButtons = document.querySelector('.hero-buttons');
    // const heroImage = document.querySelector('.hero-image'); // L'ancien est supprimé

    if (heroText) heroText.classList.add('active');
    if (heroButtons) heroButtons.classList.add('active');

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
        '.section-title-container, .step, .benefit-card, .pricing-card, .download-container, .hero-text, .hero-image, .map-container, .hero-buttons, .scroll-down, .partners-benefits, .partners-stats, .partners-testimonials, .partner-process, .partner-contact-form, .partner-brands, .partner-card'
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

            powairMap.invalidateSize();

            // Empêcher la perte de focus sur mobile lors de l'interaction avec la carte
if (powairMap) {
    powairMap.on('click', function(e) {
      // Empêcher la perte de focus uniquement si l'écran est petit (mobile)
      if (window.innerWidth <= 768 && document.activeElement === citySearchInput) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        setTimeout(() => {
          citySearchInput.focus();
        }, 10);
      }
    });
  }
  
  
            
           // --- Gestion de l'autocomplétion et géolocalisation ---
const citySearchInput = document.getElementById('city-search');
const searchButton = document.getElementById('search-button');
const searchSuggestions = document.getElementById('search-suggestions');
let debounceTimer;
let currentHighlight = -1;

if (citySearchInput && searchButton && searchSuggestions && powairMap) {
  // Fonction pour ajouter l'option de géolocalisation
  const addLocationOption = () => {
    const locationOption = document.createElement('div');
    locationOption.className = 'suggestion-item location-option';
    locationOption.innerHTML = `
      <i class="fas fa-location-arrow"></i>
      <span>Ma localisation actuelle</span>
    `;
    
    locationOption.addEventListener('click', () => {
      // Fermer les suggestions
      searchSuggestions.classList.remove('active');
      citySearchInput.value = '';
      
      // Vérifier si la géolocalisation est disponible
      if (navigator.geolocation) {
        // Animation de chargement dans le champ
        citySearchInput.value = 'Localisation en cours...';
        citySearchInput.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchButton.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
          // Succès
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Centrer la carte sur la position de l'utilisateur
            powairMap.setView([latitude, longitude], 15, {
              animate: true,
              duration: 1.5
            });
            
            // Ajouter un marqueur pour la position de l'utilisateur
            // Supprimer l'ancien marqueur utilisateur s'il existe
            powairMap.eachLayer(layer => {
              if (layer._icon && layer._icon.classList.contains('user-location-marker')) {
                powairMap.removeLayer(layer);
              }
            });
            
            const userMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-location-pulse"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(powairMap);
            
            // Ajouter un style pour le marqueur utilisateur s'il n'existe pas déjà
            if (!document.getElementById('user-location-style')) {
              const style = document.createElement('style');
              style.id = 'user-location-style';
              style.textContent = `
                .user-location-marker {
                  background-color: var(--accent-color);
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                }
                .user-location-pulse {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  background-color: var(--accent-color);
                  opacity: 0.4;
                  animation: user-location-pulse 2s infinite;
                }
                @keyframes user-location-pulse {
                  0% { transform: scale(1); opacity: 0.4; }
                  70% { transform: scale(3); opacity: 0; }
                  100% { transform: scale(1); opacity: 0; }
                }
              `;
              document.head.appendChild(style);
            }
            
            citySearchInput.value = '';
            citySearchInput.disabled = false;
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
            
            // Obtenir le nom de la ville par reverse geocoding
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
              .then(response => response.json())
              .then(data => {
                const city = data.address.city || data.address.town || data.address.village || '';
                if (city) {
                  citySearchInput.value = city;
                }
              })
              .catch(error => console.error("Erreur de reverse geocoding:", error));
          },
          // Erreur
          (error) => {
            console.error("Erreur de géolocalisation:", error);
            
            citySearchInput.value = '';
            citySearchInput.disabled = false;
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
            
            // Message d'erreur
            let errorMsg = 'Impossible d\'obtenir votre position';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = 'Accès refusé à la géolocalisation';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = 'Position indisponible';
                break;
              case error.TIMEOUT:
                errorMsg = 'Délai de recherche dépassé';
                break;
            }
            
            // Afficher temporairement le message d'erreur dans le champ
            citySearchInput.value = errorMsg;
            setTimeout(() => {
              citySearchInput.value = '';
            }, 3000);
          },
          // Options
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        // Navigateur ne supporte pas la géolocalisation
        citySearchInput.value = 'Géolocalisation non supportée';
        setTimeout(() => {
          citySearchInput.value = '';
        }, 3000);
      }
    });
    
    return locationOption;
  };
  
  // Fonction pour récupérer les suggestions de villes
  const fetchCitySuggestions = async (query) => {
    if (!query.trim() || query.length < 2) return [];
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=5`);
      const data = await response.json();
      
      // Transformer les données pour notre affichage
      return data.map(item => ({
        name: item.display_name.split(',')[0],
        fullAddress: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche de suggestions:", error);
      return [];
    }
  };
  
  // Afficher les suggestions
  const showSuggestions = (suggestions) => {
    // Vider les suggestions actuelles
    searchSuggestions.innerHTML = '';
    
    // Ajouter l'option de géolocalisation
    searchSuggestions.appendChild(addLocationOption());
    
    // Si c'est juste pour montrer l'option de géolocalisation (focus initial)
    if (!suggestions) {
      searchSuggestions.classList.add('active');
      return;
    }
    
    // Ajouter les suggestions de villes
    if (suggestions.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'suggestion-item';
      noResults.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Aucun résultat trouvé</span>
      `;
      searchSuggestions.appendChild(noResults);
    } else {
      suggestions.forEach((suggestion, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.setAttribute('data-index', index);
        suggestionItem.innerHTML = `
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <div class="suggestion-main">${suggestion.name}</div>
            <div class="suggestion-secondary">${suggestion.fullAddress}</div>
          </div>
        `;
        
        suggestionItem.addEventListener('click', () => {
          // Fermer les suggestions
          searchSuggestions.classList.remove('active');
          
          // Mettre à jour le champ de recherche
          citySearchInput.value = suggestion.name;
          
          // Centrer la carte sur la ville
          powairMap.setView([suggestion.lat, suggestion.lon], 13, {
            animate: true,
            duration: 1.5
          });
        });
        
        searchSuggestions.appendChild(suggestionItem);
      });
    }
    
    // Montrer les suggestions
    searchSuggestions.classList.add('active');
    currentHighlight = -1;
  };
  
  // Afficher l'option de géolocalisation dès que l'utilisateur clique sur le champ
  citySearchInput.addEventListener('focus', () => {
    // Si le champ est vide, montrer juste l'option de géolocalisation
    if (!citySearchInput.value.trim()) {
      showSuggestions(null); // Passer null indique qu'on veut juste l'option de géolocalisation
    }
  });
  
  // Gérer l'input de recherche avec debounce
  citySearchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    // Nettoyer le timer précédent
    clearTimeout(debounceTimer);
    
    // Si le champ est vide, afficher juste l'option de géolocalisation
    if (!query.trim()) {
      showSuggestions(null);
      return;
    }
    
    // Montrer un loader
    searchSuggestions.innerHTML = `
      <div class="suggestion-loader">
        <i class="fas fa-spinner fa-spin"></i>
        <span style="margin-left: 10px;">Recherche en cours...</span>
      </div>
    `;
    searchSuggestions.classList.add('active');
    
    // Debounce pour éviter trop de requêtes
    debounceTimer = setTimeout(async () => {
      if (query.trim().length < 2) {
        showSuggestions(null);
        return;
      }
      
      const suggestions = await fetchCitySuggestions(query);
      showSuggestions(suggestions);
    }, 300);
  });
  
  // Fermer les suggestions si on clique ailleurs
  document.addEventListener('click', (e) => {
    if (!citySearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.classList.remove('active');
    }
  });
  
  // Navigation au clavier dans les suggestions
  citySearchInput.addEventListener('keydown', (e) => {
    const items = searchSuggestions.querySelectorAll('.suggestion-item');
    
    if (items.length === 0) return;
    
    // Flèche du bas
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!searchSuggestions.classList.contains('active')) {
        searchSuggestions.classList.add('active');
        currentHighlight = -1;
      }
      
      currentHighlight = (currentHighlight + 1) % items.length;
      updateHighlight(items);
    }
    
    // Flèche du haut
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!searchSuggestions.classList.contains('active')) {
        searchSuggestions.classList.add('active');
        currentHighlight = 0;
      }
      
      currentHighlight = (currentHighlight - 1 + items.length) % items.length;
      updateHighlight(items);
    }
    
    // Touche Entrée
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchSuggestions.classList.contains('active') && currentHighlight >= 0) {
        items[currentHighlight].click();
      } else {
        // Si pas de suggestion sélectionnée, lancer la recherche normale
        searchCity(citySearchInput.value);
      }
    }
    
    // Échap
    if (e.key === 'Escape') {
      searchSuggestions.classList.remove('active');
    }
  });
  
  // Fonction pour mettre à jour la mise en surbrillance des suggestions
  const updateHighlight = (items) => {
    items.forEach((item, index) => {
      if (index === currentHighlight) {
        item.classList.add('highlighted');
        // Faire défiler vers l'élément surligné si nécessaire
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
      }
    });
  };
  
  // Fonction pour rechercher et centrer la carte sur une ville
  const searchCity = async (cityName) => {
    if (!cityName.trim()) return;
    
    try {
      // Animation de chargement sur le bouton
      searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      searchButton.disabled = true;
      
      // Utiliser l'API Nominatim pour la recherche
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}, France&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // Centrer la carte sur la ville trouvée
        powairMap.setView([lat, lon], 13, {
          animate: true,
          duration: 1.5
        });
      } else {
        // Ajouter un feedback visuel si la ville n'est pas trouvée
        citySearchInput.classList.add('not-found');
        setTimeout(() => {
          citySearchInput.classList.remove('not-found');
        }, 800);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la ville:", error);
    } finally {
      // Restaurer le bouton
      searchButton.innerHTML = '<i class="fas fa-search"></i>';
      searchButton.disabled = false;
    }
  };

  // Événement au clic sur le bouton de recherche
  searchButton.addEventListener('click', () => {
    searchCity(citySearchInput.value);
    searchSuggestions.classList.remove('active');
  });
  
  // Ajouter un style pour le feedback "ville non trouvée"
  const style = document.createElement('style');
  style.textContent = `
    .map-search-input.not-found {
      animation: shake 0.4s ease-in-out;
      background-color: rgba(239, 68, 68, 0.1);
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
    }
  `;
  document.head.appendChild(style);
}
        
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
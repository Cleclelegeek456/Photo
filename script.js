/**
 * Julie Photographie - Portfolio Website
 * Script JavaScript pour les interactions
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // BOUTON CTA "Découvrez mon travail"
    // ============================
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll vers la section "Échantillon de travail"
            const workSection = document.querySelector('.work-samples');
            if (workSection) {
                workSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // ============================
    // ANIMATION AU SCROLL (optionnel)
    // ============================
    // Observer pour détecter quand les éléments entrent dans le viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Animation au défilement (reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden');
            }
        });
    }, observerOptions);

    // Marquer les éléments comme cachés au départ
    document.querySelectorAll('section, header').forEach(el => el.classList.add('hidden'));
    // Observer tous les éléments cachés
    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
    
    // ============================
    // GESTION DES IMAGES
    // ============================
    // Vérifier que toutes les images sont bien chargées
    const images = document.querySelectorAll('img');
    let imagesLoaded = 0;
    
    images.forEach(img => {
        if (img.complete) {
            imagesLoaded++;
        } else {
            img.addEventListener('load', function() {
                imagesLoaded++;
                checkAllImagesLoaded();
            });
            
            img.addEventListener('error', function() {
                console.warn(`Image non chargée: ${this.src}`);
                imagesLoaded++;
                checkAllImagesLoaded();
            });
        }
    });
    
    function checkAllImagesLoaded() {
        if (imagesLoaded === images.length) {
            console.log('Toutes les images sont chargées');
            document.body.classList.add('images-loaded');
        }
    }
    
    // Vérification initiale
    if (imagesLoaded === images.length) {
        document.body.classList.add('images-loaded');
    }

    // Masquer le préloader quand toutes les images sont chargées
    function hidePreloaderIfReady() {
        if (document.body.classList.contains('images-loaded')) {
            const pre = document.getElementById('preloader');
            if (pre) {
                pre.style.opacity = '0';
                pre.style.pointerEvents = 'none';
                setTimeout(() => pre.remove(), 600);
            }
        }
    }

    // appeler après chaque image chargée
    function checkAllImagesLoaded() {
        if (imagesLoaded === images.length) {
            document.body.classList.add('images-loaded');
            hidePreloaderIfReady();
        }
    }
    
    // ============================
    // SMOOTH SCROLL pour les ancres
    // ============================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Parallax disabled per user request (no moving palms)
    // Old parallax code removed to keep decorative elements static.
    
    // Animation au survol des images
    document.querySelectorAll('.images img').forEach((img) => {
        img.addEventListener('mouseover', () => {
            img.style.transform = 'scale(1.2)';
        });
        img.addEventListener('mouseout', () => {
            img.style.transform = 'scale(1)';
        });
    });

    // Soumettre le formulaire de contact (frontend uniquement)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // utilitaires pour stocker le journal localement
        const LOG_KEY = 'julie_contact_log_v1';

        function getLog() {
            try {
                const raw = localStorage.getItem(LOG_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        }

        function saveLog(entries) {
            try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (e) { console.warn('Impossible de sauvegarder le log', e); }
        }

        function renderLog() {
            const container = document.getElementById('contact-log-content');
            if (!container) return;
            const entries = getLog();
            if (entries.length === 0) {
                container.textContent = 'Aucun message enregistré.';
                return;
            }
            container.textContent = entries.map((it, i) => {
                return `--- Message #${i+1} ---\nDate: ${it.date}\nNom: ${it.name}\nEmail: ${it.email}\n\n${it.message}\n`;
            }).join('\n');
        }

        function exportLogFile() {
            const entries = getLog();
            const text = entries.map((it, i) => {
                return `--- Message #${i+1} ---\nDate: ${it.date}\nNom: ${it.name}\nEmail: ${it.email}\n\n${it.message}\n`;
            }).join('\n');
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `julie_contacts_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = (contactForm.querySelector('#name') || {}).value || '';
            const email = (contactForm.querySelector('#email') || {}).value || '';
            const message = (contactForm.querySelector('#message') || {}).value || '';
            const now = new Date();

            const entry = { date: now.toLocaleString(), name, email, message };
            const entries = getLog();
            entries.push(entry);
            saveLog(entries);

            // afficher confirmation
            const confirmMsg = document.createElement('div');
            confirmMsg.className = 'contact-confirm';
            confirmMsg.textContent = 'Merci — votre message a été enregistré.';
            contactForm.parentNode.insertBefore(confirmMsg, contactForm);
            setTimeout(() => { confirmMsg.style.opacity = '0'; confirmMsg.remove(); }, 4000);

            // mettre à jour le panneau de log si ouvert
            const logEl = document.getElementById('contact-log');
            if (logEl && !logEl.hidden) renderLog();

            contactForm.reset();
        });

        // gestion du panneau d'administration local
        const viewBtn = document.getElementById('view-log');
        const exportBtn = document.getElementById('export-log');
        const logPanel = document.getElementById('contact-log');
        const closeBtn = logPanel && logPanel.querySelector('.close-log');

        if (viewBtn && logPanel) {
            viewBtn.addEventListener('click', () => {
                logPanel.hidden = !logPanel.hidden;
                if (!logPanel.hidden) renderLog();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportLogFile());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => { logPanel.hidden = true; });
        }
    }
    // ============================
    // FERMER / MASQUER LE LOGO CENTRAL (plus robuste)
    // ============================
    const LOGO_HIDE_KEY = 'julie_logo_hidden_v1';
    const closeLogoBtn = document.getElementById('close-logo');
    const hideFixed = document.getElementById('hide-logo-fixed');
    const toggleBtn = document.getElementById('toggle-logo');
    const heroHeader = document.querySelector('header.hero');

    function hideLogo() {
        // cacher le logo central et le logo dans la nav
        document.querySelectorAll('.logo-centered, .nav-logo img').forEach(el => {
            if (el) el.style.display = 'none';
        });
        try { localStorage.setItem(LOGO_HIDE_KEY, '1'); } catch (e) {}
        if (toggleBtn) toggleBtn.textContent = 'Réafficher logo';
    }

    function restoreLogo() {
        document.querySelectorAll('.logo-centered, .nav-logo img').forEach(el => {
            if (el) el.style.display = '';
        });
        try { localStorage.removeItem(LOGO_HIDE_KEY); } catch (e) {}
        if (toggleBtn) toggleBtn.textContent = 'Masquer logo';
    }

    // appliquer l'état sauvegardé
    try {
        if (localStorage.getItem(LOGO_HIDE_KEY) === '1') hideLogo();
    } catch (e) {}

    if (closeLogoBtn) closeLogoBtn.addEventListener('click', hideLogo);
    if (hideFixed) hideFixed.addEventListener('click', hideLogo);
    if (toggleBtn) {
        // set initial label
        try {
            if (localStorage.getItem(LOGO_HIDE_KEY) === '1') toggleBtn.textContent = 'Réafficher logo';
            else toggleBtn.textContent = 'Masquer logo';
        } catch (e) {}
        toggleBtn.addEventListener('click', () => {
            const hidden = localStorage.getItem(LOGO_HIDE_KEY) === '1';
            if (hidden) restoreLogo(); else hideLogo();
        });
    }
    console.log('Julie Photographie - Site web chargé avec succès');
});

// ============================
// FONCTIONS UTILITAIRES
// ============================

/**
 * Fonction pour créer un effet de fade-in sur un élément
 * @param {HTMLElement} element - L'élément à animer
 * @param {number} duration - Durée de l'animation en ms
 */
function fadeIn(element, duration = 600) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

/**
 * Fonction pour détecter si un élément est visible dans le viewport
 * @param {HTMLElement} element - L'élément à vérifier
 * @returns {boolean}
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

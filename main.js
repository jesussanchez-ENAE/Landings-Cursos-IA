// Dynamic Scroll Effects (Viewport top and bottom gradient blur masks)
const initScrollEffects = () => {
    const nav = document.querySelector('.nav');
    
    // 1. Inject the viewport edge blur overlays dynamically if they don't exist
    if (!document.querySelector('.scroll-blur-mask')) {
        const topMask = document.createElement('div');
        topMask.className = 'scroll-blur-mask scroll-blur-mask-top';
        
        const bottomMask = document.createElement('div');
        bottomMask.className = 'scroll-blur-mask scroll-blur-mask-bottom';
        
        document.body.appendChild(topMask);
        document.body.appendChild(bottomMask);
    }

    // 2. Cache section offsets and background colors to prevent layout thrashing on scroll
    let sectionsCache = [];
    const cacheSections = () => {
        const sections = document.querySelectorAll('header, section, footer');
        sectionsCache = Array.from(sections).map(sec => {
            const style = window.getComputedStyle(sec);
            let bg = style.backgroundColor;
            
            // Resolve transparent background or gradient fallbacks
            if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
                const isLight = sec.classList.contains('section-light') || sec.style.background.includes('#f2efe8');
                bg = isLight ? '#f2efe8' : '#000000';
            }
            
            return {
                el: sec,
                bg: bg
            };
        });
    };

    // Initialize cache and update on resize/load to keep offsets perfect
    cacheSections();
    window.addEventListener('resize', cacheSections, { passive: true });
    window.addEventListener('load', cacheSections, { passive: true });

    // 3. Main scroll execution
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // A. Toggle sticky navbar scrolling style
        if (nav) {
            if (scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
        
        // B. Dynamic Background-Color Matching for Edge Overlays
        // Calculate vertical positions corresponding to the middle of the top and bottom masks
        const topPoint = scrollY + 40;
        const bottomPoint = scrollY + windowHeight - 40;
        
        let topBg = '#000000';
        let bottomBg = '#000000';
        
        // Find matching background colors from cached offsets
        for (let i = 0; i < sectionsCache.length; i++) {
            const sec = sectionsCache[i];
            const elTop = sec.el.offsetTop;
            const elBottom = elTop + sec.el.offsetHeight;
            
            if (topPoint >= elTop && topPoint <= elBottom) {
                topBg = sec.bg;
            }
            if (bottomPoint >= elTop && bottomPoint <= elBottom) {
                bottomBg = sec.bg;
            }
        }
        
        // Seamlessly update CSS variables
        document.documentElement.style.setProperty('--mask-bg-top', topBg);
        document.documentElement.style.setProperty('--mask-bg-bottom', bottomBg);
    };
    
    // Performance optimization: throttle scroll updates with requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Trigger initially
    handleScroll();
};

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form submission handling
const leadForm = document.getElementById('lead-form');
if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = leadForm.querySelector('button');
        const originalText = button.innerText;
        
        button.innerText = 'PROCESANDO...';
        button.style.opacity = '0.7';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.innerText = '¡REGISTRO COMPLETADO!';
            button.style.backgroundColor = '#28a745';
            button.style.opacity = '1';
            
            // Reset form after delay
            setTimeout(() => {
                leadForm.reset();
                button.innerText = originalText;
                button.style.backgroundColor = 'var(--accent-color)';
                button.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// Interactive Mouse-Tracking Card Glows
const initMouseGlow = () => {
    const cards = document.querySelectorAll('.bento-card, .glass');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
};

// Interactive Vertical Timeline Accordion
const initAccordion = () => {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                items.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle clicked item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
};



// Initialize everything on load

// Interactive Calendar Month Tabs
const initCalendarTabs = () => {
    const tabBtns = document.querySelectorAll('.cal-tab-btn');
    const monthCards = document.querySelectorAll('.cal-month-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const monthTarget = btn.getAttribute('data-month');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            monthCards.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetCard = document.getElementById('month-' + monthTarget);
            if (targetCard) {
                targetCard.classList.add('active');
            }
        });
    });
};

// Course Selection Helper (selects course in form and scrolls to it)
window.selectCourse = (courseCode) => {
    const select = document.getElementById('course-select');
    if (select) {
        select.value = courseCode;
    }
    const formEl = document.getElementById('registro');
    if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        formEl.style.boxShadow = '0 0 40px rgba(168, 23, 48, 0.6)';
        setTimeout(() => {
            formEl.style.boxShadow = '0 40px 100px rgba(0,0,0,0.8)';
        }, 1200);
    }
};


// Progressive Disclosure Toggles
const initProgressiveDisclosure = () => {
    document.querySelectorAll('.disclosure-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                const isOpen = target.classList.contains('open');
                target.classList.toggle('open', !isOpen);
                btn.classList.toggle('open', !isOpen);
                btn.setAttribute('aria-expanded', !isOpen);
            }
        });
    });
};

// Accessible Tab Navigation (Keyboard support)
const initAccessibleTabs = () => {
    const tabList = document.querySelector('.cal-tabs');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('.cal-tab-btn'));
    tabList.setAttribute('role', 'tablist');

    tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', tab.classList.contains('active'));
        tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');

        tab.addEventListener('keydown', (e) => {
            let nextIndex = null;
            if (e.key === 'ArrowRight') {
                nextIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                nextIndex = 0;
            } else if (e.key === 'End') {
                nextIndex = tabs.length - 1;
            }

            if (nextIndex !== null) {
                e.preventDefault();
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
                tabs.forEach((t, i) => {
                    t.setAttribute('tabindex', i === nextIndex ? '0' : '-1');
                    t.setAttribute('aria-selected', i === nextIndex);
                });
            }
        });
    });
};

// ==========================================================================
// ANIME.JS ANIMATION ENGINE (Scroll Reveal, Interactive Choreo & Data Counters)
// ==========================================================================
const initAnimeAnimations = () => {
    // 1. Accessibility Check: respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof anime === 'undefined') {
        // Fallback: Ensure everything is immediately visible and at target height
        document.querySelectorAll('.dossier-bar-fill').forEach(bar => {
            const h = bar.getAttribute('data-height');
            if (h) bar.style.height = `${h}%`;
        });
        return;
    }

    // 2. Generic Counter Animator (supports prefixes, decimals, suffixes)
    const animateCounter = (el) => {
        const rawTarget = el.getAttribute('data-counter');
        if (!rawTarget) return;
        const targetVal = parseFloat(rawTarget);
        if (isNaN(targetVal)) return;

        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = targetVal % 1 !== 0;

        const counterObj = { value: 0 };
        anime({
            targets: counterObj,
            value: targetVal,
            round: isDecimal ? 10 : 1,
            easing: 'easeOutExpo',
            duration: 1600,
            update: () => {
                el.textContent = `${prefix}${isDecimal ? counterObj.value.toFixed(1) : Math.round(counterObj.value)}${suffix}`;
            }
        });
    };

    // 3. Hero Entry Choreography
    const initHeroAnimation = () => {
        const heroBadge = document.querySelector('.hero-badge-box');
        const heroTitle = document.querySelector('.hero h1');
        const heroDesc = document.querySelector('.hero p');
        const heroBadges = document.querySelectorAll('.hero [style*="display: flex; flex-wrap: wrap; gap: 0.8rem;"] > *');
        const heroForm = document.querySelector('.hero-form');

        // Set initial states to prevent flash
        if (heroBadge) heroBadge.style.opacity = '0';
        if (heroTitle) heroTitle.style.opacity = '0';
        if (heroDesc) heroDesc.style.opacity = '0';
        heroBadges.forEach(b => b.style.opacity = '0');
        if (heroForm) heroForm.style.opacity = '0';

        const tl = anime.timeline({
            easing: 'easeOutCubic'
        });

        if (heroBadge) {
            tl.add({
                targets: heroBadge,
                translateY: [-20, 0],
                opacity: [0, 1],
                duration: 700
            });
        }

        if (heroTitle) {
            tl.add({
                targets: heroTitle,
                translateY: [35, 0],
                opacity: [0, 1],
                duration: 900
            }, '-=400');
        }

        if (heroDesc) {
            tl.add({
                targets: heroDesc,
                translateY: [25, 0],
                opacity: [0, 1],
                duration: 750
            }, '-=500');
        }

        if (heroBadges.length) {
            tl.add({
                targets: heroBadges,
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(90),
                duration: 650
            }, '-=400');
        }

        if (heroForm) {
            tl.add({
                targets: heroForm,
                scale: [0.94, 1],
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutExpo'
            }, '-=600');
        }
    };

    // Trigger hero animation smoothly on load
    initHeroAnimation();

    // 4. Dossier Slide 3 Infographic Canvas & Bar Chart
    let slide3Animated = false;
    const animateSlide3 = (canvasEl) => {
        if (slide3Animated) return;
        slide3Animated = true;

        // Abstract Composition Shapes: Scale in with subtle spring
        const shapes = canvasEl.querySelectorAll('.dossier-bg-rect-1, .dossier-bg-rect-2, .dossier-cloud-art, .dossier-bg-rect-3');
        if (shapes.length) {
            anime({
                targets: shapes,
                scale: [0.85, 1],
                opacity: [0, 1],
                duration: 1100,
                delay: anime.stagger(120),
                easing: 'easeOutCubic'
            });
        }

        // Connecting Lines: Draw with origin scaling
        const vLines = canvasEl.querySelectorAll('.dossier-line-v1, .dossier-line-v2');
        if (vLines.length) {
            vLines.forEach(l => l.style.transformOrigin = 'top center');
            anime({
                targets: vLines,
                scaleY: [0, 1],
                opacity: [0, 1],
                duration: 750,
                delay: 250,
                easing: 'easeInOutQuad'
            });
        }

        const hLines = canvasEl.querySelectorAll('.dossier-line-h1, .dossier-line-h2');
        if (hLines.length) {
            hLines.forEach(l => l.style.transformOrigin = 'left center');
            anime({
                targets: hLines,
                scaleX: [0, 1],
                opacity: [0, 1],
                duration: 750,
                delay: 250,
                easing: 'easeInOutQuad'
            });
        }

        // White Guide Dots: Elastic pop
        const dots = canvasEl.querySelectorAll('.dossier-dot-v1, .dossier-dot-v2, .dossier-dot-h1, .dossier-dot-h2');
        if (dots.length) {
            anime({
                targets: dots,
                scale: [0, 1.4, 1],
                opacity: [0, 1],
                duration: 650,
                delay: 450,
                easing: 'easeOutElastic(1, .6)'
            });
        }

        // Data Counters (88%, 78M, +30%, x2, $312B)
        const counters = canvasEl.querySelectorAll('[data-counter]');
        counters.forEach((el, index) => {
            setTimeout(() => {
                animateCounter(el);
            }, 100 + index * 90);
        });

        // Node Descriptions: Fade & rise
        const descs = canvasEl.querySelectorAll('.dossier-text-top, .dossier-text-left, .dossier-text-right, .dossier-text-bottom');
        if (descs.length) {
            anime({
                targets: descs,
                translateY: [15, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(100, { start: 350 }),
                easing: 'easeOutQuad'
            });
        }

        // Bar Chart Bars Growth
        const bars = canvasEl.querySelectorAll('.dossier-bar-fill');
        bars.forEach((bar, i) => {
            const targetHeight = bar.getAttribute('data-height') || 50;
            bar.style.height = '0%';
            anime({
                targets: bar,
                height: ['0%', `${targetHeight}%`],
                duration: 1300,
                delay: 300 + (i * 120),
                easing: 'easeOutQuart'
            });
        });
    };

    // 5. Section-Based Observer for Scroll Revelations
    const sectionObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = entry.target;

            // A. Contexto Slide 3
            if (target.id === 'contexto' || target.querySelector('.dossier-slide-canvas')) {
                const canvas = target.querySelector('.dossier-slide-canvas') || target;
                animateSlide3(canvas);
                obs.unobserve(target);
            }

            // B. Course Cards Section
            else if (target.id === 'cursos') {
                const cards = target.querySelectorAll('.portfolio-course-card');
                if (cards.length) {
                    anime({
                        targets: cards,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        scale: [0.97, 1],
                        duration: 850,
                        delay: anime.stagger(160),
                        easing: 'easeOutCubic'
                    });
                }
                obs.unobserve(target);
            }

            // C. Itinerario / Pathway Steps
            else if (target.id === 'itinerario') {
                const steps = target.querySelectorAll('.pathway-step');
                if (steps.length) {
                    anime({
                        targets: steps,
                        translateX: [-40, 0],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(140),
                        easing: 'easeOutCubic'
                    });
                }
                obs.unobserve(target);
            }

            // D. Docentes / Teachers
            else if (target.id === 'profesores') {
                const teachers = target.querySelectorAll('.teacher-card');
                if (teachers.length) {
                    anime({
                        targets: teachers,
                        translateY: [40, 0],
                        scale: [0.95, 1],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(130),
                        easing: 'easeOutCubic'
                    });
                }
                obs.unobserve(target);
            }

            // E. Inversión & Comparativa
            else if (target.id === 'inversion') {
                const elements = target.querySelectorAll('.pricing-hero-card, .matrix-container, .pricing-card-col');
                if (elements.length) {
                    anime({
                        targets: elements,
                        translateY: [35, 0],
                        opacity: [0, 1],
                        duration: 850,
                        delay: anime.stagger(150),
                        easing: 'easeOutCubic'
                    });
                }
                obs.unobserve(target);
            }

            // F. Calendario
            else if (target.id === 'calendario') {
                const calElements = target.querySelectorAll('.cal-tabs, .cal-month-card.active, .cal-legend');
                if (calElements.length) {
                    anime({
                        targets: calElements,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(120),
                        easing: 'easeOutCubic'
                    });
                }
                obs.unobserve(target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all key sections
    document.querySelectorAll('#contexto, #cursos, #itinerario, #calendario, #profesores, #inversion').forEach(sec => {
        sectionObserver.observe(sec);
    });
};

const initAll = () => {
    initProgressiveDisclosure();
    initAccessibleTabs();
    initCalendarTabs();
    initScrollEffects();
    initMouseGlow();
    initAccordion();

    // Navbar mobile toggle
    const toggleBtn = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggleBtn && navLinks) {
        const toggleMenu = (forceClose = false) => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            const shouldOpen = forceClose ? false : !isExpanded;
            
            toggleBtn.setAttribute('aria-expanded', shouldOpen);
            toggleBtn.setAttribute('aria-label', shouldOpen ? 'Cerrar menú' : 'Abrir menú');
            
            if (shouldOpen) {
                navLinks.classList.add('active');
            } else {
                navLinks.classList.remove('active');
            }
        };

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                toggleMenu(true);
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(true);
            });
        });
    }

    // Initialize Anime.js animations
    initAnimeAnimations();
};

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

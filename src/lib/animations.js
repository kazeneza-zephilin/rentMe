import gsap from "gsap";

// Animation presets
export const animations = {
    fadeIn: (element, duration = 0.6, delay = 0) => {
        gsap.fromTo(
            element,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration, delay, ease: "power2.out" }
        );
    },

    slideInLeft: (element, duration = 0.6, delay = 0) => {
        gsap.fromTo(
            element,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration, delay, ease: "power2.out" }
        );
    },

    slideInRight: (element, duration = 0.6, delay = 0) => {
        gsap.fromTo(
            element,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration, delay, ease: "power2.out" }
        );
    },

    scaleIn: (element, duration = 0.6, delay = 0) => {
        gsap.fromTo(
            element,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration, delay, ease: "back.out(1.7)" }
        );
    },

    staggerFadeIn: (elements, stagger = 0.1) => {
        gsap.fromTo(
            elements,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger, ease: "power2.out" }
        );
    },

    heroAnimation: (element) => {
        const tl = gsap.timeline();
        tl.fromTo(
            element.querySelector(".hero-title"),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        )
            .fromTo(
                element.querySelector(".hero-subtitle"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
                "-=0.4"
            )
            .fromTo(
                element.querySelector(".hero-cta"),
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
                "-=0.2"
            );
        return tl;
    },

    cardHover: (element) => {
        gsap.to(element, {
            y: -10,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
            boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        });
    },

    cardHoverOut: (element) => {
        gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        });
    },

    pageTransition: (element) => {
        return gsap.fromTo(
            element,
            { opacity: 0, x: 100 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
        );
    },
};

// Utility to animate elements on scroll
export const animateOnScroll = (selector, animation = "fadeIn") => {
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animations[animation](entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
};

export default animations;

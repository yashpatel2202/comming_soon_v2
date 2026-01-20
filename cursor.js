
// Custom Cursor Logic
document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    // Background Elements for Parallax
    const orb1 = document.getElementById('orb1');
    const orb2 = document.getElementById('orb2');
    const orb3 = document.getElementById('orb3');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Custom Cursor Logic
        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with slight delay
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });

        // ---------------------------------------------
        // COOL PARALLAX EFFECTS
        // ---------------------------------------------
        // Calculate normalized mouse position (-1 to 1)
        const x = (posX / window.innerWidth) - 0.5;
        const y = (posY / window.innerHeight) - 0.5;

        // Move Orbs (Inverse direction for depth)
        if(orb1) orb1.style.transform = `translate(${x * -60}px, ${y * -60}px)`;
        if(orb2) orb2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
        if(orb3) orb3.style.transform = `translate(${x * 100}px, ${y * 100}px)`; // Moves with mouse (foreground feel)


    });

    // Hover effects for links/buttons
    const interactiveElements = document.querySelectorAll('a, button, .work-item');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
});

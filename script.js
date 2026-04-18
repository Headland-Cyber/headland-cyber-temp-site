const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const logoDark = document.getElementById('logo-dark');
const logoLight = document.getElementById('logo-light');
const heroLogoDark = document.getElementById('hero-logo-dark');
const heroLogoLight = document.getElementById('hero-logo-light');
const htmlElement = document.documentElement;

function updateVisuals(theme) {
    const darkEls = [logoDark, heroLogoDark];
    const lightEls = [logoLight, heroLogoLight];

    if (theme === 'light') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        darkEls.forEach(el => el.classList.add('hidden'));
        lightEls.forEach(el => el.classList.remove('hidden'));
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        darkEls.forEach(el => el.classList.remove('hidden'));
        lightEls.forEach(el => el.classList.add('hidden'));
    }
}

function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
        htmlElement.classList.remove('dark');
        document.body.classList.replace('bg-navy', 'bg-[#f0f4f8]');
        document.body.classList.replace('text-[#ccd6f6]', 'text-[#1a365d]');
    } else {
        htmlElement.classList.add('dark');
        document.body.classList.replace('bg-[#f0f4f8]', 'bg-navy');
        document.body.classList.replace('text-[#1a365d]', 'text-[#ccd6f6]');
    }
    updateVisuals(theme);
    localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
    }
});

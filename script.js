const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const htmlElement = document.documentElement;

function updateIcons(theme) {
    if (theme === 'light') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
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
    updateIcons(theme);
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

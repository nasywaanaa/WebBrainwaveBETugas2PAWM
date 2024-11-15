let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - index) * 100}%)`;
    });

    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
}

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        currentIndex = i;
        showSlide(currentIndex);
    });
});

showSlide(currentIndex);

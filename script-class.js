// ========================================
// ВЕРСІЯ НА КЛАСАХ З КОНФІГУРАЦІЄЮ
// ========================================

/**
 * Конфігурація слайдера за замовчуванням
 */
const DEFAULT_CONFIG = {
    // Селектори
    containerSelector: '.slider-container',
    slideSelector: '.slide',

    // Автопрогортування
    autoPlay: true,
    autoPlayDelay: 3000,
    pauseOnHover: true,
    pauseOnInteraction: true,

    // Елементи управління
    showNavigation: true,
    showIndicators: true,
    showControls: true,

    // Навігація
    enableKeyboard: true,
    enableTouch: true,
    enableMouseDrag: true,

    // Анімація
    transitionDuration: 500,
    swipeThreshold: 0.2, // 20% ширини контейнера

    // Додаткові налаштування
    loop: true,
    startSlide: 0,

    // Callback функції
    onSlideChange: null,
    onInit: null,
    onDestroy: null
};

/**
 * Базовий клас слайдера
 */
class Slider {
    constructor(config = {}) {
        // Об'єднуємо конфігурацію користувача з конфігурацією за замовчуванням
        this.config = { ...DEFAULT_CONFIG, ...config };

        // DOM елементи
        this.container = null;
        this.sliderTrack = null;
        this.slides = [];
        this.navButtons = {
            prev: null,
            next: null
        };
        this.indicators = [];
        this.controlButton = null;

        // Стан слайдера
        this.currentSlide = this.config.startSlide;
        this.totalSlides = 0;
        this.isAutoPlaying = this.config.autoPlay;
        this.autoPlayInterval = null;
        this.isInitialized = false;

        // Ініціалізація
        this.init();
    }

    /**
     * Ініціалізація слайдера
     */
    init() {
        // Знаходимо контейнер
        this.container = document.querySelector(this.config.containerSelector);

        if (!this.container) {
            console.error(`Slider container "${this.config.containerSelector}" not found!`);
            return;
        }

        // Створюємо структуру
        this.createStructure();

        // Динамічно створюємо елементи управління
        this.createControls();

        // Додаємо обробники подій
        this.attachEventListeners();

        // Встановлюємо початковий стан
        this.updateSlider();

        // Запускаємо автопрогортування
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }

        // Позначаємо як ініціалізований
        this.isInitialized = true;

        // Викликаємо callback
        if (typeof this.config.onInit === 'function') {
            this.config.onInit(this);
        }

        console.log('Slider initialized with config:', this.config);
    }

    /**
     * Створення базової структури слайдера
     */
    createStructure() {
        // Отримуємо всі слайди
        const existingSlides = this.container.querySelectorAll(this.config.slideSelector);

        // Створюємо slider-track
        this.sliderTrack = document.createElement('div');
        this.sliderTrack.className = 'slider-track';

        // Переміщуємо слайди в track
        existingSlides.forEach(slide => {
            this.sliderTrack.appendChild(slide);
            this.slides.push(slide);
        });

        this.totalSlides = this.slides.length;

        // Очищаємо контейнер і додаємо track
        this.container.innerHTML = '';
        this.container.appendChild(this.sliderTrack);
    }

    /**
     * Динамічне створення всіх елементів управління
     */
    createControls() {
        if (this.config.showNavigation) {
            this.createNavigationButtons();
        }

        if (this.config.showIndicators) {
            this.createIndicators();
        }

        if (this.config.showControls) {
            this.createControlButton();
        }

        // Додаємо інструкції
        this.createInstructions();
    }

    /**
     * Створення кнопок навігації
     */
    createNavigationButtons() {
        // Кнопка "Назад"
        this.navButtons.prev = this.createElement('button', {
            className: 'nav-btn prev-btn',
            ariaLabel: 'Попередній слайд',
            innerHTML: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            `
        });

        // Кнопка "Вперед"
        this.navButtons.next = this.createElement('button', {
            className: 'nav-btn next-btn',
            ariaLabel: 'Наступний слайд',
            innerHTML: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `
        });

        this.container.appendChild(this.navButtons.prev);
        this.container.appendChild(this.navButtons.next);
    }

    /**
     * Створення індикаторів
     */
    createIndicators() {
        const indicatorsContainer = this.createElement('div', {
            className: 'indicators'
        });

        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = this.createElement('span', {
                className: i === this.currentSlide ? 'indicator active' : 'indicator',
                dataset: { slide: i }
            });

            this.indicators.push(indicator);
            indicatorsContainer.appendChild(indicator);
        }

        // Додаємо після контейнера слайдера
        const wrapper = this.container.parentElement;
        if (wrapper) {
            wrapper.appendChild(indicatorsContainer);
        }
    }

    /**
     * Створення кнопки управління (пауза/відтворення)
     */
    createControlButton() {
        const controlsContainer = this.createElement('div', {
            className: 'controls'
        });

        this.controlButton = this.createElement('button', {
            className: 'control-btn pause-btn',
            ariaLabel: 'Пауза/Відновлення',
            innerHTML: `
                <svg class="play-icon ${this.isAutoPlaying ? 'hidden' : ''}" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg class="pause-icon ${this.isAutoPlaying ? '' : 'hidden'}" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <span class="control-text">${this.isAutoPlaying ? 'Пауза' : 'Відновити'}</span>
            `
        });

        controlsContainer.appendChild(this.controlButton);

        const wrapper = this.container.parentElement;
        if (wrapper) {
            wrapper.appendChild(controlsContainer);
        }
    }

    /**
     * Створення інструкцій
     */
    createInstructions() {
        const wrapper = this.container.parentElement;
        if (!wrapper) return;

        const instructions = this.createElement('div', {
            className: 'instructions',
            innerHTML: '<p>💡 Використовуйте <strong>стрілки ←→</strong> на клавіатурі, <strong>свайп</strong> на мобільному або <strong>перетягування мишею</strong></p>'
        });

        wrapper.appendChild(instructions);
    }

    /**
     * Допоміжний метод для створення елементів
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.className) element.className = options.className;
        if (options.innerHTML) element.innerHTML = options.innerHTML;
        if (options.ariaLabel) element.setAttribute('aria-label', options.ariaLabel);
        if (options.dataset) {
            Object.keys(options.dataset).forEach(key => {
                element.dataset[key] = options.dataset[key];
            });
        }

        return element;
    }

    /**
     * Додавання обробників подій
     */
    attachEventListeners() {
        // Навігаційні кнопки
        if (this.navButtons.prev && this.navButtons.next) {
            this.navButtons.prev.addEventListener('click', () => this.prevSlide());
            this.navButtons.next.addEventListener('click', () => this.nextSlide());
        }

        // Кнопка управління
        if (this.controlButton) {
            this.controlButton.addEventListener('click', () => this.toggleAutoPlay());
        }

        // Індикатори
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Клавіатура
        if (this.config.enableKeyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }

        // Пауза при наведенні
        if (this.config.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.handleMouseEnter());
            this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
        }
    }

    /**
     * Навігація: наступний слайд
     */
    nextSlide() {
        if (this.config.loop) {
            this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        } else {
            this.currentSlide = Math.min(this.currentSlide + 1, this.totalSlides - 1);
        }
        this.updateSlider();
        this.resetAutoPlay();
    }

    /**
     * Навігація: попередній слайд
     */
    prevSlide() {
        if (this.config.loop) {
            this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        } else {
            this.currentSlide = Math.max(this.currentSlide - 1, 0);
        }
        this.updateSlider();
        this.resetAutoPlay();
    }

    /**
     * Навігація: перехід до конкретного слайду
     */
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateSlider();
            this.resetAutoPlay();
        }
    }

    /**
     * Оновлення відображення слайдера
     */
    updateSlider() {
        // Оновлюємо позицію
        const translateX = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;

        // Оновлюємо класи активності слайдів
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Оновлюємо індикатори
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        // Викликаємо callback
        if (typeof this.config.onSlideChange === 'function') {
            this.config.onSlideChange(this.currentSlide, this);
        }
    }

    /**
     * Запуск автопрогортування
     */
    startAutoPlay() {
        if (!this.config.autoPlay) return;

        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.autoPlayDelay);
    }

    /**
     * Зупинка автопрогортування
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Перемикання автопрогортування
     */
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;

        const playIcon = this.controlButton.querySelector('.play-icon');
        const pauseIcon = this.controlButton.querySelector('.pause-icon');
        const controlText = this.controlButton.querySelector('.control-text');

        if (this.isAutoPlaying) {
            this.startAutoPlay();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            controlText.textContent = 'Пауза';
        } else {
            this.stopAutoPlay();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            controlText.textContent = 'Відновити';
        }
    }

    /**
     * Скидання автопрогортування
     */
    resetAutoPlay() {
        if (this.isAutoPlaying && this.config.pauseOnInteraction) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }

    /**
     * Обробка клавіатури
     */
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        }
    }

    /**
     * Обробка наведення миші
     */
    handleMouseEnter() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }
    }

    /**
     * Обробка виходу миші
     */
    handleMouseLeave() {
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    /**
     * Знищення слайдера
     */
    destroy() {
        // Зупиняємо автопрогортування
        this.stopAutoPlay();

        // Видаляємо обробники подій
        // (У реальному проєкті тут має бути повне очищення всіх listeners)

        // Викликаємо callback
        if (typeof this.config.onDestroy === 'function') {
            this.config.onDestroy(this);
        }

        this.isInitialized = false;
    }
}


/**
 * Розширений клас з підтримкою тач і драг
 */
class InteractiveSlider extends Slider {
    constructor(config = {}) {
        super(config);

        // Властивості для тач/драг
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        this.currentIndex = this.currentSlide;
    }

    /**
     * Розширюємо attachEventListeners для тач/драг
     */
    attachEventListeners() {
        // Викликаємо батьківський метод
        super.attachEventListeners();

        // Додаємо тач події
        if (this.config.enableTouch) {
            this.container.addEventListener('touchstart', (e) => this.touchStart(e));
            this.container.addEventListener('touchmove', (e) => this.touchMove(e));
            this.container.addEventListener('touchend', () => this.touchEnd());
        }

        // Додаємо події драг
        if (this.config.enableMouseDrag) {
            this.container.addEventListener('mousedown', (e) => this.touchStart(e));
            this.container.addEventListener('mousemove', (e) => this.touchMove(e));
            this.container.addEventListener('mouseup', () => this.touchEnd());
            this.container.addEventListener('mouseleave', () => this.touchEnd());
        }

        // Запобігаємо контекстному меню
        this.container.addEventListener('contextmenu', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    /**
     * Отримання позиції X
     */
    getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    /**
     * Початок тач/драг
     */
    touchStart(event) {
        // Ігноруємо кліки на кнопках
        if (event.target.closest('.nav-btn') ||
            event.target.closest('.control-btn') ||
            event.target.closest('.indicator')) {
            return;
        }

        this.isDragging = true;
        this.startPos = this.getPositionX(event);
        this.animationID = requestAnimationFrame(() => this.animation());
        this.sliderTrack.classList.add('no-transition');

        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }
    }

    /**
     * Рух тач/драг
     */
    touchMove(event) {
        if (!this.isDragging) return;

        const currentPosition = this.getPositionX(event);
        this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
    }

    /**
     * Завершення тач/драг
     */
    touchEnd() {
        if (!this.isDragging) return;

        this.isDragging = false;
        cancelAnimationFrame(this.animationID);

        const movedBy = this.currentTranslate - this.prevTranslate;
        const threshold = this.container.offsetWidth * this.config.swipeThreshold;

        if (movedBy < -threshold && this.currentIndex < this.totalSlides - 1) {
            this.currentIndex += 1;
        }

        if (movedBy > threshold && this.currentIndex > 0) {
            this.currentIndex -= 1;
        }

        this.currentSlide = this.currentIndex;
        this.setPositionByIndex();

        this.sliderTrack.classList.remove('no-transition');

        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    /**
     * Анімація перетягування
     */
    animation() {
        if (this.isDragging) {
            this.setSliderPosition();
            requestAnimationFrame(() => this.animation());
        }
    }

    /**
     * Встановлення позиції слайдера
     */
    setSliderPosition() {
        const containerWidth = this.container.offsetWidth;
        const translateX = this.currentTranslate / containerWidth * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
    }

    /**
     * Встановлення позиції за індексом
     */
    setPositionByIndex() {
        const containerWidth = this.container.offsetWidth;
        this.currentTranslate = this.currentIndex * -containerWidth;
        this.prevTranslate = this.currentTranslate;
        this.updateSlider();
    }

    /**
     * Розширюємо updateSlider
     */
    updateSlider() {
        super.updateSlider();

        // Синхронізуємо індекси
        this.currentIndex = this.currentSlide;
        const containerWidth = this.container.offsetWidth;
        this.prevTranslate = this.currentIndex * -containerWidth;
    }
}


// ========================================
// ІНІЦІАЛІЗАЦІЯ
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // Створюємо інтерактивний слайдер з повною конфігурацією
    const slider = new InteractiveSlider({
        // Основні налаштування
        containerSelector: '.slider-container',
        slideSelector: '.slide',

        // Автопрогортування
        autoPlay: true,
        autoPlayDelay: 3000,
        pauseOnHover: true,
        pauseOnInteraction: true,

        // Відображення елементів
        showNavigation: true,
        showIndicators: true,
        showControls: true,

        // Інтерактивність
        enableKeyboard: true,
        enableTouch: true,
        enableMouseDrag: true,

        // Поведінка
        loop: true,
        startSlide: 0,
        swipeThreshold: 0.2,

        // Callback функції
        onInit: (slider) => {
            console.log('Слайдер ініціалізовано!', slider);
        },
        onSlideChange: (index, slider) => {
            console.log(`Поточний слайд: ${index + 1} з ${slider.totalSlides}`);
        }
    });

    // Експортуємо в глобальну область для налагодження
    window.slider = slider;
});


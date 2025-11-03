// ========================================
// ВЕРСІЯ НА ПРОТОТИПАХ З НАСЛІДУВАННЯМ
// ========================================

/**
 * Базовий конструктор слайдера з основною функціональністю
 * @param {Object} config - Об'єкт конфігурації слайдера
 */
function BaseSlider(config) {
    // Конфігурація з значеннями за замовчуванням
    this.config = {
        containerSelector: '.slider-container',
        slideSelector: '.slide',
        autoPlay: true,
        autoPlayDelay: 3000,
        showNavigation: true,
        showIndicators: true,
        showControls: true,
        enableKeyboard: true,
        pauseOnHover: true,
        ...config
    };
    
    // DOM елементи
    this.container = document.querySelector(this.config.containerSelector);
    if (!this.container) {
        console.error('Slider container not found!');
        return;
    }
    
    this.sliderTrack = null;
    this.slides = [];
    this.prevBtn = null;
    this.nextBtn = null;
    this.indicators = [];
    this.pauseBtn = null;
    
    // Стан слайдера
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.isAutoPlaying = this.config.autoPlay;
    this.autoPlayInterval = null;
    
    // Ініціалізація
    this.init();
}

/**
 * Ініціалізація слайдера
 */
BaseSlider.prototype.init = function() {
    // Створюємо структуру слайдера
    this.createSliderStructure();
    
    // Створюємо елементи управління динамічно
    if (this.config.showNavigation) {
        this.createNavigationButtons();
    }
    
    if (this.config.showIndicators) {
        this.createIndicators();
    }
    
    if (this.config.showControls) {
        this.createControlButtons();
    }
    
    // Додаємо обробники подій
    this.addEventListeners();
    
    // Встановлюємо початковий слайд
    this.updateSlider();
    
    // Запускаємо автопрогортування
    if (this.isAutoPlaying) {
        this.startAutoPlay();
    }
};

/**
 * Створення структури слайдера
 */
BaseSlider.prototype.createSliderStructure = function() {
    // Отримуємо слайди
    const existingSlides = this.container.querySelectorAll(this.config.slideSelector);
    
    // Створюємо slider-track
    this.sliderTrack = document.createElement('div');
    this.sliderTrack.className = 'slider-track';
    
    // Переміщуємо слайди в track
    existingSlides.forEach((slide, index) => {
        this.sliderTrack.appendChild(slide);
        this.slides.push(slide);
    });
    
    this.totalSlides = this.slides.length;
    
    // Очищаємо контейнер і додаємо track
    this.container.innerHTML = '';
    this.container.appendChild(this.sliderTrack);
};

/**
 * Динамічне створення кнопок навігації
 */
BaseSlider.prototype.createNavigationButtons = function() {
    // Кнопка "Назад"
    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'nav-btn prev-btn';
    this.prevBtn.setAttribute('aria-label', 'Попередній слайд');
    this.prevBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;
    
    // Кнопка "Вперед"
    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'nav-btn next-btn';
    this.nextBtn.setAttribute('aria-label', 'Наступний слайд');
    this.nextBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    `;
    
    // Додаємо кнопки в контейнер
    this.container.appendChild(this.prevBtn);
    this.container.appendChild(this.nextBtn);
};

/**
 * Динамічне створення індикаторів
 */
BaseSlider.prototype.createIndicators = function() {
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'indicators';
    
    for (let i = 0; i < this.totalSlides; i++) {
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.setAttribute('data-slide', i);
        
        if (i === 0) {
            indicator.classList.add('active');
        }
        
        this.indicators.push(indicator);
        indicatorsContainer.appendChild(indicator);
    }
    
    // Додаємо контейнер індикаторів після slider-container
    const wrapper = this.container.parentElement;
    if (wrapper) {
        wrapper.appendChild(indicatorsContainer);
    }
};

/**
 * Динамічне створення кнопок управління
 */
BaseSlider.prototype.createControlButtons = function() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls';
    
    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'control-btn pause-btn';
    this.pauseBtn.setAttribute('aria-label', 'Пауза/Відновлення');
    this.pauseBtn.innerHTML = `
        <svg class="play-icon hidden" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span class="control-text">Пауза</span>
    `;
    
    controlsContainer.appendChild(this.pauseBtn);
    
    // Додаємо контейнер управління
    const wrapper = this.container.parentElement;
    if (wrapper) {
        wrapper.appendChild(controlsContainer);
    }
};

/**
 * Додавання обробників подій
 */
BaseSlider.prototype.addEventListeners = function() {
    // Навігаційні кнопки
    if (this.prevBtn && this.nextBtn) {
        this.prevBtn.addEventListener('click', this.prevSlide.bind(this));
        this.nextBtn.addEventListener('click', this.nextSlide.bind(this));
    }
    
    // Кнопка паузи
    if (this.pauseBtn) {
        this.pauseBtn.addEventListener('click', this.toggleAutoPlay.bind(this));
    }
    
    // Індикатори
    this.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Клавіатурна навігація
    if (this.config.enableKeyboard) {
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }
    
    // Пауза при наведенні
    if (this.config.pauseOnHover) {
        this.container.addEventListener('mouseenter', () => {
            if (this.isAutoPlaying) {
                this.pauseAutoPlay();
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            if (this.isAutoPlaying) {
                this.startAutoPlay();
            }
        });
    }
};

/**
 * Наступний слайд
 */
BaseSlider.prototype.nextSlide = function() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlider();
    this.resetAutoPlay();
};

/**
 * Попередній слайд
 */
BaseSlider.prototype.prevSlide = function() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlider();
    this.resetAutoPlay();
};

/**
 * Перехід до конкретного слайду
 */
BaseSlider.prototype.goToSlide = function(index) {
    this.currentSlide = index;
    this.updateSlider();
    this.resetAutoPlay();
};

/**
 * Оновлення відображення слайдера
 */
BaseSlider.prototype.updateSlider = function() {
    // Оновлюємо позицію track
    const translateX = -this.currentSlide * 100;
    this.sliderTrack.style.transform = `translateX(${translateX}%)`;
    
    // Оновлюємо активний слайд
    this.slides.forEach((slide, index) => {
        if (index === this.currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Оновлюємо індикатори
    this.indicators.forEach((indicator, index) => {
        if (index === this.currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
};

/**
 * Запуск автопрогортування
 */
BaseSlider.prototype.startAutoPlay = function() {
    if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
    }
    this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
    }, this.config.autoPlayDelay);
};

/**
 * Пауза автопрогортування
 */
BaseSlider.prototype.pauseAutoPlay = function() {
    if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
    }
};

/**
 * Перемикання автопрогортування
 */
BaseSlider.prototype.toggleAutoPlay = function() {
    this.isAutoPlaying = !this.isAutoPlaying;
    
    const playIcon = this.pauseBtn.querySelector('.play-icon');
    const pauseIcon = this.pauseBtn.querySelector('.pause-icon');
    const controlText = this.pauseBtn.querySelector('.control-text');
    
    if (this.isAutoPlaying) {
        this.startAutoPlay();
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        controlText.textContent = 'Пауза';
    } else {
        this.pauseAutoPlay();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        controlText.textContent = 'Відновити';
    }
};

/**
 * Скидання автопрогортування
 */
BaseSlider.prototype.resetAutoPlay = function() {
    if (this.isAutoPlaying) {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }
};

/**
 * Обробка клавіатурної навігації
 */
BaseSlider.prototype.handleKeyboard = function(e) {
    if (e.key === 'ArrowLeft') {
        this.prevSlide();
    } else if (e.key === 'ArrowRight') {
        this.nextSlide();
    }
};


// ========================================
// РОЗШИРЕННЯ: Тач і Перетягування
// ========================================

/**
 * Конструктор для слайдера з підтримкою тач і перетягування
 * Наслідує BaseSlider
 */
function InteractiveSlider(config) {
    // Викликаємо батьківський конструктор
    BaseSlider.call(this, config);
    
    // Додаткові властивості для тач/драг
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    this.currentIndex = 0;
}

/**
 * Налаштування наслідування від BaseSlider
 */
InteractiveSlider.prototype = Object.create(BaseSlider.prototype);
InteractiveSlider.prototype.constructor = InteractiveSlider;

/**
 * Перевизначення методу addEventListeners для додавання тач/драг
 */
InteractiveSlider.prototype.addEventListeners = function() {
    // Викликаємо батьківський метод
    BaseSlider.prototype.addEventListeners.call(this);
    
    // Додаємо тач події
    this.container.addEventListener('touchstart', this.touchStart.bind(this));
    this.container.addEventListener('touchmove', this.touchMove.bind(this));
    this.container.addEventListener('touchend', this.touchEnd.bind(this));
    
    // Додаємо події миші для перетягування
    this.container.addEventListener('mousedown', this.touchStart.bind(this));
    this.container.addEventListener('mousemove', this.touchMove.bind(this));
    this.container.addEventListener('mouseup', this.touchEnd.bind(this));
    this.container.addEventListener('mouseleave', this.touchEnd.bind(this));
    
    // Запобігаємо контекстному меню при довгому натисканні
    this.container.addEventListener('contextmenu', (e) => {
        if (this.isDragging) {
            e.preventDefault();
        }
    });
};

/**
 * Отримання позиції X з події
 */
InteractiveSlider.prototype.getPositionX = function(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
};

/**
 * Початок тач/драг
 */
InteractiveSlider.prototype.touchStart = function(event) {
    // Ігноруємо, якщо клік на кнопках
    if (event.target.closest('.nav-btn') || 
        event.target.closest('.control-btn') || 
        event.target.closest('.indicator')) {
        return;
    }
    
    this.isDragging = true;
    this.startPos = this.getPositionX(event);
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    this.sliderTrack.classList.add('no-transition');
    
    // Пауза автопрогортування
    if (this.isAutoPlaying) {
        this.pauseAutoPlay();
    }
};

/**
 * Рух тач/драг
 */
InteractiveSlider.prototype.touchMove = function(event) {
    if (!this.isDragging) return;
    
    const currentPosition = this.getPositionX(event);
    this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
};

/**
 * Завершення тач/драг
 */
InteractiveSlider.prototype.touchEnd = function() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    // Визначаємо, чи достатньо користувач провів
    const threshold = this.container.offsetWidth * 0.2; // 20% ширини
    
    if (movedBy < -threshold && this.currentIndex < this.totalSlides - 1) {
        this.currentIndex += 1;
    }
    
    if (movedBy > threshold && this.currentIndex > 0) {
        this.currentIndex -= 1;
    }
    
    this.currentSlide = this.currentIndex;
    this.setPositionByIndex();
    
    this.sliderTrack.classList.remove('no-transition');
    
    // Відновлюємо автопрогортування
    if (this.isAutoPlaying) {
        this.startAutoPlay();
    }
};

/**
 * Анімація при перетягуванні
 */
InteractiveSlider.prototype.animation = function() {
    if (this.isDragging) {
        this.setSliderPosition();
        requestAnimationFrame(this.animation.bind(this));
    }
};

/**
 * Встановлення позиції слайдера
 */
InteractiveSlider.prototype.setSliderPosition = function() {
    const containerWidth = this.container.offsetWidth;
    const translateX = this.currentTranslate / containerWidth * 100;
    this.sliderTrack.style.transform = `translateX(${translateX}%)`;
};

/**
 * Встановлення позиції за індексом
 */
InteractiveSlider.prototype.setPositionByIndex = function() {
    const containerWidth = this.container.offsetWidth;
    this.currentTranslate = this.currentIndex * -containerWidth;
    this.prevTranslate = this.currentTranslate;
    this.updateSlider();
};

/**
 * Перевизначення updateSlider для синхронізації індексів
 */
InteractiveSlider.prototype.updateSlider = function() {
    // Викликаємо батьківський метод
    BaseSlider.prototype.updateSlider.call(this);
    
    // Синхронізуємо currentIndex
    this.currentIndex = this.currentSlide;
    
    // Оновлюємо prevTranslate
    const containerWidth = this.container.offsetWidth;
    this.prevTranslate = this.currentIndex * -containerWidth;
};


// ========================================
// ІНІЦІАЛІЗАЦІЯ
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Створюємо інтерактивний слайдер з конфігурацією
    const slider = new InteractiveSlider({
        containerSelector: '.slider-container',
        slideSelector: '.slide',
        autoPlay: true,
        autoPlayDelay: 3000,
        showNavigation: true,
        showIndicators: true,
        showControls: true,
        enableKeyboard: true,
        pauseOnHover: true
    });
    
    console.log('Слайдер на прототипах ініціалізовано успішно!');
});


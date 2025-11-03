// Slider Class
class Slider {
    constructor() {
        // DOM Elements
        this.sliderTrack = document.querySelector('.slider-track');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.indicators = document.querySelectorAll('.indicator');
        this.pauseBtn = document.querySelector('.pause-btn');
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
        this.controlText = document.querySelector('.control-text');
        this.sliderContainer = document.querySelector('.slider-container');
        
        // State
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAutoPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 3000; // 3 seconds
        
        // Touch/Drag state
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        this.currentIndex = 0;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set initial position
        this.updateSlider();
        
        // Event Listeners
        this.addEventListeners();
        
        // Start autoplay
        this.startAutoPlay();
    }
    
    addEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Pause/Play button
        this.pauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch events
        this.sliderContainer.addEventListener('touchstart', (e) => this.touchStart(e));
        this.sliderContainer.addEventListener('touchmove', (e) => this.touchMove(e));
        this.sliderContainer.addEventListener('touchend', () => this.touchEnd());
        
        // Mouse events (drag)
        this.sliderContainer.addEventListener('mousedown', (e) => this.touchStart(e));
        this.sliderContainer.addEventListener('mousemove', (e) => this.touchMove(e));
        this.sliderContainer.addEventListener('mouseup', () => this.touchEnd());
        this.sliderContainer.addEventListener('mouseleave', () => this.touchEnd());
        
        // Prevent context menu on long press
        this.sliderContainer.addEventListener('contextmenu', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
        
        // Pause autoplay when user interacts
        this.sliderContainer.addEventListener('mouseenter', () => {
            if (this.isAutoPlaying) {
                this.pauseAutoPlay();
            }
        });
        
        this.sliderContainer.addEventListener('mouseleave', () => {
            if (this.isAutoPlaying && !this.isDragging) {
                this.startAutoPlay();
            }
        });
    }
    
    // Navigation Methods
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
        this.resetAutoPlay();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
        this.resetAutoPlay();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
        this.resetAutoPlay();
    }
    
    updateSlider() {
        // Update slide position
        const translateX = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update active slide
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Update current index for drag functionality
        this.currentIndex = this.currentSlide;
    }
    
    // Auto-play Methods
    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        if (this.isAutoPlaying) {
            this.startAutoPlay();
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
            this.controlText.textContent = 'Пауза';
        } else {
            this.pauseAutoPlay();
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.controlText.textContent = 'Відновити';
        }
    }
    
    resetAutoPlay() {
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
            this.startAutoPlay();
        }
    }
    
    // Keyboard Navigation
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        }
    }
    
    // Touch/Drag Methods
    getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    touchStart(event) {
        // Ignore if clicking on navigation buttons or control elements
        if (event.target.closest('.nav-btn') || 
            event.target.closest('.control-btn') || 
            event.target.closest('.indicator')) {
            return;
        }
        
        this.isDragging = true;
        this.startPos = this.getPositionX(event);
        this.animationID = requestAnimationFrame(() => this.animation());
        this.sliderTrack.classList.add('no-transition');
        
        // Pause autoplay while dragging
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
        }
    }
    
    touchMove(event) {
        if (!this.isDragging) return;
        
        const currentPosition = this.getPositionX(event);
        this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
    }
    
    touchEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        cancelAnimationFrame(this.animationID);
        
        const movedBy = this.currentTranslate - this.prevTranslate;
        
        // Determine if user swiped enough to change slide
        const threshold = this.sliderContainer.offsetWidth * 0.2; // 20% of container width
        
        if (movedBy < -threshold && this.currentIndex < this.totalSlides - 1) {
            this.currentIndex += 1;
        }
        
        if (movedBy > threshold && this.currentIndex > 0) {
            this.currentIndex -= 1;
        }
        
        this.currentSlide = this.currentIndex;
        this.setPositionByIndex();
        
        this.sliderTrack.classList.remove('no-transition');
        
        // Resume autoplay
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }
    
    animation() {
        if (this.isDragging) {
            this.setSliderPosition();
            requestAnimationFrame(() => this.animation());
        }
    }
    
    setSliderPosition() {
        const containerWidth = this.sliderContainer.offsetWidth;
        const translateX = this.currentTranslate / containerWidth * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
    }
    
    setPositionByIndex() {
        const containerWidth = this.sliderContainer.offsetWidth;
        this.currentTranslate = this.currentIndex * -containerWidth;
        this.prevTranslate = this.currentTranslate;
        this.updateSlider();
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const slider = new Slider();
});


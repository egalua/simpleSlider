
/**
 * Простой cлайдер 
 * @param {string} className имя класса слайдера
 * @param {boolean} animation включение анимации (по умолчанию true - включена)
 */
function Slider(className, setAnimationFlag) {
    // html блок слайдера
    this.slider = document.querySelector('.' + className);   
    // правая кнопка
    this.toRightBtn = this.slider.querySelector(".slider__left-button"); 
    // левая кнопка
    this.toLeftBtn = this.slider.querySelector(".slider__right-button"); 
    // контейнер ленты ("фрейм")
    this.wrapper = this.slider.querySelector(".slider__wrapper"); 
    // лента
    this.tape = this.slider.querySelector(".slider__tape"); 
    // основной блок слайдов
    this.slidesBlock = this.slider.querySelector(".slider__slides-block"); 
    // массив слайдов
    this.slidesArray = Array.prototype.slice.call(this.slidesBlock.querySelectorAll('.slider__slide'));
    // текущее состояние анимации (состояние css transition)
    this.transitionEnd = true; 
    // разрешить анимацию
    this.enableAnimation = true; 

    if(window.getComputedStyle(this.slider).transitionProperty==undefined || setAnimationFlag==false){
        this.enableAnimation = false;   // запретить анимацию
    } 

    this.init();
}
/**
 * Инициализация слайдера
 */
Slider.prototype.init = function(){

    // ширина основного блока слайдов
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );
    
    // клон основного блока слайдов
    this.slidesBlockClone = this.slidesBlock.cloneNode(true); 
    this.slidesBlockClone.classList.add('clone');
    this.tape.appendChild(this.slidesBlockClone);
    this.slidesBlockClone.style.left = '0px';

    // положение блока слайдов внутри ленты
    this.slidesBlock.style.left = slidesBlockWidth + 'px';

    // установить ленту на первом слайде
    this.moveTape(1);

    // Обработчики событий
    this.setButtonClickHandler(this.toRightBtn);
    this.setButtonClickHandler(this.toLeftBtn);
    this.setTransitionendHandler(this.slider);
   
};
/**
 * Перемещает ленту на слайд с номером numSlide из основного блока слайдов
 * @argument {integer} numSlide номер слайда из блока слайдов
 */
Slider.prototype.moveTape = function(numSlide){
    // смещение от левой границы блока слайдов до слайда numSlide
    var offset = 0; 
    // флаг "слайд найден"
    var slideFoundFlag = false; 
    // ширина блока слайдов
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );

    numSlide--; // конвертирует номер в индекс
    numSlide %= (this.slidesArray.length);
    
    if(numSlide > 0){
        this.slidesArray.forEach( function(slide, idx){ 
            if(!slideFoundFlag){
                (idx == numSlide) ? 
                    slideFoundFlag = true: // если слайд numSlide найден
                    offset += parseFloat( window.getComputedStyle(slide).width );
            } 
        } );
    } 

    // смещение ленты относительно левой границы "фрейма" - блока this.wrapper 
    this.tape.style.left = -(offset + slidesBlockWidth) + 'px';

    // перенести класс active на нужный слайд
    this.slidesArray.forEach( function(slide){ slide.classList.remove('active'); } );
    this.slidesArray[numSlide].classList.add('active');

    this.reflow(this.tape); 

};
/**
 * Перемещает ленту на следующий слайд (лента движется влево) 
 */
Slider.prototype.moveTapeToLeft = function(){

    var idx = this.getCurrentActiveSlideIndex(); // индекс слайда с классом active
    var style = window.getComputedStyle( this.slidesArray[idx] ); // стили слайда
    var width = parseFloat(style.width); // ширина слайда с классом active

    // текущее смещение ленты
    var currentTapeOffset = parseFloat( window.getComputedStyle(this.tape).left);
    this.tape.style.left = (currentTapeOffset - width) + 'px';
    this.reflow(this.tape);

    idx = (idx+1) % this.slidesArray.length; // следующий индекс
    
    this.slidesArray.forEach(function(slide, index){ slide.classList.remove('active'); });
    this.slidesArray[idx].classList.add('active');

}
/**
 * Перемещает ленту на предыдущий слайд (лента движется вправо) 
 */
Slider.prototype.moveTapeToRight = function(){
    
    // индекс слайда с классом active
    var idx = this.getCurrentActiveSlideIndex(); 
    // индекс предыдущего слайда
    idx = (idx < 1) ? (idx - 1) + this.slidesArray.length: idx - 1; 
    // стили предыдущего слайда 
    var style = window.getComputedStyle( this.slidesArray[idx] ); 
    // ширина предыдущего слайда 
    var width = parseFloat(style.width); 

    // установить новое смещение ленты относительно блока this.wrapper
    var currentTapeOffset = parseFloat( window.getComputedStyle(this.tape).left);
    this.tape.style.left = (currentTapeOffset + width) + 'px';
    this.reflow(this.tape);
    
    this.slidesArray.forEach(function(slide, index){ slide.classList.remove('active'); });
    this.slidesArray[idx].classList.add('active');

};
/**
 * Выравнивает основной блок слайдов по правой или левой границе "фрейма" this.wrapper
 * (если sideFlag == true, то левая граница "фрейма" совпадает с левой границей блока)
 * (если sideFlag == false, то правая граница "фрейма" совпадает с правой границей блока)
 * @param {boolean} sideFlag true - правая сторона, false - левая сторона
 */
Slider.prototype.alignToFrameBorder = function(sideFlag){
    
    // ширина блока слайдов
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );
    // ширина окна фрема для показа слайдов
    var wrapperWidth = parseFloat(window.getComputedStyle(this.wrapper).width);

    if(sideFlag){ // левая сторона "фрейма" совмещается с левой стороной блока слайдов
        this.tape.style.left = -slidesBlockWidth + 'px'; 
    } else { // правая сторона "фрейма" совмещается с правой стороной блока слайдов
        this.tape.style.left = -(2*slidesBlockWidth - wrapperWidth) + 'px';
    }
    this.reflow(this.tape);

};
/**
 * Получить индекс слайда с классом 'active'
 * @returns {integer} индекс слайда с классом 'active'
 */
Slider.prototype.getCurrentActiveSlideIndex = function(){
    var num = 0;
    this.slidesArray.forEach(function(slide, idx){
        if( slide.classList.contains('active') ) num = idx;
    });
    return num;
};
/**
 * Возвращает положение клонированного блока слайдов относительно основного блока
 * (true - если клон расположен слева от основного блока)
 * (false - если клон расположен справа от основного блока)
 * @returns {boolean} true - если клон расположен слева от основного блока
 */
Slider.prototype.isLeftClonePosition = function(){
    var leftOffset = parseFloat( window.getComputedStyle(this.slidesBlockClone).left );
    if(leftOffset == 0) return true;
    return false;
};
/**
 * Меняет положение клонированного блока слайдов на противоположное
 * (клоны и основной блок пзиционируются относительно ленты this.tape)
 * (лента позиционируется относительно "фрейма" this.wrapper)
 */
Slider.prototype.changeCloneBlockPosition = function(){
    var leftPos = this.isLeftClonePosition(); // текущее положение клона 
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );
    if(leftPos){ // если клон слева от основного блока
        this.slidesBlockClone.style.left = 2*slidesBlockWidth + 'px';
    } else {
        this.slidesBlockClone.style.left = '0px';
    }
}
// принудительный пересчет стилей
Slider.prototype.reflow = function(element){
    // первый способ (не всегда работает)
    var currentStyle = window.getComputedStyle(element);
    // второй способ (чтобы уже наверняка)
    var currentOffsetHeight = element.offsetHeight; 
};
/**
 * Установить обработчик события click у кнопки button
 * @param {HTMLElement} button кнопка для установки обработчика события 'click'
 */
Slider.prototype.setButtonClickHandler = function(button){

    var self = this;
    
    function clickHandler(e){
        if( self.enableAnimation && self.transitionEnd || 
            !self.enableAnimation ){
            
            // определение нажатой кнопки
            var isRightButton = this.classList.contains('slider__right-button');
            var isLeftButton = this.classList.contains('slider__left-button');
            // позиция клона блока слайдов (слева или справа от основного блока)
            var isLeftClonePosition = self.isLeftClonePosition();

            // смещение ленты относительно "фрейма"
            var tapeLeft = Math.abs(parseFloat(window.getComputedStyle(self.tape).left));
            // ширина "фрейма" 
            var wrapperWidth = parseFloat(window.getComputedStyle(self.wrapper).width);
            // ширина блока слайдов
            var slidesBlockWidth = parseFloat(window.getComputedStyle(self.slidesBlock).width);
            // ширина ленты
            var tapeWidth = parseFloat(window.getComputedStyle(self.tape).width);

            // условия для изменени положения клонов
            if(isLeftButton && isLeftClonePosition && (tapeLeft + wrapperWidth >= 2 * slidesBlockWidth) ){
                self.changeCloneBlockPosition();     
            }
            if(isRightButton && !isLeftClonePosition && (tapeLeft <= slidesBlockWidth)){
                self.changeCloneBlockPosition();     
            }

            // если анимация отключена - выровнять ленту по основному блоку слайдов
            if(self.enableAnimation == false){

                if( (tapeLeft + wrapperWidth) == tapeWidth ){
                    self.alignToFrameBorder(false); // по совпадению правых границ "фрейма" и блока слайдеров 
                }
                if( tapeLeft == 0 ){
                    self.alignToFrameBorder(true); // по совпадению левых границ "фрейма" и блока слайдеров 
                }
            }

            if(self.enableAnimation) self.onAnimation(); // включить анимацию

            if(isRightButton) self.moveTapeToRight(); 
            if(isLeftButton) self.moveTapeToLeft();
        }
    }

    button.addEventListener('click', clickHandler);
};
/**
 * Установка обработчика события transitionend
 * @param {HTMLElement} element элемент для установки обработчиков transitionend
 */
Slider.prototype.setTransitionendHandler = function(element){
    
    var self = this;
    
    function transitionendHandler(){
        // смещение ленты относительно окна "фрейма" (this.wrapper)
        var tapeLeft = Math.abs(parseFloat(window.getComputedStyle(self.tape).left));;
        // ширина окна "фрейма" (this.wrapper)
        var wrapperWidth = parseFloat(window.getComputedStyle(self.wrapper).width);
        // ширина ленты
        var tapeWidth = parseFloat(window.getComputedStyle(self.tape).width);

        self.offAnimation();
        
        // выровнять ленту по границам "фрейма" и основного блока слайдов
        if( (tapeLeft + wrapperWidth) == tapeWidth ){
            self.alignToFrameBorder(false); // по совпадению правых границ "фрейма" и блока слайдеров 
        }
        if( tapeLeft == 0 ){
            self.alignToFrameBorder(true); // по совпадению левых границ "фрейма" и блока слайдеров 
        }
    }
    element.addEventListener('transitionend', transitionendHandler);
};
/**
 * Включает анимацию
 */
Slider.prototype.onAnimation = function(){
    this.transitionEnd = false; // старт css transition
    this.tape.classList.add('transition-left');
    this.reflow(this.tape); 
}
/**
 * Выключает анимацию
 */
Slider.prototype.offAnimation = function(){
    this.transitionEnd = true;
    this.tape.classList.remove('transition-left');
    this.reflow(this.tape);
}

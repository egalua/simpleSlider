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
    // навигационная панель
    this.nav = this.slider.querySelector(".slider__nav");
    // массив пуктов пеню
    this.navItemsArray = [];
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
    this.moveTapeToSlideIndex(0, false);

    // панель навигации
    this.initNav();

    // Обработчики событий
    this.setClicksHandlers();
    this.setTransitionendHandler(this.slider);
   
};
/**
 * Инициализация панели навигации
 */
Slider.prototype.initNav = function(){
    // количество путнктов навигации
    var totalItem = this.slidesArray.length;
    // индекс "активного" пункта навигации
    var activeItemIndex = this.getCurrentActiveSlideIndex();

    for(var i = 0; i < totalItem; i++){
        var item = document.createElement('div');
        item.classList.add('slider__nav-item');
        
        this.nav.appendChild(item);
    }
    // массив созданных пунктов навигации
    this.navItemsArray = Array.prototype.slice.call(this.nav.children);

    this.navItemsArray.forEach(function(item){ 
        item.classList.remove('slider__nav-item_active'); 
    });
    this.navItemsArray[activeItemIndex].classList.add('slider__nav-item_active');

}
/**
 * Установить класс 'active' на пункте меню, 
 * соответствующем слайду с классом 'active'
 */
Slider.prototype.setActiveItemInNavPanel = function(){
    var idx = this.getCurrentActiveSlideIndex();
    
    for(var i = 0; i < this.navItemsArray.length; i++){
        if(this.navItemsArray[i].classList.contains('slider__nav-item_active')){
            this.navItemsArray[i].classList.remove('slider__nav-item_active');
            break;
        }
    }

    this.navItemsArray[idx].classList.add('slider__nav-item_active');
}

/**
 * Получить направление движения ленты для перехода к слайду
 * с индексом nextSlideIndex
 * @param {integer} nextSlideIndex индекс следующего слайда
 * @param {boolean} carouselMode режим движения ленты true - карусель, false - обычная лента
 * @returns {integer} 1 - движение вправо, -1 - движение влево, 0 - стоит на месте
 */
Slider.prototype.getDirectionTapeMove = function(nextSlideIndex, carouselMode){
    if(carouselMode === undefined) carouselMode = true;
    var totalSlides = this.slidesArray.length;

    if(carouselMode){ // включен режим "карусели"
        var rightStep = 0, leftStep = 0;
        var activeSlidetIndex = this.getCurrentActiveSlideIndex();

        while(activeSlidetIndex != nextSlideIndex){
            activeSlidetIndex = (++activeSlidetIndex) % totalSlides;
            rightStep++;
        }
    
        activeSlidetIndex = this.getCurrentActiveSlideIndex();
        while(activeSlidetIndex != nextSlideIndex){
            activeSlidetIndex = (activeSlidetIndex - 1) < 0 ?
                                    activeSlidetIndex - 1 + totalSlides:
                                    activeSlidetIndex - 1;
            leftStep++; 
        }
        // сравниваем количество переходов от "начального" слайда к "конечному"
        // при обходе "карусели" по часовой стрелке и против
        // выбираем минимальное количество переходов    
        if(rightStep > leftStep) return 1; // направление обхода противоположно направлению движения ленты
        if(rightStep < leftStep) return -1;
        return 0;
    } 
    
    activeSlidetIndex = this.getCurrentActiveSlideIndex();

    if(nextSlideIndex > activeSlidetIndex) return -1;
    if(nextSlideIndex < activeSlidetIndex) return 1;
    return 0;
};
/**
 * Перемещает ленту на слайд с индексом nextSlideIndex
 * @param {integer} nextSlideIndex индекс слайда, на который нужно перейти
 * @param {boolean} carouselMode режим движения ленты true - карусель (по умолчанию), false - обычная лента
 */
Slider.prototype.moveTapeToSlideIndex = function(nextSlideIndex, carouselMode){
    
    if(carouselMode === undefined) carouselMode = true;
    // направление движения ленты
    var directionTapeMove = this.getDirectionTapeMove(nextSlideIndex, carouselMode);
    var currentTapeOffset = window.getComputedStyle(this.tape).left;

    if(carouselMode){ // если включен режиме "карусели"
        // смещение ленты для слайда с индексом nextSlideIndex
        var left = this.getOffsetNewSlideFromTapeLeftEdge(nextSlideIndex, directionTapeMove);
        this.tape.style.left = -left + 'px';
    } else {
        // смещение ленты, если режим "карусели" отключен
        this.moveTapeToASlideInSimpleMode(nextSlideIndex);
    }
    // перенести класс slider__slide_active на нужный слайд
    this.slidesArray.forEach( function(slide){ slide.classList.remove('slider__slide_active'); } );
    this.slidesArray[nextSlideIndex].classList.add('slider__slide_active');

}
/**
 * Создает генератор индексов, где каждый новый индекс 
 * такого генератора больше предыдущнго на 1
 * при этом сложение индексов ведется по модулю 
 * равному общему количеству слайдов
 * 
 * @param {integer} slideIndex стартовый индекс для инициализации генератора
 * @returns {Object} объект-генератор "следующих" индексов
 */
Slider.prototype.getNextSlidesIndexesGenerator = function(slideIndex){
    var self = this;
    var currentSlideIndex = slideIndex;

    return { 
        setStartSlideIndex: function(idx){ currentSlideIndex = idx; },
        getCurrentSlideIndex: function(){ return currentSlideIndex; },
        getNextSlideIndex: function(){ 
            currentSlideIndex = (++currentSlideIndex) % self.slidesArray.length; 
            return currentSlideIndex; 
        }
    };
}
/**
 * Создает генератор индексов, где каждый новый индекс 
 * такого генератора меньше предыдущнго на 1
 * при этом вычитание индексов ведется по модулю 
 * равному общему количеству слайдов
 * 
 * @param {integer} slideIndex стартовый индекс для инициализации генератора
 * @returns {Object} объект-генератор "предыдущих" индексов
 */
Slider.prototype.getPrevSlidesIndexesGenerator = function(slideIndex){
    var self = this;
    var currentSlideIndex = slideIndex;

    return {
        setStartSlideIndex: function(idx){ currentSlideIndex = idx; },
        getCurrentSlideIndex: function(){ return currentSlideIndex; },
        getPrevSlideIndex: function(){ 
            currentSlideIndex = (currentSlideIndex - 1) < 0 ? 
                currentSlideIndex - 1 + self.slidesArray.length:
                currentSlideIndex - 1;
            return currentSlideIndex; 
        }
    };
};
/**
 * Получить рассчетное смещение ленты для нового "активного" слайда
 * @param {integer} nextSlideIndex индекс нового "active" слайда
 * @param {integer} tapeMoveDirect направление перемещения ленты: 
 * 1 - лента движится вправо, -1 - влево, 0 - стоит на месте
 * @returns {float} смещение нового слайда относительно левой границы ленты
 */
Slider.prototype.getOffsetNewSlideFromTapeLeftEdge = function(nextSlideIndex, tapeMoveDirect){
    var currentSlideIndex = this.getCurrentActiveSlideIndex();
    var slideOffset = 0;

    if(tapeMoveDirect > 0){
        // генератор "предыдущих" индексов
        var prevSldIdxGen = this.getPrevSlidesIndexesGenerator(currentSlideIndex);
        // стартовый индекс
        var idx = currentSlideIndex;
        while(idx != nextSlideIndex){ 
            slideOffset += parseFloat(window.getComputedStyle( this.slidesArray[idx] ).width);
            idx = prevSldIdxGen.getPrevSlideIndex();
        }
        // вычитаем из текущего смещения ленты ширину 
        // всех промежуточных слайдов от текущего до целевого
        slideOffset = Math.abs(parseFloat(window.getComputedStyle(this.tape).left)) - slideOffset;
        return slideOffset;

    } else  if(tapeMoveDirect < 0) {
        // генератор "следующих" индексов
        var nextSldIdxGen = this.getNextSlidesIndexesGenerator(currentSlideIndex);
        // стартовый индекс
        var idx = currentSlideIndex;
        while(idx != nextSlideIndex){
            slideOffset += parseFloat(window.getComputedStyle(this.slidesArray[idx]).width);
            idx = nextSldIdxGen.getNextSlideIndex();
        }
        // складываем с текущим смещением ленты ширину
        // всех промежуточных слайдов от текущего до целевого
        slideOffset += Math.abs(parseFloat(window.getComputedStyle(this.tape).left));
        return slideOffset;
    }
    return Math.abs(parseFloat(window.getComputedStyle(this.tape).left));
};

/**
 * Перемещает ленту на слайд с индексом slideIdx из основного блока слайдов
 * (режим карусели отключен)
 * @argument {integer} slideIdx номер слайда из блока слайдов
 */
Slider.prototype.moveTapeToASlideInSimpleMode = function(slideIdx){
    // смещение от левой границы блока слайдов до слайда slideIdx
    var offset = 0; 

    // ширина блока слайдов
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );

    if(slideIdx >= 0){
        for(var idx = 0; idx < this.slidesArray.length; idx++){
            if(slideIdx == idx) break;
            offset += parseFloat( window.getComputedStyle(this.slidesArray[idx]).width );
        }
    } 

    // смещение ленты относительно левой границы "фрейма" - блока this.wrapper 
    this.tape.style.left = -(offset + slidesBlockWidth) + 'px';

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
};
/**
 * Получить индекс слайда с классом 'slider__slide_active'
 * @returns {integer} индекс слайда с классом 'slider__slide_active'
 */
Slider.prototype.getCurrentActiveSlideIndex = function(){

    for(var i = 0; i < this.slidesArray.length; i++){
        if( this.slidesArray[i].classList.contains('slider__slide_active') )
            break;
    }
    return i;
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
 * (клоны и основной блок позиционируются относительно ленты this.tape)
 * (лента позиционируется относительно "фрейма" this.wrapper)
 */
Slider.prototype.changeClonedBlockPosition = function(){
    var leftPos = this.isLeftClonePosition(); // текущее положение клона 
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );
    if(leftPos){ // если клон слева от основного блока
        this.slidesBlockClone.style.left = 2 * slidesBlockWidth + 'px';
    } else {
        this.slidesBlockClone.style.left = '0px';
    }
}

/**
 * Выравнивает ленту по совпадению границ "фрейма" и блока слайдов
 * в зависимости от необходимости
 * ( по совпадению правых границ "фрейма" и блока слайдеров или
 *   по совпадению левых границ "фрейма" и блока слайдеров )
 */
Slider.prototype.alignSlidesBlockToFrameEdge = function(){

    // смещение ленты относительно "фрейма"
    var tapeLeft = Math.abs(parseFloat(window.getComputedStyle(this.tape).left));
    // ширина "фрейма" 
    var wrapperWidth = parseFloat(window.getComputedStyle(this.wrapper).width);
    // ширина блока слайдов
    var slidesBlockWidth = parseFloat( window.getComputedStyle(this.slidesBlock).width );    
    // ширина ленты
    var tapeWidth = parseFloat(window.getComputedStyle(this.tape).width);
    
    var ltrFlag = Math.abs(tapeLeft - (2 * slidesBlockWidth)) < 1;
    var rtlFlag = Math.abs(tapeLeft + wrapperWidth - slidesBlockWidth) < 1;
    
    if(ltrFlag){ // левая граница фрейма совпадает с правой границей блока слайдов
        this.alignToFrameBorder(true); 
    }
    if(rtlFlag){ // правая граница фрейма совпадает с левой границей блока слайдов
        this.alignToFrameBorder(false); 
    }

}
/**
 * Изменяет положение клона блока слайдов в зависимости от 
 * выбранного направления движения ленты
 * @param {boolean} toRight направление движения ленты (true - вправо, false - влево)
 */
Slider.prototype.changeClonedBlockPositionOnButtonsClick = function(toRight){
    // позиция клона блока слайдов (слева или справа от основного блока)
    var isLeftClonePosition = this.isLeftClonePosition();
    // смещение ленты относительно "фрейма"
    var tapeLeft = Math.abs(parseFloat(window.getComputedStyle(this.tape).left));
    // ширина "фрейма" 
    var wrapperWidth = parseFloat(window.getComputedStyle(this.wrapper).width);
    // ширина блока слайдов
    var slidesBlockWidth = parseFloat(window.getComputedStyle(this.slidesBlock).width);
    
    // условия для изменени положения клонов
        if(!toRight && isLeftClonePosition && (tapeLeft + wrapperWidth >= 2 * slidesBlockWidth) ){
            this.changeClonedBlockPosition(); // правые границы блока и фрейма совподают
        }
        if(toRight && !isLeftClonePosition && (tapeLeft <= slidesBlockWidth)){ 
            this.changeClonedBlockPosition(); // левые границы фрейма и блока слайдов совпадают    
        }
}
/**
 * Меняет положение клона блока слайдов
 * относительно оригинального блока в щависимости от 
 * от индекса следующего отображаемого слайда и
 * режима движения ленты (карусель или обычная лента)
 * @param {integer} nextSlideIdx индекс следующего слайда
 * @param {boolean} carouselMode режим движения ленты: true - карусель, false - обычная лента
 */
Slider.prototype.changeCloneBlockPositionOnThisTapeMode = function(nextSlideIdx, carouselMode){
    if(carouselMode === undefined) carouselMode = true;

    // текущая позиция клона блока слайдов (слева или справа от основного блока)
    var isLeftClonePosition = this.isLeftClonePosition();

    // рассчетное смещение ленты относительно "фрейма" для слайда с индексом nextSlideIdx
    var nextTapeLeftPosition = this.getOffsetNewSlideFromTapeLeftEdge( 
                                    nextSlideIdx, 
                                    this.getDirectionTapeMove(nextSlideIdx, carouselMode)
                                );

    // ширина "фрейма" 
    var wrapperWidth = parseFloat(window.getComputedStyle(this.wrapper).width);
    // ширина блока слайдов
    var slidesBlockWidth = parseFloat(window.getComputedStyle(this.slidesBlock).width);
   
    // условия для изменени положения клонов
    if(isLeftClonePosition && (nextTapeLeftPosition + wrapperWidth > 2 * slidesBlockWidth) ){
        this.changeClonedBlockPosition(); // клон нужен справа блок уехал влево правая граница блока внутри фрейма
    }
    if(!isLeftClonePosition && (nextTapeLeftPosition < slidesBlockWidth)){ 
        this.changeClonedBlockPosition(); // клон нужен слева блок уехал вправо, левая граница блока внутри фрейма
    }
}
/**
 * Установить обработчики события click
 */
Slider.prototype.setClicksHandlers = function(){

    var self = this;
    /**
     * Обработчик события "click" на кнопках слайдера
     * @param {HTMLElement} target кнопка слайдера
     */
    function buttonsClickHandler(target){
        // проверка завершения анимации
        if( self.enableAnimation && self.transitionEnd || 
            !self.enableAnimation ){
            
            // определение нажатой кнопки
            var isRightButton = target.classList.contains('slider__right-button');
            // индекс следующего слайда
            var nextSlideIndex = self.getCurrentActiveSlideIndex();
            
            if(isRightButton){
                nextSlideIndex = (nextSlideIndex < 1) ? nextSlideIndex - 1 + self.slidesArray.length: 
                                                        nextSlideIndex - 1; 
            } else {
                nextSlideIndex = (nextSlideIndex+1) % self.slidesArray.length; 
            }

            // изменить положение клона блока слайдов, если необходимо
            self.changeCloneBlockPositionOnThisTapeMode(nextSlideIndex);

            // выровнять ленту по основному блоку слайдов
            self.alignSlidesBlockToFrameEdge();
            // включить анимацию
            if(self.enableAnimation) self.onAnimation(); 
            // переместить ленту на выбранный слайд
            self.moveTapeToSlideIndex(nextSlideIndex);
            // установка активного указателя в панели навигации
            self.setActiveItemInNavPanel();
        }
    }
    /**
     * Обработчик события "click" на кнопках панели навигации
     * @param {HTMLElement} target 
     */
    function navItemsClickHandler(target){
        // проверка завершения анимации
        if( self.enableAnimation && self.transitionEnd || 
            !self.enableAnimation ) {
            // индекс следующего слайда
            var nextSlideIdx = self.navItemsArray.indexOf(target);
            
            if(self.getCurrentActiveSlideIndex() == nextSlideIdx) return;

            // изменить положение клона блока слайдов, если нужно
            self.changeCloneBlockPositionOnThisTapeMode(nextSlideIdx, false);
            // включить анимацию
            if(self.enableAnimation) self.onAnimation(); 
            // сместить ленту к нужному слайду
            self.moveTapeToSlideIndex(nextSlideIdx, false); 
            // установка активного указателя в панели навигации
            self.setActiveItemInNavPanel();
        }
    }
    /**
     * Переключение обработчиков события click 
     * в зависимости от целевого элемента, на котором сработало событие
     * @param {Event} e объект события
     */
    function manageClickHandler(e){
        var target = e.target;
        var clickedElementName = '';

        while(!target.classList.contains('slider')){
            if(target.classList.contains('slider__left-button')){
                clickedElementName ='left-button'; 
                break;
            }
            if(target.classList.contains('slider__right-button')){
                clickedElementName ='right-button'; 
                break;
            }
            if(target.classList.contains('slider__nav-item')){
                clickedElementName ='nav-item'; 
                break;
            }
            target = target.parentNode;
        }

        if(target.classList.contains('slider')) return;
        
        switch(clickedElementName){
            case 'left-button': buttonsClickHandler(target); 
                break;
            case 'right-button': buttonsClickHandler(target); 
                break;
            case 'nav-item': navItemsClickHandler(target); 
                break;
            default: return;
        }

    }

    this.slider.addEventListener('click', manageClickHandler);
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
        self.alignSlidesBlockToFrameEdge();
    }
    element.addEventListener('transitionend', transitionendHandler);
};
/**
 * Включает анимацию
 */
Slider.prototype.onAnimation = function(){
    this.transitionEnd = false; // старт css transition
    this.tape.classList.add('transition-left');
}
/**
 * Выключает анимацию
 */
Slider.prototype.offAnimation = function(){
    this.transitionEnd = true;
    this.tape.classList.remove('transition-left');
}

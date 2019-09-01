Простой слайдер - карусель
============================

Это шаблон простого слайдера. 

Принцип работы: клонирует блок слайдов и размещает его в ленте слайдов this.tape справа или слева от основного блока в зависимости от ситуации и направления движения ленты.

Управляется практически полностью из CSS, нужно только правильно указать ширину ленты .slider__tape – она должна равняться ширине трех блоков со слайдами .slider__slides-block. Так же количество одновременно видимых слайдов не должно превышать их общего количества.

Для подключения на странице вызывается конструктор Slider() в который передаются имя css класса слайдера и флаг включения анимации (по умолчанию анимация включена). Например, var  sld = Slider(“slider”);

Параметры анимации устанавливаются в css для класса .transition-left 
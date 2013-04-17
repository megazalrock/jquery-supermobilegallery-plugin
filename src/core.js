/*global $:true, jQuery:true */
(function(){
	var superMobileGallery = function(){
		this.options = {
			selectors :{
				next:'.next',
				prev:'.prev',
				images:'.images',
				indicator:'.indicator'
			},
			animation:{
				slideDuration:400,
				slideEasing:'ease-in-out',
				imageFadeDuration:400
			},
			other:{
				retinaImageLoader:'enable',
				visibleImageNum:3,
				autoLoadRetinaImage:true,
				retinaImageSuffix:'_x2',
				snapDistance:100,
				imageSpace:20
			}
		};
		this.$ = {};
	};
	superMobileGallery.prototype.init = function(target,options){
		var self = this;
		options = options || {};
		$.extend(true,self.options,options);
		self.$.wrap = $(target);
		self.$.next = self.$.wrap.find(self.options.selectors.next);
		self.$.prev = self.$.wrap.find(self.options.selectors.prev);
		self.$.images = self.$.wrap.find(self.options.selectors.images);
		self.$.imagesChildren = self.$.images.children();
		self.$.indicator = self.$.wrap.find(self.options.selectors.indicator);
		self.$.indicatorChildren = self.$.indicator.children();
		self.status = 'moveEnd';
		self.current = -1;
		self.length = self.$.imagesChildren.length;
		self.preparedImagesIndex = [];
		self.wrapWidth = self.$.wrap.width();
		self.imageWidth = self.$.imagesChildren.eq(0).width();
		self.imageSpace = self.options.other.imageSpace;
		self.btnDisabled = false;
		var centerPos = (self.wrapWidth - self.imageWidth) / 2;
		self.posArray = [
			centerPos - (self.imageSpace + self.imageWidth)*3,
			centerPos - (self.imageSpace + self.imageWidth)*2,
			centerPos - (self.imageSpace + self.imageWidth),
			centerPos,
			centerPos + (self.imageSpace + self.imageWidth),
			centerPos + (self.imageSpace + self.imageWidth)*2,
			centerPos + (self.imageSpace + self.imageWidth)*3
		];
		self.$.imagesChildren
			.css({
				marginLeft:0,
				display:'block',
				left:self.posArray[6],
				transitionDuration:'0ms',
				transitionEasing:self.options.animation.slideEasing,
				transitionProperty:'left',
				transition:'left 0ms ' + self.options.animation.slideEasing
			});

		var clickEvent = ('ontouchend' in window) ? 'touchend' : 'click';
		//add event
		self.$.next
			.on(clickEvent,function(e){
				if(self.btnDisabled){return false;}
				if(self.current + 1 < self.length){
					self.changeTo(self.current + 1);
				}else{
					self.changeTo(0);
				}
				self.btnDisabled = true;
				setTimeout(function(){
					self.btnDisabled = false;
				},self.options.animation.slideDuration);
			});
		self.$.prev
			.on(clickEvent,function(e){
				if(self.btnDisabled){return false;}
				self.btnDisabled = true;
				if(self.current - 1 >= 0){
					self.changeTo(self.current - 1);
				}else{
					self.changeTo(self.length - 1);
				}
				setTimeout(function(){
					self.btnDisabled = false;
				},self.options.animation.slideDuration);
			});

		var mouseStartPos = 0,moveDistance = 0;
		self.$.images
			.on('mousedown touchstart',function(e){
				mouseStartPos = e.pageX || e.originalEvent.touches[0].pageX;
				$(this)
					.on('mousemove touchmove',function(e){
						moveDistance = self.drag((e.pageX || e.originalEvent.touches[0].pageX) - mouseStartPos);
					})
					.on('mouseleave mouseup touchend',function(){
						if(Math.abs(moveDistance) < self.options.other.snapDistance){
							self.move();
						}
						$(this).off('mousemove mouseleave mouseup touchmove touchend');
					});
			});
		self.changeTo(0);
	};

	superMobileGallery.prototype.getPreparedImagesArray = function(index){
		var self = this;
		var i = -3,length = self.options.other.visibleImageNum + 1,result = [];
		for(;i < length ; i += 1){
			if(i + index < 0){
				result.push(self.length + index + i);
			}else if (i + index >= self.length){
				result.push(i + index - (self.length));
			}else{
				result.push(index + i);
			}
		}
		return result;
	};

	superMobileGallery.prototype.changeTo = function(index){
		var self = this;
		self.preparedImagesIndex = self.getPreparedImagesArray(index);
		self.$.wrap.off('mousemove mouseleave mouseup touchmove touchend');
		self.$.indicatorChildren
			.eq(index)
				.addClass('selected')
			.end()
			.not(':eq('+ index +')')
				.removeClass('selected');
		self.move();
		self.current = index;
	};

	superMobileGallery.prototype.drag = function(distance){
		var self = this;
		var $current = self.$.imagesChildren.eq(self.current);
		var currentPos = parseInt($current.css('left'),10);
		if(Math.abs(distance) >= self.options.other.snapDistance){
			console.log('hello');
			if(distance > 0){
				if(self.current - 1 >= 0){
					self.changeTo(self.current - 1);
				}else{
					self.changeTo(self.length - 1);
				}
			}else if(distance < 0){
				if(self.current + 1 < self.length){
					self.changeTo(self.current + 1);
				}else{
					self.changeTo(0);
				}
			}
			self.$.images.off('mousemove mouseleave mouseup touchmove touchend');
		}else{
			self.move(distance);
		}
		return distance;
	};

	superMobileGallery.prototype.move = function(distance){
		var self = this;
		distance = distance || 0;
		var i = 0 , length = self.preparedImagesIndex.length,counter = 0;
		self.animationCounter = 0;
		for(;i < length ; i += 1){
			var css = {left:self.posArray[i] + distance};
			if(!distance){
				if(i === 0 || i === length - 1){
					css.transitionDuration = '0ms';
				}else{
					css.transitionDuration = self.options.animation.slideDuration + 'ms';
				}
			}else{
				css.transitionDuration = '0ms';
			}
			self.loadImage(self.preparedImagesIndex[i]);
			self.$.imagesChildren.eq(self.preparedImagesIndex[i])
				.css(css);
		}
		/*if(!distance){
			setTimeout(function(){
			},self.options.animation.slideDuration);
		}*/
	};

	superMobileGallery.prototype.loadImage = function(index){
		var self = this,$target = self.$.imagesChildren.eq(index).find('img');
		if(!$target.data('isLoaded')){
			$target
				.fadeTo(0,0)
				.one('load',function(){
					$target
						.fadeTo(self.options.animation.imageFadeDuration,1)
						.data('isLoaded',true);
				});
			var imgSrc = $target.attr('data-src');
			if(window.devicePixelRatio > 1 && self.options.other.autoLoadRetinaImage){
				imgSrc = imgSrc.replace('.jpg',self.options.other.retinaImageSuffix + '.jpg');
			}
			$target
				.attr('src',imgSrc);
		}
	};

	$.extend({
		superMobileGallery:function(selector,options){
			return new superMobileGallery();
		}
	});
	$.fn.extend({
		superMobileGallery:function(options){
			$(this)
				.each(function(){
					var smg = new superMobileGallery();
					smg.init(this,options);
					$(this).data('superMobileGallery',smg);
				});
			return this;
		}
	});
})(jQuery);
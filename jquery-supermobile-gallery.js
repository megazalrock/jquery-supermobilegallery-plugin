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
				imageFadeDuration:400
			},
			other:{
				retinaImageLoader:'enable',
				visibleImageNum:3,
				autoLoadRetinaImage:true,
				retinaImageSuffix:'_x2',
				snapDistance:80,
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
		self.imageWidth = self.$.imagesChildren.eq(0).width();
		self.imageSpace = self.options.other.imageSpace;
		var css3Duration = self.$.imagesChildren.css('transition-duration');
		if(css3Duration.indexOf('ms') !== -1){
			self.options.animation.duration = parseFloat(css3Duration);
		}else if(css3Duration.indexOf('s') !== -1){
			self.options.animation.duration = parseFloat(css3Duration) * 1000;
		}

		self.posArray = [
			-self.imageWidth / 2 - self.imageSpace - self.imageWidth - self.imageSpace - self.imageWidth,
			-self.imageWidth / 2 - self.imageSpace - self.imageWidth,
			-self.imageWidth / 2 - self.imageSpace,
			self.imageWidth / 2,
			self.imageWidth / 2 + self.imageSpace + self.imageWidth,
			self.imageWidth / 2 + self.imageSpace + self.imageWidth + self.imageSpace + self.imageWidth,
			self.imageWidth / 2 + self.imageSpace + self.imageWidth + self.imageSpace + self.imageWidth + self.imageSpace + self.imageWidth
		];

		self.$.imagesChildren
			.css({
				marginLeft:0,
				display:'block',
				left:self.posArray[6]
			});

		var clickEvent = ('ontouchend' in window) ? 'touchend' : 'click';

		//add event
		self.$.next
			.on(clickEvent,function(e){
				if(self.current + 1 < self.length){
					self.changeTo(self.current + 1);
				}else{
					self.changeTo(0);
				}
			});
		self.$.prev
			.on(clickEvent,function(e){
				if(self.current - 1 >= 0){
					self.changeTo(self.current - 1);
				}else{
					self.changeTo(self.length - 1);
				}
			});

		var mouseStartPos = 0;
		self.$.wrap
			.on('mousedown touchstart',function(e){
				mouseStartPos = e.pageX || e.originalEvent.touches[0].pageX;
				$(this)
					.on('mousemove touchmove',function(e){
						self.drag((e.pageX || e.originalEvent.touches[0].pageX) - mouseStartPos);
					})
					.on('mouseleave mouseup touchend',function(){
						//self.move();
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
		var animateOptions = {
			duration:self.options.animation.duration,
			easing:self.options.animation.easing
		},moveEndNum = 0;
		if(self.current === -1){
			animateOptions.duration = 0;
		}
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
		if(Math.abs(distance) > self.options.other.snapDistance){
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
		}else{
			self.move(distance);
		}
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
					css.transitionDuration = self.options.animation.duration + 'ms';
				}
			}else{
				css.transitionDuration = '0ms';
			}
			self.loadImage(self.preparedImagesIndex[i]);
			self.$.imagesChildren.eq(self.preparedImagesIndex[i])
				.css(css);
		}
		if(!distance){
			setTimeout(function(){
			},self.options.animation.duraiton);
		}else{
		}
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
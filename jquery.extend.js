/*
* This js is use to auto complete some frequently web interaction.
* Like: 'tab' 'close' 'toggleClass' 'association' etc.
* the destination is let people not need to write js anymore
*/
(function(window, $, undefined) {

	//use for two dom have causal relationship
	jQuery.fn._connect = function(fn) {
		var me     = $(this),
			len    = me.length,
			fn     = eval(fn),
			prefix = fn.name + '-',
			reg    = new RegExp(prefix + '\\S{1,}', 'gim'),
			clazzs = [], target

		if(!len /*|| !(clazz = reg.exec(me.attr('class')))*/) return
		
		/*while (len--) {
			reg.lastIndex = 0;
			var clazz = reg.exec(me.eq(len).attr('class'))
			clazzs.push( clazz[0].replace(prefix, '') )
			//target = $('#' + clazz)

		}*/

		fn.call(this)
	};

	jQuery.runConnect = function () {
		var types = arguments[0] || connArr
		$.isArray(types)? 1: types = [types]
		types.forEach(function(val) {
			$('[class*='+val+'-]')._connect(val)
		})
	}

	function tab() {
		var flag = 'active',
			me 	 = this
			
		me.children('li').unbind('click').on('click', function tab(e) {

			var self = $(this),
				tar  = getTarget($(this).parent().attr('class'), 'tab')

			if (!self.hasClass(flag)) {
				var index  = self.index(),
					events = self.parent().attr('tabevent'),
					preTar = self.siblings('.' + flag)
					
				try { eval('before' + events).call(preTar); } catch(e){ }

				changeClass([self, tar.children(':eq('+ index +')')])

				try { eval('after' + events).call(self); } catch(e){ }
			}
		})

		function changeClass(arr) {
			for (var i = 0, len = arr.length; i < len; i++) {
				var aa = arr[i]
				aa.siblings('.' + flag).removeClass(flag)
				aa.addClass(flag)
			}
		}
	}

	function close(target) {
		var me = this
		me.on('click', function close() {
			var target = getTarget(me.attr('class'), 'close')
			if(target.is(':hidden')) target.show()
			else target.hide()
		});
	}
	
	//toggle class
	function toggleClazz(target, clazz) {
		if(!jQuery.isArray(target)) target = [ $('.' + clazz) ]
		if(this.attr('toggleClazz')) toggleClazz._defaultClass = this.attr('toggleClazz')
		var len = target.length
	
		while(len--) {
			target.shift().toggleClass(arguments.callee._defaultClass)
		}
	}
	toggleClazz._defaultClass = 'active'

	function hovershow() {
		var me  	 = $(this),
			tar 	 = null,
			isHover  = false,
			code     = 0

		me.hover(
			function hovershow(e) {//this function name should same with parent function
				isHover = false
				if (tar) { 
					tar.hide()
					clearInterval(code)
				}
				tar = getTarget(e.target.className, 'hovershow')
				tar.show()

				if (!tar.attr('hover-binded')) tarHover()
			},
			function() {
				code = setTimeout(function() {
					if (!isHover && tar) {
						tar.hide()
						tar = null
					}
				}, 100)
			}
		);

		function tarHover() {
			tar.attr('hover-binded', '1')
			tar.hover(
				function() {
					isHover = true
				},
				function() {
					isHover  = false
					tar.hide()
					tar = null
				}
			)
		}
	}

	window.iframelikeCache = []
	function iframelike() {
		//left aside click to show mapping content
		var me      = this,
			aside 	= me,
			len     = aside.length,
			content = null,
			route   = this.attr('route') || '',
			suffix  = '',
			ref     = '',
			index   = 0

		aside.unbind('click').on('click', function iframelike(e) {
			var tar = $(e.target)
			tar = tar.attr('ref')? tar: tar.parents('[ref]')
			content = getTarget( tar.parent().attr('class'), 'iframelike')

			index = tar.index()
			ref   = tar.attr('ref')

			if(ref && iframelikeCache.indexOf(ref) === -1) {
				fillContent(tar.attr('nohide'))
			}
		})
		

		var fillContent = function(nohide) {
			var load = $('#loadE')//content.next('.load')
			load[0].style.display = 'table'
			
			$.ajax({
				url:  route + ref + suffix,
				type: 'GET',
				//dataType: 'jsonp',
				data: 'text',
				success: function(res) {
					if(ref.indexOf('goods/list') === -1) {
						iframelikeCache.push(ref);
						content.children(':eq('+ index +')').append(res);
					} else {
						content.children(':eq('+ index +')')[0].scrollTop = 0
						content.children(':eq('+ index +')').html(res);
					}
					if(!nohide) setTimeout( function(){ load.hide() }, 400)
				},
				complete: function() {
					//setTimeout( function(){ load.hide() }, 200)
				}
			});
		}

		//load the first active html
		for (var i = 0; i < len; i++) {
			var child = aside.eq(i).children('.active'),
				tar   = getTarget(me.eq(i).attr('class'), 'iframelike'),
				inner = tar.children(':eq('+ child.index() +')')
			
			if ( inner.html().trim() !== '') continue;

			index = child.index()
			ref = child.attr('ref')
			content = tar

			inner.addClass('active')
			fillContent()
		}
	}

	//validate the input and add err message
	function validate() {
		var me     = this,
			inputs = me.find('[regexp]')

		var errPre = '<div class="errnotice">',
			errSuf = '</div>',
			
			flag   = true,
			valF   = false, //validate form

			msgEmp = 'ä¸èƒ½ä¸ºç©º',
			msgWro = 'æ ¼å¼ä¸æ­£ç¡®',

			strEmp = '\\S', //empty regexp string
			strEma = '\\w@\\w*\\.\\w', //email regexp string
			strMob = '^1[0-9]{10}$' //mobile regexp string
		
		if (inputs && inputs.length) {
			inputs
				.unbind('focus').on('focus', function() {
					//execute(this)
				})
				.unbind('blur').on('blur', function() {
					execute(this)
				})
				.unbind('input').on('input', function() {
					//ie input has bug
					if (navigator.userAgent.toLowerCase().indexOf('trident') === -1) execute(this)
				})
		} else {
			valF = true
			execute(me)
		}

		function execute(input) {
			var input  	   = $(input),
				hasError   = input.next(),
				msgPre     = input.attr('msg'),
				regexp     = input.attr('regexp')

			//not required but if have value should check.
			if (input[0].getAttribute('norequire') !== null && !input.val().trim()) {
				hasError.remove()
				return
			}

			if (input && regexp !== null){
				//check the regexp
				regStr = strEmp				
				if (regexp.indexOf('/') > -1) {
					regStr = regexp.substr(1, regexp.length-2)
				} else {
					switch (regexp) {
						case 'mobile':
							regStr = strMob
							break
						case 'email':
							regStr = strEma
							break
					}
				}

				regexp = new RegExp(regStr, 'gi')

				var inputValue = input.val().trim()

				if (!inputValue) showError(msgEmp)
				else {
					if (!regexp.test(inputValue)) showError(msgWro)
					else hasError.remove()
				}
				
			}

			function showError(msg) {
				if (valF) {
					input[0].focus()
					valF = false
				}
				if (hasError && hasError.hasClass('errnotice')) hasError.remove()
				var mm = errPre + msgPre + msg + errSuf
				//set full msg
				if ( input.attr('msgs') && input.val().trim()) mm = errPre + input.attr('msgs') + errSuf
				input.after(mm)
				flag = false
			}
		}
		return flag
	}

	function validateForm(form) {
		var inputs = $(form).find('[regexp]'),
			len    = inputs.length,
			flag   = true

		for (var i = 0; i < len; i++) {
			var input = $(inputs[i])
			if ( !validate.call(input) ) {
				flag = false
				break 
			}
		}
		return flag
	}

	window.validate = validateForm

	function submit() {
		var me = this

		me.unbind('click').on('click', function submit() {
			var tar    = getTarget(this.className, 'submit'),
				inputs = tar.find('[name]'),
				url    = tar.attr('action'),
				method = tar.attr('method'),
				data   = {}

			for (var i = inputs.length; i--;) {
				var input = inputs[i]
				data[input.getAttribute('name')] = input.value	
			}

			var validate = validateForm(tar)
			if (validate) {
				$.ajax({
					url: url,
					data: data,
					type: 'POST',
					method: method,
					success: function(data) {
						data = JSON.parse(data)
						var msg = data.msg
						if (data.result) msg = 'æäº¤æˆåŠŸ'
						alert(msg)
						if (window.clearForm) clearForm()
					}
				})
			}
		})
	}

	function toast(msg) {
		if (!window.toastE) $('body').append('<div class="cover toast" id="toastE"><div><span></span></div></div>')
		var toastM = toastE.children[0].children[0]
		toastE.style.display = 'table';
		toastM.innerHTML = msg;
		setTimeout(function() { toastE.style.display = 'none'; }, 2400);
	}

	function alert(msg) {
		var alertM
		if (!window.alertE) {
			$('body').append('<div class="cover alert" id="alertE"><div><div><div class="alert-panel"><p></p><button>ç¡®å®š</button></div></div></div></div>') 
			alertM = alertE.children[0].children[0].children[0].children[0];
			alertM.nextSibling.onclick = function(){ alertE.style.display = 'none'; }
		}
		
		function alert(msg){
			alertM.innerHTML = msg;
			alertE.style.display = 'table';
		}
		alert(msg)
	}
	
	function scrolldownload() {
		var me      = this,
			tar     = null,
			prv     = '',
			cb      = true,// >= will work many time in ie. so set a cb
			param   = null

		me.unbind('scroll').on('scroll', function scrolldownload(e) {
			var self = e.target
			if (self.scrollTop + self.clientHeight + 5 >= self.scrollHeight) {
				//if (prv !== self.className) {
					prv    = self.className
					param  = eval(self.getAttribute('fnname'))
					tar    = getTarget(self.className, 'scrolldownload')
				//}
				if (cb) getData()
			}
		});

		function getData() {
			cb = false
			if (!param.more) return
			var load = $('#loadE')//content.next('.load')
			load[0].style.display = 'table'
			$.ajax({
				url: param.url,
				data: param.option,
				type: 'POST',
				success: function(data) {
					//for no result notice. haha stupid
					if (data.indexOf('no-pro-notice') !== -1) return
					tar.append(param.fn(data))
					if (param.callback) param.callback()
					cb = true
				},
				complete: function() {
					load.hide()
					cb = true
				}
			})
		}
	}

	/*;(function setLoading() {
		$(document).ajaxStart(function() {
			if ($.load && $.load.length) $.load[0].style.display = 'table'
		});
		$(document).ajaxComplete(function() {
			if ($.load && $.load.length) $.load.hide()
		});
	})();*/

	function getTarget(clazz, fnname) {
		var pre = (arguments.callee.caller.name || fnname) + '-',
			arr = clazz.split(' '),
			len = arr.length,
			tar = null
			
		while (len--) {
			if (arr[len].indexOf(pre) !== -1) {
				tar = $('#' + arr[len].replace(pre, ''))
				break;
			}
		}
		return tar
	}

	var connArr = ['tab', 'close', 'toggleClazz', 'hovershow', 'iframelike', 'validate', 'scrolldownload', 'submit']
	jQuery.runConnect(connArr)
})(window, jQuery)

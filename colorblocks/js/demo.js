/*****************************************************************
PUBSUB PATTERN
*****************************************************************/

pubsub = {
	/* 	in the subscribers object, add a catchall array type */
	subscribers : {
		any : [] 
	},
	
	/* subscribe(func, 'navclick') where func is the callback function 
	and navclick is what you are subscribing to. add the pairing to the 
	subscribers obj as an array */
	subscribe : function(fn, type) {
		type = type || 'any'; 
		if (typeof this.subscribers[type] === 'undefined') {
			this.subscribers[type] = [];
		}
		this.subscribers[type].push(fn);
	},
	
	/* remove from subscribers obj */
	unsubscribe : function(fn, type) {
		this.visitSubscribers('unsubscribe', fn, type);
	},
	
	/* publish(args, 'navclick') args are arguments for the callback function */
	publish : function(publication, type) {
		this.visitSubscribers('publish', publication, type);
	},
	
	/* loop through the subscribers obj[array] and call the functions 
	passing in args if there are any */
	visitSubscribers : function(action, arg, type) {
		var pubtype = type || 'any',
			subscribers = this.subscribers[pubtype],
			max = this.subscribers[pubtype].length;
			
		for (; max--;) {
			if (action === 'publish') {
				subscribers[max](arg);
			} else {
				/* unsubscribe bit here--remove it from the array if you passed in
				the function that matches subscribers[max] */
				if (subscribers[max] === arg) {
					subscribers.splice(max, 1);
				}
			}
		}
	}
};



/*****************************************************************
UTILS
*****************************************************************/

var utils = {
	addClass : function (elem, name) {
		var klass = elem.getAttribute('class'),
			pattern = new RegExp(name);
					
		if (pattern.test(klass) === true){
			return true;
		} else if (!(klass)){
			elem.setAttribute("class", name);
			return false;
		} else if (klass && klass != name) {
			elem.setAttribute("class", klass += ' ' +name );
			return false;
		}
	},
	
	removeClass : function (elem, name) {
		var klass = elem.getAttribute("class"),
			pattern = new RegExp(name);
			console.log(pattern.test('active'))
			if (pattern.test(klass) === true) {
				if (/\s/.test(klass) === false) {
					elem.removeAttribute('class'); 
					return false;
				}
				elem.setAttribute("class", klass.replace(pattern, ''));
			}
	}

};



/*****************************************************************
COLOR BLOCK
*****************************************************************/

var CB = {

	blocks : {
		change : function(navclick) {
			var elem = document.getElementById(navclick);
			if (elem !== null) {
				elem.innerHTML = 'this used to be bright ' + navclick;
				utils.addClass(elem, 'active');
				localStorage.setItem(navclick, 'block');
			}
		},
		
		storage : function() {
			for (var i in localStorage) {
				if (localStorage[i] === 'block') {
					this.change(i);
				}
			}
		},
		
		reset : function(secclick) {
			var elem = document.getElementById(secclick);
			if (secclick === 'reset') {
				for (var i in localStorage) {
					if (localStorage[i] === 'block') {
						var elems = document.getElementById(i);
						
						localStorage.removeItem(i, localStorage[i]);
						utils.removeClass(elems, 'active');
						elems.innerHTML = i;
					}
				}
				
			} else {
				localStorage.removeItem(secclick, localStorage[secclick]);
				utils.removeClass(elem, 'active');
				elem.innerHTML = secclick;
			}
			
		}
	},
	
	notifyNav : function(evt) {
		pubsub.publish(evt.target.innerHTML, 'navclick')
	},
	
	notifySec : function(evt) {
		pubsub.publish(evt.target.id, 'secclick')
	},
	
	templateData : {
		colors:['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'], 
		title:'color blocks', 
		instructions: 'Click on a nav link to fade the corresponding color block. Click on a color block to reset it or click the reset button to reset all the blocks.',
		info: 'HTML5, localStorage, CSS3 transitions, javascript pubsub pattern and embedjs template',
	},
		
	
	init : function() {
		var html = new EJS({url: 'blocks.ejs'}).render(CB.templateData);
		document.getElementsByTagName('body')[0].innerHTML = html;
		pubsub.subscribe(CB.blocks.change, 'navclick');
		pubsub.subscribe(CB.blocks.reset, 'secclick');
		
		var nav = document.getElementsByTagName('nav')[0],
			sec = document.getElementsByTagName('section')[0];
			
		nav.addEventListener('click', CB.notifyNav, false);
		sec.addEventListener('click', CB.notifySec, false);
		CB.blocks.storage();
	},

}


window.onload = CB.init;


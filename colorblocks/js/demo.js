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
				if (subscribers[max] === arg) {
					subscribers.splice(max, 1);
				}
			}
		}
	}
};

/* param in an obj which will take on all the methods of the publisher obj */
function makePub(o) {
	var i;
	for(i in pubsub) {
		if (pubsub.hasOwnProperty(i) && typeof pubsub[i] === "function") {
			o[i] = pubsub[i];
		}
	}
	o.subscribers = {any:[]};
}


/*****************************************************************
COLOR BLOCK
*****************************************************************/

var CB = {

	blocks : {
		txt : function(navclick) {
			var elem = document.getElementById(navclick);
			if (elem !== null) {
				elem.innerHTML = 'this used to be bright ' + navclick;
			}
		},
		
		color : function(navclick) {
			var elem = document.getElementById(navclick);
			
			if (elem !== null) {
				$(elem).addClass('active');
				localStorage.setItem(navclick, 'block');
			}
			
		},
		
		storage : function() {
			for (var i in localStorage) {
				if (localStorage[i] === 'block') {
					this.color(i);
					this.txt(i); 
				}
			}
		},
		
		reset : function(secclick) {
			var elem = document.getElementById(secclick);
			if (secclick === 'reset') {
				for (var i in localStorage) {
					if (localStorage[i] === 'block') {
						localStorage.removeItem(i, localStorage[i]);
					}
				}
				window.location.reload();
			} else {
				localStorage.removeItem(secclick, localStorage[secclick]);
				$(elem).removeClass('active');
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
		info: 'HTML5, localStorage, CSS3 transitions, javascript pubsub pattern, embedjs template, jQuery 1.7.2',
	},
		
	
	init : function() {
		var html = new EJS({url: 'blocks.ejs'}).render(this.templateData);
		document.getElementsByTagName('body')[0].innerHTML = html;
		pubsub.subscribe(this.blocks.txt, 'navclick');
		pubsub.subscribe(this.blocks.color, 'navclick');
		pubsub.subscribe(this.blocks.reset, 'secclick');
		
		var nav = document.getElementsByTagName('nav')[0],
			sec = document.getElementsByTagName('section')[0];
			
		nav.addEventListener('click', this.notifyNav, false);
		sec.addEventListener('click', this.notifySec, false);
		this.blocks.storage();
	},

}


$(document).ready(function(){
	CB.init();
})

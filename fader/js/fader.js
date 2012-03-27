var OO = {

	/* function to find the top level children in an element--similar to jQuery's 
		   .children(). it takes three parameters. the first is the parent element 
		   you want to look in. the second is the node you want to find. the third is 
		   option and the default is set to return only elements.
		   called like: findKids('pElem', 'DIV') */
		
	findKids : function(parent, nodename, nodetype) {
		var nodetype = nodetype || 1,
			nodename = nodename.toUpperCase(),
			allChildren = parent.childNodes,
			cLen = allChildren.length,		
			foundKids = [],
			i; 
			
			for (i=0; i < cLen; i++ ){
				if(allChildren[i].nodeType == nodetype && allChildren[i].nodeName == nodename) {
					foundKids.push(allChildren[i]);
				}
			}
		
							
			return {
				foundKids : foundKids,
				foundKidsLen : foundKids.length
			}
	},
	
	addClass : function (elem, name) {
		var klass = elem.getAttribute('class'),
		pattern = new RegExp(name);	
		
		if (pattern.test(klass) === true){
			return false;
		} else if (!(klass)){
			elem.setAttribute("class", name);
		} else if (klass && klass != name) {
			
			elem.setAttribute("class", klass += ' ' +name );
		}
	},
	
	removeClass : function (elem, name) {
		var klass = elem.getAttribute("class"),
			pattern = new RegExp("\\s"+name);
			
			if (pattern.test(klass) === true) {
				if (/\s/.test(klass) === false) {
					elem.removeAttribute('class'); 
					return false;
				}
				elem.setAttribute("class", klass.replace(pattern, ''));
			}
	
	},
	
	controls : function(evt) { 
		var item = (evt.target.className.match(/\d/)[0]) -1,
			arr = OO.findKids(slides, 'section', 1),
			elem = arr.foundKids[item],
			j;
				
			OO.addClass(elem, 'active');
			OO.fader(elem, item, arr);
			
			for (j=0; j<arr.foundKidsLen; j++) {
				if (j != item) {
					OO.removeClass(arr.foundKids[j], 'active');
				}
			}
						
		evt.preventDefault();
	},
	
	fader : function (elem, item, arr) {
		var i = 0,
			j,
			herofade,
			elem,
			item;
		
		function fadeUp() {
			if ((i/10) !== 1 || i == "") {
				i++;
				elem.style.opacity = i/10;
				return i;
			} else if (i/10 == 1) {
				clearInterval(herofade);
				
				for (j=0; j<arr.foundKidsLen; j++) {
					if (j != item) {
						arr.foundKids[j].removeAttribute('style');
					}
				}
			}
		}
		
		var fadeInt = (function () {
			herofade = setInterval(function () {fadeUp();}, 50)
		})()
	},
	
	init : function(evt) {
		var wrap = document.getElementById('wrap'),
			slides = OO.findKids('wrap', 'div', 1);
	}

};
var wrap = document.getElementById('wrap'),
	slides = document.getElementById('slides'),
	nav = document.getElementsByTagName('nav')[0];
nav.addEventListener("click", OO.controls, false);
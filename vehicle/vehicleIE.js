/* create namespaces */
var NS = NS || {};
NS.Abstract = NS.Abstract || {};
NS.Instances = NS.Instances || {};
NS.garage = [];

/* getter/setters for vehicle name, seats and wheels. branching this for IE 
   was haaaard, hence the separate file... wah waaah waaaaaaaah */ 
NS.Abstract.Vehicle = function() {
	var _name, _seats, _wheels, _type;
	
	this.setName = function(name) {
		_name = name;
	},
	this.getName = function() {
		return _name;
	}
	this.setSeats = function(value) {
		_seats = value;
	},
	this.getSeats = function() {
		return _seats;
	},
	this.setWheels = function(value) {
		_wheels = value;
	},
	this.getWheels = function() {
		return _wheels;
	}
	this.setType = function(value) {
		_type = value;
	},
	this.getType = function() {
		return _type;
	}
	this.info = function() {
	    return 'This ' + this.getName() + ' is a ' + this.getType() + ' that has ' + this.getSeats() + ' seats and ' + this.getWheels() + ' wheels.';
	}

}

/* Car and Motorcyle are new constructors that inherit from Vehicle */
NS.Instances.Car = function() {};
NS.Instances.Car.prototype = new NS.Abstract.Vehicle();

NS.Instances.Motorcycle = function() {};
NS.Instances.Motorcycle.prototype = new NS.Abstract.Vehicle();

/* Utils is a series of methods that handle most of the UI work */
NS.Utils = {

	/* takes one param which is the obj created after submitting the form.
	   it creates a new instance of Car or Motorcycle, assigns it some properties,
	   pushes it to a global NS.NS.garage and returns it */
	makeOne : function(obj) { 
	var veh;
		switch(obj.type) {
			case 'Car':
			veh = new NS.Instances.Car();
				veh.setWheels(4);
				veh.setSeats(4);
				veh.setType(obj.type);
			break;
			
			case 'Motorcycle':
			veh = new NS.Instances.Motorcycle();
				veh.setWheels(2);
				veh.setSeats(1);
				veh.setType(obj.type);
			break;
		}
		
		veh.setName(obj.name);
		NS.garage.push(veh);
		return veh;
	},
	
	/* takes one param which is the form and puts the contents in 
	   an obj and then returns the obj. */
	popObj : function(form) {
		var formElems = form.elements,
			obj = {};
			
		for (var i=0; i < formElems.length; i++) {
			if (formElems[i].name != '') {
				obj[formElems[i].name] = formElems[i].value;
			}
		}
		return obj;
	},
	
	
	/* takes one param which is the obj returned by popObj().
	   it creates a few elements and augments the DOM to show the list of
	   vehicles created in the current session. it doesn't return anything */
	addList : function(obj) {
		var mUl,
			mLi = document.createElement('li');
		  
		if (! (document.getElementById('mList'))) {
			mUl = document.createElement('ul');
			mUl.setAttribute('id', 'mList')
		} else {
			mUl = document.getElementById('mList');
		}
		  	
		mLi.appendChild(document.createTextNode(obj.info()));
		mUl.appendChild(mLi);
		document.getElementById('container').appendChild(mUl);
	},
	
	
	/* takes no params and populates the dropdown with Instances. */
	dropDown : function() {
		var form = document.getElementById('NS_form'),
			select = document.getElementById('NS_type'),
			frag = document.createDocumentFragment(),
			opt,
			v;
			
		for (v in NS.Instances) {
			opt = document.createElement('option');
			opt.setAttribute('value', v);
			opt.appendChild(document.createTextNode(v));
			frag.appendChild(opt);
		}
		select.appendChild(frag);
	},
	
	
	/* takes no params and processes the form data. */ 
	process : function() {

		var form = document.getElementById('NS_form'),
			obj,
			vehicle;
		
		if (form.name.value == '') {
			alert('please enter a name');
			return false;
		} else {
			obj = NS.Utils.popObj(form);
			vehicle = NS.Utils.makeOne(obj);
					
			NS.Utils.addList(vehicle);
		
			return false;
		}
	},
	
	/* takes no params and so far just calls dropDown() but could 
	   call anything else needed onload */
	init : function() {
		NS.Utils.dropDown();
	}
}

/* my sad/quickndirty 'version' of the lovely and talented 
   $(document).ready(function(){ fun goes here…  }) */
window.onLoad = NS.Utils.init();




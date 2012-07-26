var BB = {};
BB.Abstract = {};
BB.Instance = {};

/* PART 1 
Following part 1 of the spec. Kinematics gets added to the Robot prototype via BB.Utils.
*/
BB.Abstract.Robot = function(botname, bottype) {
	
	if (!(this instanceof BB.Abstract.Robot)) {
		return new BB.Abstract.Robot(botname, bottype);
	}
	this.botname = botname || 'Hal';				
	this.bottype = bottype || 'Unipedal';
};

BB.Abstract.Robot.prototype = {
	getBotName : function(botname) {
		return this.botname;
	},
		
	setBotName : function(name) {
		this.botname = name;
	},
		
	getBotType : function(bottype) {
		return this.bottype;
	},
		
	setBotType : function(type) {
		this.bottype = type;
	}	
}

/* PART 2 
following part 2 of the spec and inherting
*/
BB.Instance.GoodBot = function(botname, bottype) {
	if (!(this instanceof BB.Instance.GoodBot)) {
		return new BB.Instance.GoodBot(botname, bottype);
	}
	
	this.setBotName(botname);
	this.setBotType(bottype);
	//Auto Spawn evil twin
	BB.Instance.bad = new BB.Instance.BadBot(botname, bottype);

};

BB.Instance.GoodBot.prototype = new BB.Abstract.Robot();

BB.Instance.BadBot = function(botname, bottype) {
	if (!(this instanceof BB.Instance.BadBot)) {
		return new BB.Instance.BadBot();
	}
	this.setBotName('Evil'+botname);
	this.setBotType(bottype);
};

BB.Instance.BadBot.prototype = new BB.Abstract.Robot();



/* UTILITES 
tools to get the job done...
*/
BB.Utils = {

	/* this is my pubsub pattern, short n sweet */
	subs : {},
	
	listen : function(name, fn, obj) {
		if (obj) {
			for (var i in obj) {
				this.subs[i] = this.subs[i] || [];
				this.subs[i].push(obj[i]);
			}
		} else {
			this.subs[name] = this.subs[name] || [];
			this.subs[name].push(fn);
		}
	},
	
	notify : function(name, args) {
		var i = this.subs[name].length;
		while(i--) {
			this.subs[name][i](args);
		}
	},
	
	/* no XHR provided so i made one. it takes the URL of the data you want to get
	and the callback function you want to run. */
	getInfo : function(url, fn) {
		var callback = function () {
			if(hr && hr.readyState === 4 && hr.status === 200) {
				fn(hr);
			}
		},
			hr;
	
		try{
			hr = new XMLHttpRequest();
		}
		catch(e){
			alert(e.message);
			var progIdArray = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'],
				i = progIdArray.length;
			
			while(i--) {
				try {
					hr = new ActiveXObject(progIdArray[i]);
					alert(hr)
				}
				catch(e) { 
					alert(e.message);
				}
			}
			
			if(!hr) {
				alert('no request created');
			}
		};
		
			
		hr.onreadystatechange = callback;
		hr.open("GET", url);
		hr.send(null);
		
	},

	/* get the list of kinematic types with the getInfo function and add the results to 
	the BB.Abstract.Robot prototype */
	getKinematics :  function() {
		var callback = function(data) {
			var res_data = JSON.parse(data.responseText);
			//var res_data = (new Function ("return " + data.responseText ))();
			
			BB.Abstract.Robot.prototype.kinematics =  res_data.types;
			
			/* kick off the create form */
			BB.Utils.notify('renderCreate');
		}
		BB.Utils.getInfo('kinematics.json', callback);	
	},
	
	/* in lieu of a provided Json object I made my own.
	this method kicks off the whole process and is triggered on bot creation. it only
	runs once. */
	getTasks : function() {
		var callback = function(data) {
			data = JSON.parse(data.responseText);
			var i, j;
			
			console.log('my tasks are: ');
			
			for (i in data) {
				
				BB.Tasks.taskList.push(data[i]);
				for (j in data[i]) {
					console.log(j + ': ' + data[i][j]);
				}
			}
			
			BB.Utils.notify('queueTask');
			BB.Utils.notify('renderTasks');
		};
		
		
		BB.Utils.getInfo('tasks.json', callback);
	},
	
	queueTask : function() {
	/* first check to see if there are any tasks in the todo list. if there are, 
	then take the first task from the "tasklist" object and add it to "taskInProgress."
	Then remove that same task from "tasklist" and notify the "startTask" subscribers.
	if there aren't any tasks then log the "i'm all done" message. this method gets called
	repeatedly as tasks are completed.
	*/
	
		if (BB.Tasks.taskList.length > 0) {
			BB.Tasks.tasksInProgress.push(BB.Tasks.taskList[0]);
			BB.Tasks.taskList.splice(0, 1);
			BB.Utils.notify('startTask');
		} else {
			console.log('i\'m all done');
			return;
		}
	},

	startTask : function() {
		/* loop through inprogress object and console log "starting message" with the 
		task and estimated time. then notify "doTask" subscribers.
		*/
		console.log('starting: ' + BB.Tasks.tasksInProgress[0].name + ' and it should take approximately: ' + BB.Tasks.tasksInProgress[0].eta);
		BB.Utils.notify('doTask');
	},
	
	doTask : function() {
		/* loop through the inprogress object and create a new property of realTime 
		which takes the estimated time and adds a few milliseconds. setTimeout with 
		realTime and make the callback notify "taskComplete" subscribers with the realtime
		value as an argument.
		*/
		
		var eta = (parseInt(BB.Tasks.tasksInProgress[0].eta.slice(0, -1), 10)) * 1000,
			rt = eta + Math.random() * 10,
			fn = function(){
				BB.Utils.notify('completeTask', rt);
			};
			
		window.setTimeout(fn, rt);
	},
	
	completeTask : function(rt) {
		/* adjust the realtime number to be in seconds. add the current inprogress task 
		to the "tasksCompleted" object and remove the task from the "inprogress" object. 
		console log the completed task and notify the "queueTask" subscribers for some
		lather rinse repeat action. if more than 5 tasks have been completed then tell 
		the "badBot" subscribers.
		*/
		
		BB.Tasks.tasksInProgress[0].rt = ((rt/1000).toFixed(3)) + 's';
		BB.Tasks.tasksCompleted.push(BB.Tasks.tasksInProgress[0]);
		console.log('completed task: ' + BB.Tasks.tasksInProgress[0].name + ' in: ' + BB.Tasks.tasksInProgress[0].rt);
		BB.Tasks.tasksInProgress.splice(0, 1);
		if (BB.Tasks.tasksCompleted.length > 5) {
			BB.Utils.notify('badBot');
		}
		BB.Utils.notify('queueTask');
		BB.Utils.notify('renderTasks');
	},
	
	badBot : function() {
		/* generate a random number based on the number of tasks in the "tasksCompleted"
		object and use it to pull that task out of completed and back into todo. log the
		snarky message in console with the task.
		*/
		var max = BB.Tasks.tasksCompleted.length,
			ran = Math.floor(Math.random() * max);
			
			BB.Tasks.taskList.push(BB.Tasks.tasksCompleted[ran]);
			console.warn('f*** you ' + BB.Instance.goodbot.botname + '! i\'m making you do this again: ' + BB.Tasks.tasksCompleted[ran].name);
			BB.Tasks.tasksCompleted.splice(ran, 1);
			BB.Utils.notify('renderTasks');	
	},
	
	renderTasks : function() {
		/* make a bunch of elements and some fragments to handle the task lists for todo
		and completed. this gets called everytime a model changes.
		*/
		var todo = document.getElementById('todo'),
			complete = document.getElementById('complete'),
			todoFrag = document.createDocumentFragment(),
			completeFrag = document.createDocumentFragment(),
			i = BB.Tasks.taskList.length,
			j,
			k = BB.Tasks.tasksCompleted.length,
			l;
		todo.innerHTML = '';
		complete.innerHTML = '';
			
		while (i--) {
			var todoLi = document.createElement('li');
			
			for (j in BB.Tasks.taskList[i]) {
				if (BB.Tasks.taskList[i].hasOwnProperty(j)) {
					var todoCurTask = BB.Tasks.taskList[i],
						todoSpan = document.createElement('span');
					
					todoSpan.appendChild(document.createTextNode(todoCurTask[j]));
					todoSpan.setAttribute('class', j);
					todoLi.appendChild(todoSpan);
				}			
			}
			todoFrag.appendChild(todoLi);
		}
		
		while (k--) {
			var completeLi = document.createElement('li');
			
			for (l in BB.Tasks.tasksCompleted[k]) {
				if (BB.Tasks.tasksCompleted[k].hasOwnProperty(l)) {
					var completeCurTask = BB.Tasks.tasksCompleted[k],
						completeSpan = document.createElement('span');
					
					completeSpan.appendChild(document.createTextNode(completeCurTask[l]));
					completeSpan.setAttribute('class', l);
					completeLi.appendChild(completeSpan);
				}
			}
			completeFrag.appendChild(completeLi);
		}
		
		todo.appendChild(todoFrag);
		complete.appendChild(completeFrag);
	},
	
	renderBot : function() {
		/* same as above, make a bunch of elements and a fragment to handle the bot description.
		this gets kicked off once when you click the "create" button. In addition to the UI bits
		if notifies "getTasks" subscribers which starts the real business.
		*/
		var botFU = document.getElementById('bot'),
			botInfo = document.getElementById('botInfo'),
			create = document.getElementById('createForm'),
			createSpan = document.createElement('span'),
			botname = document.getElementById('createName').value,
			bottype = document.getElementById('createSelect').value,
			botFrag = document.createDocumentFragment(),
			name = document.createElement('span'),
			type = document.createElement('span'),
			h2 = document.createElement('h2');
			
		
		BB.Instance.goodbot = new BB.Instance.GoodBot(botname, bottype);
		
		create.innerHTML = '';
		type.setAttribute('child', 'last');
		
		createSpan.appendChild(document.createTextNode(BB.Instance.goodbot.getBotName() + ' Created!'));
		create.appendChild(createSpan);
		
		name.appendChild(document.createTextNode(BB.Instance.goodbot.getBotName()));
		botFrag.appendChild(name);
		
		type.appendChild(document.createTextNode(BB.Instance.goodbot.getBotType()));
		botFrag.appendChild(type);
		
		botInfo.appendChild(botFrag);
		botFU.setAttribute('class', bottype.toLowerCase());
		
		
		BB.Utils.notify('getTasks');
	},
	
	renderCreate : function() {
		/* make a few elements and a fragment to handle the create form. use the kinematics
		array to populate the dropdown.
		*/
		var createFU = document.getElementById('create').getElementsByTagName('select')[0],
			createFrag = document.createDocumentFragment(),
			kinematics = BB.Abstract.Robot.prototype.kinematics,
			i = kinematics.length;
					
		while (i--) {
			var opt = document.createElement('option');
			opt.setAttribute('value', kinematics[i]);
			opt.appendChild(document.createTextNode(kinematics[i]));
			createFrag.appendChild(opt);
		}
		createFU.appendChild(createFrag);	
	},
	
	/* John Resig */
	addEvent : function ( obj, type, fn ) {
	  if ( obj.attachEvent ) {
	    obj['e'+type+fn] = fn;
	    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
	    obj.attachEvent( 'on'+type, obj[type+fn] );
	  } else
	    obj.addEventListener( type, fn, false );
	},
	
	init : function() {
		/* whole lotta listening going on… */
		
		obj = {
			'getKinematics': BB.Utils.getKinematics,
			'queueTask': BB.Utils.queueTask,
			'startTask': BB.Utils.startTask,
			'doTask': BB.Utils.doTask,
			'completeTask': BB.Utils.completeTask,
			'getTasks': BB.Utils.getTasks,
			'badBot': BB.Utils.badBot,
			'renderTasks': BB.Utils.renderTasks,
			'renderBot': BB.Utils.renderBot,
			'renderCreate': BB.Utils.renderCreate
		};
		
		BB.Utils.listen('', '',obj);
				
		/* get the bot types */
		BB.Utils.notify('getKinematics');
					
		/* evt listener to handle the click */
		BB.Utils.addEvent(document.getElementById('createSubmit'), 'click', function(evt) {
			if (evt.preventDefault) {
				evt.preventDefault();
			} else {
				evt.cancelBubble = true;
			}
			BB.Utils.notify('renderBot');
		})
	},
	
	ready : function(fn) {
		/* bitchin domready from Dustin Diaz 
		http://www.dustindiaz.com/smallest-domready-ever/ 
		*/
		var str = /in/;
		str.test(document.readyState) ? setTimeout('BB.Utils.ready(' + fn + ')', 9) : fn();
	}
};

/* TASK MODELS */
/* arrays in case order matters */
BB.Tasks = {
	taskList : [],
	tasksInProgress : [],
	tasksCompleted : []
};

/* ready… set… */	
BB.Utils.ready(BB.Utils.init);	
	



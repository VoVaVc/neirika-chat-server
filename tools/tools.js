const 	stackTrace 	= require('stack-trace');

exports.catcher = function(err) {
	console.log('error occured')
	console.log(err);

	var trace = stackTrace.parse(err);
	console.log(trace)
};

exports.error = function(description){
	var err = new Error('something went wrong');
	var trace = stackTrace.parse(err);

 	return {
		'error': true,
		'description': description,
		'caller': trace
	}
}

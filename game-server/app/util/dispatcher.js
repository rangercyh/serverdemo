module.exports.dispatch = function(count, connectors) {
	var index = Number(count) % connectors.length;
	return connectors[index];
};

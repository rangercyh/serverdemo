var comm = module.exports;


comm.checkUsername = function(username) {
	var pattern = /^(\w){6,20}$/;	// 6-20个字母、数字、下划线组成
	if (!pattern.exec(username)) {
		return false;
	}
	return true;
};



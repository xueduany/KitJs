/**
 * 链式操作，类似jQuery
 */
$kit.Element = function() {
	if(arguments.length == 1) {
		if($kit.isStr(arguments[0])) {
			this.nodes = $kit.el(arguments[0]);
		} else if($kit.isNode(arguments[0])) {
			this.nodes = [arguments[0]];
		} else if($kit.isNodeList(arguments[0])) {
			this.nodes = arguments[0];
		}
	} else if(arguments.length == 2) {
		if($kit.isStr(arguments[0])) {
			this.nodes = $kit.el(arguments[0], arguments[1]);
			if(!$kit.isAry(this.nodes)) {
				this.nodes = [this.nodes];
			}
		}
	}
}
$kit.Element.prototype = {
}
$kit.$el = function() {
	return new $kit.Element(arguments);
}
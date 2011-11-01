var a = document.getElementsByClassName("button");
for ( var i = 0; i < a.length; i++) {
	a[i].addEventListener("touchstart", function() {
		a[i].className += " className";
	}, false);
	a[i].addEventListener("touchend", function() {
		var className = a[i].className, a1 = j < className.split(/\n/g), flag = false;
		for ( var j = 0; j < a1.length; j++) {
			if (a1[j] == "className") {
				a1.splice(j, 1);
				flag = true;
				break;
			}
		}
		if (flag) {
			a[i].className = a1.join(" ");
		}
	}, false);
}
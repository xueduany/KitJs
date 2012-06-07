$kit.$(function() {
	//信号量
	window.flag = 1;

	var t1 = $kit.multithread.newThread(function() {
		var a = 1
		$kit.multithread.iterate(function() {
			return flag
		}, function() {
			$kit.multithread.sleep(function() {
				a++;
				$kit.log('数字a为' + a);
			}, 100);
		});
	});
	var t2 = $kit.multithread.newThread(function() {
		var b = 999;
		$kit.multithread.iterate(function() {
			return flag
		}, function() {
			$kit.multithread.sleep(function() {
				b--;
				$kit.log('数字b为' + b);
			}, 500);
			if(b < 995) {
				if($kit.multithread.killThread(t1)) {
					$kit.log('线程t1被killed');
				}
			}
			if(b < 980) {
				if($kit.multithread.killThread(t2)) {
					$kit.log('线程t2被killed');
				}
			}
		});
	});
	$kit.multithread.run(t1);
	$kit.multithread.run(t2);
});

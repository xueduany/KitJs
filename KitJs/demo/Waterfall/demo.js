$kit.$(function() {
	var waterfall = new $kit.ui.Waterfall({
		container : $kit.el('#ColumnContainer'),
		load : function(success, end) {
			//$('#loadingPins').show();
			var currentPage = 1;
			$kit.io.josnp({
				url : 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=5d93c2e473e39e9307e86d4a01381266&tags=rose&page=' + currentPage + '&per_page=20&format=json&_ksTS=1339665079110_92&jsoncallback=dealWithJSONPData',
				onSuccess : function() {
					currentPage = window.loadedData.photos.page + 1;
					//alert(window.loadedData.photos.photo.length);
					var items = [];
					$kit.each(window.loadedData.photos.photo, function(item) {
						item.height = Math.round(Math.random() * (300 - 180) + 180);
						// fake height
						items.push($kit.newHTML($kit.tpl(['<div class="pin ks-waterfall" data-id="${id}">', //
						'<a href="#" class="image">', //
						'<img height="${height}" alt="${title}" src="http://farm${farm}.static.flickr.com/${server}/${id}_${secret}_m.jpg"/>', //
						'</a>', //
						'<p class="description">${title}</p>', //
						'</div>'//
						].join(''), item)).childNodes[0]);
					});
					success(items);
				}
			})
		},
		minColCount : 2,
		colWidth : 228
		//align:'left' // right, center (default)
	});
});
function dealWithJSONPData(d) {
	window.loadedData = d;
}
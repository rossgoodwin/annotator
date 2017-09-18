$(function(){

var fn = '';

var annotations = {
	'text': '',
	'annotations': []
};

var tagsInUse = [];

var quill = new Quill('#editor', {
	readOnly: true,
	placeholder: 'Upload a .txt file and its text will appear here.'
});

quill.on('selection-change', function(range, oldRange, source){
	// var selectionObj = quill.getSelection();

	quill.removeFormat(0, quill.getLength());

	if (range && range.length) {
		quill.formatText(range.index, range.length, {'background-color': 'rgb(197, 239, 247)'});	
	}
	else if (oldRange && oldRange.length) {
		quill.formatText(oldRange.index, oldRange.length, {'background-color': 'rgb(197, 239, 247)'});	
	}

	for (var i=0; i<annotations['annotations'].length; i++) {
		var curAnnotation = annotations['annotations'][i];
		var annotationIndex = curAnnotation['index'];
		var annotationLength = curAnnotation['length'];
		quill.formatText(annotationIndex, annotationLength, {'background-color': 'rgb(46, 204, 113)'});
	}
});

$('#vis-file-upload').click(function(){
	$('#file-upload').click();
})

$('#file-upload').on('change', function(){
	var file = this.files[0];
	// console.log(file.name);
	if (!file.name.toLowerCase().endsWith('.txt')) {
		alert("txt files only!");
	}
	else {
		fn = file.name;
		var reader = new FileReader();
		reader.onload = function(e) {
			var text = reader.result;
			// console.log(text);
			quill.insertText(0, text);
			annotations['text'] = text;
			$('#vis-file-upload').fadeOut('fast');
		}
		reader.readAsText(file, 'UTF-8');
	}
});

function reduceLength(str, maxLen) {
	if (str.length > maxLen) {
		return str.substring(0, maxLen) + '...';
	}
	else {
		return str;
	}
}


$('#annotation-button').click(function(){
	var selectionObj = quill.getSelection(focus=true);
	var note = $('#annotation-input').val().trim();
	var tag = $('#tag-input').val().trim();
	if (selectionObj.length === 0) {
		alert("no text highlighted!");
	}
	else if ( !(note || tag) ) {
		alert("no annotation!");
	}
	else {
		if (tag && !tagsInUse.includes(tag)) {
			$('#tags').append('<option>'+tag+'</option>');
			tagsInUse.push(tag);
		}
		annotations['annotations'].push({
			'tag': tag,
			'note': note,
			'index': selectionObj.index,
			'length': selectionObj.length
		});

		var textAnnotated = quill.getText(selectionObj.index, selectionObj.length);

		// var maxLen = 64;

		var combinedText = '<em>' + reduceLength(textAnnotated, 32) + '</em><span class="tag-pill">' + tag + '</span>' + reduceLength(note, 64);

		// if (combinedText.length > maxLen) {
		// 	var displayNote = combinedText.substring(0,maxLen)+'...';
		// }
		// else {
		// 	var displayNote = combinedText;
		// }
		$('#annotation-stack').prepend('<p>'+combinedText+'</p>')

		quill.formatText(selectionObj.index, selectionObj.length, {'background-color': 'rgb(46, 204, 113)'})

		// clear text boxes
		$('#annotation-input').val('');
		$('#tag-input').val('');
	}
});

$('#annotation-download').click(function(){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotations));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", fn+"_annotations.json");
	dlAnchorElem.click();
});

});
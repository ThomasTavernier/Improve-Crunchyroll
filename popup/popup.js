function update() {
	for (let inputText of INPUTS_TEXT) {
		document.getElementById(inputText).value = chromeStorage[inputText];
	}
	for (let attribute of ATTRIBUTES) {
		document.getElementById(attribute).checked = chromeStorage[attribute];
	}
}

function inputListOnChange(ev) {
	ev.target.value = ev.target.value.replace('.', ',').replace(',,', ',').replace(/[^\d\,]/g, '');
}

function inputTextOnChange(ev) {
	let obj = {};
	obj[ev.target.id] = ev.target.value;
	chrome.storage.local.set(obj);
}

function inputCheckboxOnChange(ev) {
	let obj = {};
	obj[ev.target.id] = ev.target.checked;
	chrome.storage.local.set(obj);
}

function reset() {
	if(confirm(chrome.i18n.getMessage('reset_confirm'))) {
		chrome.storage.local.clear();
		update();
	}
}

function init() {
	let stylesheet = document.createElement('style');
	stylesheet.type = 'text/css';
	document.head.appendChild(stylesheet);

	document.getElementById("reset").addEventListener("click", reset);
	for (let inputText of document.getElementsByClassName('inputText')) {
		inputText.addEventListener('input', (event) => inputListOnChange(event));
		inputText.addEventListener('change', (event) => inputTextOnChange(event));
	}
	for (let inputCheckbox of document.getElementsByClassName('inputCheckbox')) {
		inputCheckbox.addEventListener('change', (event) => inputCheckboxOnChange(event));
	}

	for (let elementToTranslate of document.querySelectorAll('[translate]')) {
		elementToTranslate.innerHTML = chrome.i18n.getMessage(elementToTranslate.innerHTML);
		elementToTranslate.removeAttribute('translate');
	};

	setTimeout(() => {
		stylesheet.innerHTML = `
			.slider:before {
				transition: .5s;
			}`
	});
}

setTimeout(init);

chromeStorageInit = function () {
	update();
};
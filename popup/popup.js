function update() {
	INPUTS_TEXT.forEach(inputText => document.getElementById(inputText).value = chromeStorage[inputText]);
	INPUTS_CHECKBOX.forEach(inputCheckbox => document.getElementById(inputCheckbox).checked = chromeStorage[inputCheckbox]);
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
	if (confirm(chrome.i18n.getMessage('reset_confirm'))) {
		chrome.storage.local.clear();
		update();
	}
}

function init() {
	let stylesheet = document.createElement('style');
	stylesheet.type = 'text/css';
	document.head.appendChild(stylesheet);
	document.getElementById("reset").addEventListener("click", reset);
	document.querySelectorAll('.inputText').forEach(inputText => {
		inputText.addEventListener('input', (event) => inputListOnChange(event));
		inputText.addEventListener('change', (event) => inputTextOnChange(event));
	});
	document.querySelectorAll('.inputCheckbox').forEach(inputCheckbox => {
		inputCheckbox.addEventListener('change', (event) => inputCheckboxOnChange(event));
	});
	document.querySelectorAll('[translate]').forEach(elementToTranslate => {
		elementToTranslate.innerHTML = chrome.i18n.getMessage(elementToTranslate.innerHTML);
		elementToTranslate.removeAttribute('translate');
	});
	setTimeout(() => {
		stylesheet.innerHTML = `
			.slider:before {
				transition: .5s;
			}
		`
	});
}

setTimeout(init);

chromeStorageInit = function () {
	update();
};
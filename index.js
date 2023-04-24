//IMPORT-CSS-AND-SOME-STUFF//
import utils from './_utils'
import data from './configs/config.json' 
import '//plugins/theme/theme.css'

//CREATE-HOME-PAGE//
function create_element(tagName, className, content) {
	const el = document.createElement(tagName);
	el.className = className;
	if (content) {
		el.innerHTML = content;
	}
	return el;
};

function go_to_default_home_page() {
	if ("home") {
		document.querySelector(`lol-uikit-navigation-item[item-id='${"home"}']`).click()
	}
}

function add_home_page() {
	let lol_home = document.querySelector(".rcp-fe-lol-home > lol-uikit-section-controller")

	if (lol_home) {
		if (!lol_home.querySelector("[section-id='home']")) {
			let home = create_element("lol-uikit-section", "")
			let div = create_element("div", "wrapper")

			div.id = "home"
			home.setAttribute("section-id", "home")
			home.append(div)
			lol_home.prepend(home)
		}
	}
}

function add_home_navbar() {
	let navbar = document.querySelector(".rcp-fe-lol-home > lol-uikit-navigation-bar")

	if (navbar) {
		if (!navbar.querySelector("[item-id='home']")) {
			let home_navbar_item = create_element("lol-uikit-navigation-item", "")

			home_navbar_item.setAttribute("item-id", "home")
			home_navbar_item.setAttribute("priority", 1)
			home_navbar_item.textContent = "Home"
			navbar.prepend(home_navbar_item)
		}
	}
}

let pageChangeMutation = (node) => {
	let pagename;
	pagename = node.getAttribute("data-screen-name")

	console.log(pagename)
	if (pagename == "rcp-fe-lol-home-main") {
		add_home_page()
		add_home_navbar()
		go_to_default_home_page()
	}
	if (pagename == "rcp-fe-lol-uikit-full-page-modal-controller") {
		return;
	}
    
}

window.addEventListener('load', () => {
	utils.mutationObserverAddCallback(pageChangeMutation, ["screen-root"])
})

//SETTINGS//
window.setInterval(() => { 
	try {
		document.getElementsByClassName("lol-settings-container")[0].style.backgroundColor = "black";
		document.querySelector(".lol-settings-container").
            shadowRoot.querySelector("div").style.background = "black";
	}
	catch {}

	try {
		document.querySelector("lol-uikit-full-page-backdrop > lol-uikit-dialog-frame > div > div.challenges-identity-customizer-contents > div.challenges-identity-customizer-left-container > div > lol-regalia-identity-customizer-element").
			shadowRoot.querySelector("div > lol-regalia-banner-v2-element").remove()
	}
	catch {}

	try {
		document.querySelector("lol-uikit-full-page-backdrop > lol-uikit-dialog-frame > div").style.backgroundColor = "black";
		document.querySelector("lol-uikit-full-page-backdrop > lol-uikit-dialog-frame").
            shadowRoot.querySelector("div").style.background = "black";
	}
	catch {}
	try {
		document.querySelector("#lol-uikit-layer-manager-wrapper > div.modal > div > lol-uikit-dialog-frame").
            shadowRoot.querySelector("div").style.background = "black"
	}
	catch {}
}, 100)

//DODGE//
async function dodgeQueue(){
	await fetch("/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=[\"\",\"teambuilder-draft\",\"quitV2\",\"\"]",
		{"body":"[\"\",\"teambuilder-draft\",\"quitV2\",\"\"]", "method":"POST"})
 }

 window.dodgeQueue = dodgeQueue

 function generateDodgeAndExitButton(siblingDiv) {
	const div = document.createElement("div");
	const parentDiv = document.createElement("div")

	parentDiv.setAttribute("class", "dodge-button-container")
	parentDiv.setAttribute("style", "position: absolute;right: 10px;bottom: 57px;display: flex;align-items: flex-end;")
	div.setAttribute("class", "quit-button ember-view");
	div.setAttribute("onclick", "window.dodgeQueue()")
	div.setAttribute("id", "dodgeButton");

	const button = document.createElement("lol-uikit-flat-button");
	button.innerHTML = "Dodge";
	
	div.appendChild(button);

	parentDiv.appendChild(div);
	console.log(parentDiv)
	siblingDiv.parentNode.insertBefore(parentDiv, siblingDiv)
 }

 let addDodgeAndExitButtonObserver = (mutations) => {
	if (utils.phase == "ChampSelect" && document.querySelector(".bottom-right-buttons") && !document.querySelector(".dodge-button-container")){
		generateDodgeAndExitButton(document.querySelector(".bottom-right-buttons"))
	}
 }

 window.addEventListener('load', () => {
	utils.routineAddCallback(addDodgeAndExitButtonObserver, ["bottom-right-buttons"])
})
	
//AUTO-ACCEPT//
let auto_accept = data["is_auto_accept_enabled"]
let queue_accepted = false 
	
	
function autoAcceptQueueButton(){
	let element = document.getElementById("autoAcceptQueueButton")
	if (element.attributes.selected != undefined) {
		auto_accept = false
		element.removeAttribute("selected")
	}
	else {
		element.setAttribute("selected", "true")
		auto_accept = true
	}
	}
	
window.autoAcceptQueueButton = autoAcceptQueueButton
	
	
let autoAcceptCallback = async message => {
		utils.phase = JSON.parse(message["data"])[2]["data"]
		if (utils.phase == "ReadyCheck" && auto_accept && !queue_accepted) {
			await acceptMatchmaking()
			queue_accepted = true
		}
		else if (utils.phase != "ReadyCheck") {
			queue_accepted = false
		}
	}
	
function fetch_or_create_champselect_buttons_container() {
	if (document.querySelector(".cs-buttons-container")) {
		return document.querySelector(".cs-buttons-container")
	}
	else {
		const div = document.createElement("div")
	
		div.className = "cs-buttons-container"
		document.querySelector(".v2-footer-notifications.ember-view").append(div)
		return div
	}
	}
	
	
let autoAcceptMutationObserver = (mutations) => {
	if (document.querySelector(".v2-footer-notifications.ember-view") != null && document.getElementById("autoAcceptQueueButton") == null) {
		let newOption = document.createElement("lol-uikit-radio-input-option");
		let container = fetch_or_create_champselect_buttons_container()
		
	newOption.setAttribute("id", "autoAcceptQueueButton");
	newOption.setAttribute("onclick", "window.autoAcceptQueueButton()");
	if (auto_accept){
		newOption.setAttribute("selected", "");
	}
	newOption.innerHTML = "<div class='auto-accept-button-text'>Auto Accept</div>";
	container.append(newOption);
	}
	}
	
window.addEventListener('load', () => {
	utils.subscribe_endpoint('/lol-gameflow/v1/gameflow-phase', autoAcceptCallback)
	utils.routineAddCallback(autoAcceptMutationObserver, ["v2-footer-notifications.ember-view"])
})
	
let acceptMatchmaking = async () => await fetch('/lol-matchmaking/v1/ready-check/accept', { method: 'POST' })

console.clear()
console.log('theme injected')
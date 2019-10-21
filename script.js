// Code by Kevin Franke
// Dated March 2014
// Usage by permission only

//Inital Standard Settings
var transmits_per_day					= 22;
var engineering_message_frequency		= 14; //days
var engineering_message_per_day 		= 1 / engineering_message_frequency;
var gps_manual_fix_seconds				= 59; //seconds
var vertically_mounted					= false;
var gps_estimated_fix_seconds_override 	= false;
//Constants

//Device Specs
var switcher_efficiency 			= 90; //Percent
var switcher_vin 					= 6; //VDC
var switcher_vout 					= 3.3; //VDC
//Battery Capacity
var battery_spec_mah 				= 3750; //mAh
var battery_spec_uas 				= battery_spec_mah * 1000 * 60 * 60; //uAs
var battery_derating 				= 5; //Percent
var battery_usable_uas 				= (1 - (battery_derating / 100)) * battery_spec_uas * (switcher_efficiency / 100);
var stx_on_tx_ua 					= 380000; //at battery uAs?
var gps_on_search_ua 				= 30000; //at battery uAs
var non_tx_active_stx_ua 			= 250; //at battery uAs. Adjusted from 245 to 250 after measure kf 4/14/14
var avg_sec_between_tx 				= 450; //7.5 minutes * 60 = 450 seconds between each packet
//Transmit Power
var single_xmission_seconds 		= 1.4; //Seconds STX is transmitting for 1 packet
var num_bursts_per_msg 				= 3; //3 redundent packets for all normal messages. Prev was 5 in chan C zones
var stx_msg_uas 					= single_xmission_seconds * num_bursts_per_msg * stx_on_tx_ua;
var between_stx_tx_uas 				= avg_sec_between_tx * (num_bursts_per_msg - 1) * non_tx_active_stx_ua;
var msg_xmission_uas 				= stx_msg_uas + between_stx_tx_uas;
//GPS Power
var gps_vertical_impact_percent 	= 1; //200 percent longer 55 horizontal = 110 vertical
var gps_warmstart_solution_seconds 	= 15 * gps_vertical_impact_percent; //Seconds
var gps_coldstart_solution_seconds 	= 55 * gps_vertical_impact_percent; //Seconds
var gps_timeout_seconds 			= 240; //Seconds
var gps_warmstart_percentage 		= ( ((transmits_per_day * 4) / 100) > 0.9 ? 0.9 : ((transmits_per_day * 4) / 100)) * 100; //If we're fixing every hour. 
var gps_timeout_percentage 			= 4; //Percent
var gps_coldstart_percentage 		= Math.ceil((1 - (gps_timeout_percentage / 100) - (gps_warmstart_percentage / 100)) * 100); 
var gps_estimated_fix_seconds 		= (gps_warmstart_solution_seconds * (gps_warmstart_percentage / 100)) + (gps_coldstart_solution_seconds * (gps_coldstart_percentage / 100)) + (gps_timeout_seconds * (gps_timeout_percentage / 100));
var gps_mean_uas_per_day 			= transmits_per_day * gps_estimated_fix_seconds * gps_on_search_ua;
//Sleep Power
var sleep_current_uas 				= 35; //uAs. Adjusted from 30 to 35 after measure 3 devices & avg their usage kf 4/14/14
var sleep_current_per_day_uas 		= sleep_current_uas * 60 * 60 * 24; //Sec * Min * Hr
//Total Power
var total_current_used_per_day_uas 	= sleep_current_per_day_uas + gps_mean_uas_per_day + (msg_xmission_uas * transmits_per_day) + (msg_xmission_uas * engineering_message_per_day);
//Estimated Life
var days_of_life 					= Math.ceil(battery_usable_uas / total_current_used_per_day_uas);
var years_of_life 					= (days_of_life / 365).toFixed(2);
var total_transmits 				= days_of_life * transmits_per_day;




//HTML Elements
//Standard Settings Dom
var transmits_per_day_dom;
var transmits_per_day_value_dom;
var engineering_message_frequency_dom;
var engineering_message_frequency_value_dom;
var vertically_mounted_dom;
var gps_estimated_fix_seconds_override_dom;
var gps_manual_fix_seconds_dom;
var gps_manual_fix_seconds_value_dom;
//Device Specs DOM
var switcher_efficiency_dom;
var switcher_vin_dom;
var switcher_vout_dom;
//Battery Capacity DOM
var battery_spec_mah_dom;
var battery_spec_uas_dom;
var battery_derating_dom;
var battery_usable_uas_dom;
var stx_on_tx_ua_dom;
var gps_on_search_ua_dom;
var non_tx_active_stx_ua_dom;
var avg_sec_between_tx_dom;
//Transmit Power DOM
var single_xmission_seconds_dom;
var num_bursts_per_msg_dom;
var stx_msg_uas_dom;
var between_stx_tx_uas_dom;
var msg_xmission_uas_dom;
//GPS Power DOM
var gps_warmstart_solution_seconds_dom;
var gps_coldstart_solution_seconds_dom;
var gps_timeout_seconds_dom;
var gps_warmstart_percentage_dom;
var gps_coldstart_percentage_dom;
var gps_timeout_percentage_dom;
var gps_estimated_fix_seconds_dom;
var gps_mean_uas_per_day_dom;
//Sleep Power DOM
var sleep_current_uas_dom;
var sleep_current_per_day_uas_dom;
//Total Power DOM
var total_current_used_per_day_uas_dom;
//Estimation Results DOM
var days_of_life_dom;
var years_of_life_dom;
var total_transmits_dom;



//Run after DOM is loaded to avoid null errors
function initialize(){
	//OEM Settings Elements
	oem_elements_class 							= document.getElementsByClassName("oem");
	//Standard Settings Dom
	transmits_per_day_dom 						= document.getElementById("transmits_per_day");
	transmits_per_day_value_dom 				= document.getElementById("transmits_per_day_value");
	engineering_message_frequency_dom 			= document.getElementById("engineering_message_frequency");
	engineering_message_frequency_value_dom 	= document.getElementById("engineering_message_frequency_value");
	vertically_mounted_dom 						= document.getElementById("vertically_mounted");
	gps_estimated_fix_seconds_override_dom 		= document.getElementById("gps_estimated_fix_seconds_override");
	gps_manual_fix_seconds_dom 					= document.getElementById("gps_manual_fix_seconds");
	gps_manual_fix_seconds_value_dom 			= document.getElementById("gps_manual_fix_seconds_value");
	//Device Specs DOM
	switcher_efficiency_dom 					= document.getElementById("switcher_efficiency");
	switcher_vin_dom 							= document.getElementById("switcher_vin");
	switcher_vout_dom 							= document.getElementById("switcher_vout");
	//Battery Capacity DOM
	battery_spec_mah_dom 						= document.getElementById("battery_spec_mah");
	battery_spec_uas_dom 						= document.getElementById("battery_spec_uas");
	battery_derating_dom 						= document.getElementById("battery_derating");
	battery_usable_uas_dom 						= document.getElementById("battery_usable_uas");
	stx_on_tx_ua_dom 							= document.getElementById("stx_on_tx_ua");
	gps_on_search_ua_dom 						= document.getElementById("gps_on_search_ua");
	non_tx_active_stx_ua_dom 					= document.getElementById("non_tx_active_stx_ua");
	avg_sec_between_tx_dom 						= document.getElementById("avg_sec_between_tx");
	//Transmit Power DOM
	single_xmission_seconds_dom 				= document.getElementById("single_xmission_seconds");
	num_bursts_per_msg_dom 						= document.getElementById("num_bursts_per_msg");
	stx_msg_uas_dom 							= document.getElementById("stx_msg_uas");
	between_stx_tx_uas_dom 						= document.getElementById("between_stx_tx_uas");
	msg_xmission_uas_dom 						= document.getElementById("msg_xmission_uas");
	//GPS Power DOM
	gps_warmstart_solution_seconds_dom 			= document.getElementById("gps_warmstart_solution_seconds");
	gps_coldstart_solution_seconds_dom 			= document.getElementById("gps_coldstart_solution_seconds");
	gps_timeout_seconds_dom 					= document.getElementById("gps_timeout_seconds");
	gps_warmstart_percentage_dom 				= document.getElementById("gps_warmstart_percentage");
	gps_coldstart_percentage_dom 				= document.getElementById("gps_coldstart_percentage");
	gps_timeout_percentage_dom 					= document.getElementById("gps_timeout_percentage");
	gps_estimated_fix_seconds_dom 				= document.getElementById("gps_estimated_fix_seconds");
	gps_mean_uas_per_day_dom 					= document.getElementById("gps_mean_uas_per_day");
	//Sleep Power DOM
	sleep_current_uas_dom 						= document.getElementById("sleep_current_uas");
	sleep_current_per_day_uas_dom 				= document.getElementById("sleep_current_per_day_uas");
	//Total Power DOM
	total_current_used_per_day_uas_dom 			= document.getElementById("total_current_used_per_day_uas");
	//Estimation Results DOM
	days_of_life_dom 							= document.getElementById("days_of_life");
	years_of_life_dom 							= document.getElementById("years_of_life");
	total_transmits_dom 						= document.getElementById("total_transmits");	
};

//Set the defaults on initial load
function setDefaultValues(){
	//OEM Settings hidden at load
	for(e = 0; e < oem_elements_class.length; e++){oem_elements_class[e].style.display = "none";};
	//Standard Settings Dom
	transmits_per_day_dom.value 						= transmits_per_day;
	transmits_per_day_value_dom.innerHTML 				= "- (" + transmits_per_day + ")";
	engineering_message_frequency_dom.value 			= engineering_message_frequency;
	engineering_message_frequency_value_dom.innerHTML 	= "- (" + engineering_message_frequency + ")";
	vertically_mounted_dom.checked 						= vertically_mounted;
	gps_estimated_fix_seconds_override_dom.checked 		= gps_estimated_fix_seconds_override;
	gps_manual_fix_seconds_dom.value 					= gps_manual_fix_seconds;
	gps_manual_fix_seconds_value_dom.innerHTML 			= "- (" + gps_manual_fix_seconds + ")";
	//Device Specs DOM
	switcher_efficiency_dom.value						= switcher_efficiency;
	switcher_vin_dom.value								= switcher_vin;
	switcher_vout_dom.value 							= switcher_vout;
	//Battery Capacity DOM
	battery_spec_mah_dom.value							= battery_spec_mah;
	battery_spec_uas_dom.value 							= battery_spec_uas;
	battery_derating_dom.value 							= battery_derating;
	battery_usable_uas_dom.value 						= battery_usable_uas;
	stx_on_tx_ua_dom.value 								= stx_on_tx_ua;
	gps_on_search_ua_dom.value 							= gps_on_search_ua;
	non_tx_active_stx_ua_dom.value 						= non_tx_active_stx_ua;
	avg_sec_between_tx_dom.value 						= avg_sec_between_tx;
	//Transmit Power DOM
	single_xmission_seconds_dom.value 					= single_xmission_seconds;
	num_bursts_per_msg_dom.value 						= num_bursts_per_msg;
	stx_msg_uas_dom.value 								= Math.round(stx_msg_uas);
	between_stx_tx_uas_dom.value 						= between_stx_tx_uas;
	msg_xmission_uas_dom.value 							= Math.round(msg_xmission_uas);
	//GPS Power DOM
	gps_warmstart_solution_seconds_dom.value 			= gps_warmstart_solution_seconds;
	gps_coldstart_solution_seconds_dom.value 			= gps_coldstart_solution_seconds;
	gps_timeout_seconds_dom.value 						= gps_timeout_seconds;
	gps_warmstart_percentage_dom.value 					= gps_warmstart_percentage;
	gps_coldstart_percentage_dom.value 					= gps_coldstart_percentage;
	gps_coldstart_percentage_dom.title 					= "Note: Coldstart % should be greater than or equal to the GPS Failure % since the unit will most likely coldstart following a GPS Failure.";
	gps_timeout_percentage_dom.value 					= gps_timeout_percentage;
	gps_estimated_fix_seconds_dom.value 				= Math.round(gps_estimated_fix_seconds);
	gps_mean_uas_per_day_dom.value 						= Math.round(gps_mean_uas_per_day);
	//Sleep Power DOM
	sleep_current_uas_dom.value 						= sleep_current_uas;
	sleep_current_per_day_uas_dom.value 				= sleep_current_per_day_uas;
	//Total Power DOM
	total_current_used_per_day_uas_dom.value 			= total_current_used_per_day_uas;
	//Estimation Results DOM
	days_of_life_dom.value 								= days_of_life;
	years_of_life_dom.value 							= years_of_life;
	total_transmits_dom.value 							= total_transmits;	
};


//Set life estimate anytime an input value is changed
function updateLifespan(){
	//Standard Settings
	transmits_per_day 									= transmits_per_day_dom.value;
	transmits_per_day_value_dom.innerHTML 				= "- (" + transmits_per_day + ")";
	engineering_message_frequency 						= engineering_message_frequency_dom.value;
	engineering_message_per_day 						= 1 / engineering_message_frequency;
	engineering_message_frequency_value_dom.innerHTML 	= "- (" + engineering_message_frequency + ")";
	vertically_mounted 									= vertically_mounted_dom.checked;
	gps_estimated_fix_seconds_override 					= gps_estimated_fix_seconds_override_dom.checked;
	gps_manual_fix_seconds 								= gps_manual_fix_seconds_dom.value;
	gps_manual_fix_seconds_value_dom.innerHTML 			= "- (" + gps_manual_fix_seconds + ")";
	//Device Specs
	switcher_efficiency 								= switcher_efficiency_dom.value;
	switcher_vin 										= switcher_vin_dom.value;
	switcher_vout 										= switcher_vout_dom.value;
	//Battery Capacity
	battery_spec_mah 									= battery_spec_mah_dom.value;
	battery_spec_uas 									= battery_spec_mah * 1000 * 60 * 60; //uAs
	battery_derating 									= battery_derating_dom.value;
	battery_usable_uas 									= (1 - (battery_derating / 100)) * battery_spec_uas * (switcher_efficiency / 100);
	battery_usable_uas_dom.value 						= battery_usable_uas;
	stx_on_tx_ua 										= stx_on_tx_ua_dom.value;
	gps_on_search_ua 									= gps_on_search_ua_dom.value;
	non_tx_active_stx_ua 								= non_tx_active_stx_ua_dom.value;
	avg_sec_between_tx 									= avg_sec_between_tx_dom.value;
	//Transmit Power
	single_xmission_seconds 							= single_xmission_seconds_dom.value;
	num_bursts_per_msg 									= num_bursts_per_msg_dom.value;
	stx_msg_uas 										= stx_msg_uas_dom.value;
	between_stx_tx_uas 									= between_stx_tx_uas_dom.value;
	msg_xmission_uas 									= msg_xmission_uas_dom.value;
	//GPS Power
	gps_vertical_impact_percent 						= (vertically_mounted ? 2 : 1);
	gps_warmstart_solution_seconds 						= gps_warmstart_solution_seconds_dom.value * gps_vertical_impact_percent;
	gps_coldstart_solution_seconds 						= gps_coldstart_solution_seconds_dom.value * gps_vertical_impact_percent;
	gps_timeout_seconds 								= gps_timeout_seconds_dom.value;
	gps_warmstart_percentage 							= ( ((transmits_per_day * 4) / 100) > 0.9 ? 0.9 : ((transmits_per_day * 4) / 100)) * 100; //If we're fixing every hour. 
	gps_warmstart_percentage_dom.value 					= gps_warmstart_percentage;
	gps_coldstart_percentage 							= (1 - (gps_timeout_percentage / 100) - (gps_warmstart_percentage / 100)) * 100; 
	gps_coldstart_percentage_dom.value					= Math.ceil(gps_coldstart_percentage); 
	gps_timeout_percentage 								= gps_timeout_percentage_dom.value;
	gps_estimated_fix_seconds 							= (gps_warmstart_solution_seconds * (gps_warmstart_percentage / 100)) + (gps_coldstart_solution_seconds * (gps_coldstart_percentage / 100)) + (gps_timeout_seconds * (gps_timeout_percentage / 100));
	gps_estimated_fix_seconds_dom.value 				= Math.ceil(gps_estimated_fix_seconds);
	gps_mean_uas_per_day 								= transmits_per_day * (gps_estimated_fix_seconds_override ? gps_manual_fix_seconds : gps_estimated_fix_seconds) * gps_on_search_ua;
	gps_mean_uas_per_day_dom.value 						= gps_mean_uas_per_day;
	//Sleep Power
	sleep_current_uas 									= sleep_current_uas_dom.value;
	sleep_current_per_day_uas 							= sleep_current_uas * 60 * 60 * 24; //Sec * Min * Hr
	sleep_current_per_day_uas_dom.value 				= sleep_current_per_day_uas
	//Total Power
	total_current_used_per_day_uas 						= sleep_current_per_day_uas + gps_mean_uas_per_day + (msg_xmission_uas * transmits_per_day) + (msg_xmission_uas * engineering_message_per_day);
	total_current_used_per_day_uas_dom.value 			= total_current_used_per_day_uas;
	days_of_life 										= Math.ceil(battery_usable_uas / total_current_used_per_day_uas);
	days_of_life_dom.value 								= days_of_life;
	years_of_life 										= (days_of_life / 365).toFixed(2);
	years_of_life_dom.value 							= years_of_life;
	total_transmits 									= days_of_life * transmits_per_day + (days_of_life * engineering_message_per_day);
	total_transmits_dom.value 							= Math.floor(total_transmits);
};
function toggleAdvancedView(){
	oemElements = document.getElementsByClassName("oem");
	for (var j = 0; j < oemElements.length; j++) {
		oemElements[j].style.display == "none" ? oemElements[j].style.display="block" : oemElements[j].style.display="none";
	};

};
function listenForToggleClick(){
	var toggle_src = document.getElementById("hide_show_toggle")
	toggle_src.addEventListener("click",toggleAdvancedView,false);
};
//Add listener for anytime an <input> changes
function listenForInputChanges(){
	var input_fields = document.getElementsByTagName("input");	
	for (var i = 0; i < input_fields.length; i++) {
		input_fields[i].addEventListener("change",updateLifespan,false);
	};
};
//Run these guys when the DOM is loaded
function bootUp(){
	initialize();
	setDefaultValues();
	listenForInputChanges();
	listenForToggleClick();
};
//Fire after the DOM is loaded
document.addEventListener("DOMContentLoaded", bootUp, false);


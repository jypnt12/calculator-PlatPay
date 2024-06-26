import './DarkMode.html'
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery';
import 'jquery-mask-plugin/dist/jquery.mask.min.js';

function parseNumberWithCommas(inputString) {
	// Remove commas from the input string
	const stringWithoutCommas = inputString.replace(/,/g, '');
	
	// Parse the string into a floating-point number
	const numericValue = parseInt(stringWithoutCommas);
	
	return numericValue;
  }
  function numberWithCommas(x) {
	// Convert the number to a string
	let numStr = x.toString();
	
	// Split the string into parts before and after the decimal point (if any)
	let parts = numStr.split('.');
	
	// First part is the whole number part
	let wholeNum = parts[0];
	
	// Second part is the decimal part (if exists)
	let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
	
	// Insert commas for thousands separator
	let pattern = /(\d)(?=(\d{3})+(?!\d))/g;
	wholeNum = wholeNum.replace(pattern, '$1,');
	
	// Concatenate whole number and decimal part
	return wholeNum + decimalPart;
  }
  function checkValue(value){
	if(!isNaN(value) && isFinite(value) ) {
			return `$ ${value}`
	} else {
		return '-'
	}
  }
  
Template.darkMode.onCreated(function darkModeOnCreated() {
	this.monthlySales = new ReactiveVar(10000); 
	this.averageSale = new ReactiveVar(297); 
    this.ownMonthlyCost = new ReactiveVar(0);
	this.otherMonthlyCost = new ReactiveVar(0);
	this.monthlySavings = new ReactiveVar(0);
	this.ownYearlyCost = new ReactiveVar(0);
	this.otherYearlyCost = new ReactiveVar(0);
	this.yearlySavings = new ReactiveVar(0);
});

Template.darkMode.onRendered(function() {
	// Initialize tooltips
	this.$('[data-toggle="tooltip"]').tooltip();
  });
  
Template.darkMode.helpers({
	monthlySales(){
		return numberWithCommas(Template.instance().monthlySales.get());
	},     
	averageSale(){
		return Template.instance().averageSale.get();
	},	
	ownMonthlyCost() {
		return checkValue(numberWithCommas(Template.instance().ownMonthlyCost.get()))
	},
	otherMonthlyCost() {
		return numberWithCommas(checkValue(Template.instance().otherMonthlyCost.get()));
	},
	monthlySavings() {
		return numberWithCommas(checkValue(Template.instance().monthlySavings.get()));
	},
	ownYearlyCost() {
		return numberWithCommas(checkValue(Template.instance().ownYearlyCost.get()));
	},
	otherYearlyCost() {
		return numberWithCommas(checkValue(Template.instance().otherYearlyCost.get()));
	},
	yearlySavings() {
		return numberWithCommas(checkValue(Template.instance().yearlySavings.get()));
	},
});

Template.darkMode.events({
	'input .monthly-sales'(event, instance) {
		const monthlySales = event.target
		$(monthlySales).mask('000,000,000,000', { reverse: true });
  	},

	'input .average-sale'(event, instance) {
		const averageSale = event.target
		$(averageSale).mask('000,000,000,000', { reverse: true });
		
	},
   
	'blur .monthly-sales, blur .average-sale'(event, templateInstance) {
		
		const monthlySales = templateInstance.find('.monthly-sales').value;
		const averageSale = templateInstance.find('.average-sale').value;
		const inputAverageSale = templateInstance.$('.average-sale');
		const inputMonthlySale = templateInstance.$('.monthly-sales');

		let errorMonthly = document.getElementById('error-monthly');
		let errorAverage = document.getElementById('error-average');

		let parsedMonthlySales = parseNumberWithCommas(monthlySales);
		let parsedAverageSale = parseNumberWithCommas(averageSale);

		if(isNaN(parsedMonthlySales) || parsedMonthlySales < 4000   ){
			inputMonthlySale.val('4,000')
			parsedMonthlySales = 4000
			errorMonthly.textContent = 'Please enter a value greater than $4,000.';
		}else{
			errorMonthly.textContent = ''
		}
		if(isNaN(parsedAverageSale) || parsedAverageSale <= 0 ){
			inputAverageSale.val(0);
			parsedAverageSale = 0
			errorAverage.textContent = 'Please enter a value greater than $0.'
		}else{
			errorAverage.textContent = ''
		}
		const transactions = parsedMonthlySales / parsedAverageSale;
		const ccTransactions = transactions * 0.9;
		const checkTransactions = transactions * 0.1;
		const costsOther = (parsedMonthlySales * 0.029) + (ccTransactions * 0.3) + (checkTransactions * 0.8);
		const costsOurs = 99 + (ccTransactions * 0.15) + (checkTransactions * 1.30);

		const costOursString = Math.round(costsOurs)
		templateInstance.ownMonthlyCost.set(costOursString);
		templateInstance.otherMonthlyCost.set(Math.round(costsOther));
		templateInstance.monthlySavings.set(Math.round(costsOther - costsOurs));
		templateInstance.ownYearlyCost.set(Math.round(costsOurs * 12));
		templateInstance.otherYearlyCost.set(Math.round(costsOther * 12));
		templateInstance.yearlySavings.set(Math.round((costsOther - costsOurs) * 12));
			  
	  },

});
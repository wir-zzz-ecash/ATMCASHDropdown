ATMCASH Dropdowns
=================

A Prototype JS Class that creates a replacement style-lized select box menu.

Features:

* Supports Tabbing into the select box.
* Type searching (ex: and item in select box is Apple, when open start typing the word and it will select it).
* Easily Skinnable with CSS.
* Fires a custom event on original select box.
* Changes the value on the original select box when changed on custom replacement.
* Tested on IE6,firefox,chrome,safari.

Class Summary
-------------

Constructs an ATMCASHDropdown object

`<select id="original"><option value="apple">Apples</option></select>`

The script automatically replaces all the `select` boxes on `dom:loaded` but you can also create them on demand.

This will create the replacement dropdown for select box with id original

`new Dropdowns('original');`
	
or

This is a static Method that creates a replacement dropdown for all <select> boxes found in the page. Add class name replaced if you don't wish to have a specific select item to be chagned.

`Dropdowns.create();`

Methods
-------
	
This will manually change the value of both the Custom Dropdown and the original select box based on value

`Dropdowns.setValue('original','apple');`

Manually set the value of both Custom dropdown and select box based the on the index

`Dropdowns.setSelectedIndex('original',0);`

Returns the Dropdown Class Instance for the select element

`Dropdowns.getObject('original');`

Observing custom Blur event: 

`$('original').observe('dropdown:blur',function(){ alert('Value Changed to: '+$F(this); });`
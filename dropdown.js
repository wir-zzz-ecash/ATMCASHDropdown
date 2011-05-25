/*  ATMCASHDropdown
 *
 *  ATMCASHDropdown is freely distributable under the terms of an MIT-style license.
 *  ATMCASHDropdown is brought to you kindly by http://www.ATMCash.com
 *
 *--------------------------------------------------------------------------*/

var dropdowns = $H();
var Dropdowns = Class.create({
    /** @lends Dropdowns# */
    /**
     * Constructs an ATMCASHDropdown object
     * @version 0.4.7
     * @author (c) 2010 Ran Grushkowsky
     * @requires Prototype 1.6.1.0
     * @class Creates a dynamic javascript dropdown from an existing select dropdown
     * @param {String} original_select The id of the Select dropdown we are going to replace
     * @param {Hash} settings Settings that can configure the dropdown. <i>(currently none are supported)</i>
     * @constructs
     */
    initialize: function(original_select,settings) {
        if(original_select.hasClassName('replaced')) return;//avoid duplicates
        if(!original_select.up().hasClassName('dropdown')){
            original_select.wrap('div',{
                'style':'width:'+original_select.getWidth()+'px',
                'class':'dropdown'
            });
        }
        this.original_select = original_select.identify();//original select id
        this.id = this.original_select+"ATMCDropDown"; //dropdown's id
        this.typing_buffer = "";
        this.buffer_update = new Date();
        this.options = $H({
            'overideMobile':false
        });

        $H(settings || {}).each(function(s){
            if (this.options.keys().include(s.key)) { //if the setting provided is valid
                this.options.set(s.key,s.value);
            }
            else {
                alert('The setting provided \''+s.key+'\' is illegal');
            }
        }.bind(this));

        //fix for hidden fields
        var parents = $A();
        original_select.ancestors().each(function(p) {
            if (p.getStyle('display') == 'none') {
                parents.push(p);
                p.show();
            }
        });
        //end fix for hidden fields * suggested by Roberto *
        
        // detect mobile devices
        if (!this.options.get('overideMobile')) {
            var ua = navigator.userAgent;
            if ((ua.match(/iPhone/i)) || (ua.match(/iPad/i)) || (ua.toLowerCase().indexOf("android") > -1) || (ua.match(/iPod/i))) {
                return;
            }
        }

        var width = original_select.getWidth();
        var classNames = original_select.className;
        if(!classNames.include('divSelectReplacement')){//default skin
            classNames = 'divSelectReplacement '+classNames;
        }
        original_select.addClassName('replaced');
        // create list for styling
        var div = new Element('div',{
            'class':classNames,
            'id':this.id
        }).insert(new Element('div',{
            'class':'t_l'
        })).insert(new Element('div',{
            'class':'t_r'
        })).insert(new Element('div',{
            'class':'b_l'
        })).insert(new Element('div',{
            'class':'b_r'
        }));

        var ul = new Element('ul',{
            'class':'selectReplacement'
        }).setStyle({
            'width':width+'px'
        });

        original_select.select('option').each(function(t){

            var li = new Element('li');

            li.update(t.text);
            li.selIndex = t.index;
            li.onclick = function() {
                Dropdowns.getObject(this.up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe(this);
            };

            if (t.selected) {
                li.addClassName('selected');
                li.onclick = function() {
                    var dropdown_obj = Dropdowns.getObject(this.up('[class^=divSelectReplacement]').previous('.replaced').identify());
                    $(dropdown_obj.id).up('.dropdown').setStyle({
                        'zIndex':2000
                    });
                    $(dropdown_obj.id).select('.selectReplacement')[0].addClassName('selectOpen').scrollTop = (this.positionedOffset().top-($(dropdown_obj.id).getHeight()/2));

                    this.onclick = function() {
                        Dropdowns.getObject(this.up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe(this);
                    };
                };
            }
            li.observe('mouseover',function() {
                this.addClassName('hover');
            });
            li.observe('mouseout',function() {
                this.removeClassName("hover");
            });
            ul.insert(li);
        });
        div.insert(ul);
        // add the input and the ul
        original_select.insert({
            after:new Element('input',{
                'type':'text'
            }).setStyle({
                'background':'transparent',
                'width':'1px',
                'height':'1px',
                'border':'none',
                'padding':0,
                'outline': 'none',
                'resize': 'none'
            }).addClassName('input_tab').observe('focus',function(e){
                var select_div = Event.findElement(e).up('.dropdown');
                select_div.setStyle({
                    'zIndex':2000
                });
                var select_ul = select_div.select('ul.selectReplacement')[0];
                select_ul.addClassName('selectOpen');
                var select_li = select_ul.select('.selected')[0];
                select_ul.scrollTop = (select_li.positionedOffset().top-(select_ul.getHeight()/2));
                select_li.onclick = function() {
                    Dropdowns.getObject(this.up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe(this);
                };
            })
        }).insert({
            after:div
        });

        //fix for hidden fields

        parents.invoke('hide');

        //end fix for hidden fields * suggested by Roberto *

        //add the current object to hash to be referenced back
        dropdowns.set(this.original_select,this);
    },
    /**
     * Helper Function: Selects the option provided and closes the dropdown.
     * @param {Element.li} obj Option to be selected
     * @private
     */
    _selectMe:function(obj) {
        var dropdown_obj = Dropdowns.getObject(obj.up('[class^=divSelectReplacement]').previous('.replaced').identify());
        $(dropdown_obj.id).select('.selected').each(function(e){
            e.removeClassName('selected');
            e.onclick = function() {
                dropdown_obj._selectMe(this);
            };
        });

        dropdown_obj._setVal(obj.selIndex);
        obj.addClassName('selected');
        dropdown_obj._closeSel(obj);
    },
    /**
     * Helper Function: Updates the value of the original select to the provided paramter.
     * @param {Int} selIndex Index of option to select
     * @private
     */
    _setVal:function(selIndex) {
        $(this.original_select).selectedIndex = selIndex;
    },
    /**
     * Helper Function: Closes an open dropdown
     * @param {Element.li} obj The option whose dropdown we need to close
     * @private
     */
    _closeSel:function(obj) {
        // close the ul
        obj.up('.dropdown').setStyle({
            'zIndex':0
        });
        obj.up().scrollTop = 0;
        obj.up().removeClassName("selectOpen");
        obj.onclick = function() {
            this.up('.dropdown').setStyle({
                'zIndex':2000
            });
            obj.up().addClassName('selectOpen');
            obj.up().scrollTop = (obj.positionedOffset().top-($(obj.up()).getHeight()/2));
            this.onclick = function() {
                Dropdowns.getObject(this.up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe(this);
            };
        };
        if (Object.isFunction($(this.original_select).onblur)) {
            $(this.original_select).fire("dropdown:blur");
            $(this.original_select).onblur();
        }
    }
});

/**
* This is a getter function for created ATMCASHDropdown object
* @addon
* @param {String} name The original select's id, also used to create the dropdown.
* @return a grid object
* @type ATMCASHDropdown Object
*/
Dropdowns.getObject = function(name) {
    return dropdowns.get(name);
};

/**
* This is a function that sets/selects the index'th option in the dropdown menu.
* @addon
* @param {String} obj The original select's id, also used to create the dropdown.
* @param {Int} index The index of the option we would like to select
*/
Dropdowns.setSelectedIndex = function(obj,index) {
    var dropdown_obj = Dropdowns.getObject(obj);

    dropdown_obj._selectMe($(dropdown_obj.id).down('ul').down(index));
};

Dropdowns.create = function(){
    $$('select').each(function(e){
        (new Dropdowns(e));
    });
    if (typeof postDropdowns == 'function') {
        postDropdowns();
    }
    Event.observe(document,'click',function(e){
        var open = $$('.selectOpen');
        if (open.length !== 0) {
            open.each(function(o){
                var t = o.down('.selected');
                if (!t.hasClassName('hover')) {
                    Dropdowns.getObject(o.up('[class^=divSelectReplacement]').previous('.replaced').identify())._closeSel(t);
                }
            });
        }
    });
    Event.observe(document,'keyup',function(e){
        var elm;
        if ($$('.selectOpen').length !== 0) {
            switch (e.keyCode) {
                case Event.KEY_UP:
                    elm = (Event.findElement(e).hasClassName('input_tab')?Event.findElement(e).previous('[class^=divSelectReplacement]').down('.selectOpen .selected'):Event.findElement(e).down('.selectOpen .selected'));
                    if (elm.previous()) {
                        elm.removeClassName("selected");
                        elm.previous().addClassName('selected');
                        elm.up('ul.selectOpen').scrollTop = (elm.positionedOffset().top+elm.getHeight()*2)-elm.up('ul.selectOpen').getHeight();
                    }
                    Event.stop(e);
                    break;
                case Event.KEY_DOWN:
                    elm = (Event.findElement(e).hasClassName('input_tab')?Event.findElement(e).previous('[class^=divSelectReplacement]').down('.selectOpen .selected'):Event.findElement(e).down('.selectOpen .selected'));
                    if (elm.next()) {
                        elm.removeClassName("selected");
                        elm.next().addClassName('selected');
                        elm.up('ul.selectOpen').scrollTop = (elm.positionedOffset().top+elm.getHeight()*2)-elm.up('ul.selectOpen').getHeight();
                    }
                    Event.stop(e);
                    break;
                case Event.KEY_RETURN:
                    Dropdowns.getObject($$('.selectOpen')[0].up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe($$('.selectOpen .selected')[0]);
                    Event.stop(e);
                    break;
                case Event.KEY_ESC:
                    Dropdowns.getObject($$('.selectOpen')[0].up('[class^=divSelectReplacement]').previous('.replaced').identify())._closeSel($$('.selectOpen .selected')[0]);
                    Event.stop(e);
                    break;
                case Event.KEY_TAB:
                    Event.stop(e);
                    var other_dropdowns = $A();

                    if (Event.findElement(e).hasClassName('input_tab')) {
                        other_dropdowns = $$('.selectOpen').without(Event.findElement(e).previous('[class^=divSelectReplacement]').select('ul.selectOpen')[0]);
                    }
                    else {
                        other_dropdowns = $$('.selectOpen');
                    }
                    if (other_dropdowns.size() !== 0) {
                        Dropdowns.getObject(other_dropdowns[0].up('[class^=divSelectReplacement]').previous('.replaced').identify())._selectMe($$('.selectOpen .selected')[0]);
                    }


                    break;
                default:
                    var select = $$('.selectOpen');
                    if (select.size() > 0) {

                        select = select[0];

                        var select_obj = Dropdowns.getObject(select.up('[class^=divSelectReplacement]').previous('.replaced').identify());
                        //clear buffer if too old
                        if ((select_obj.buffer_update.getTime() + 1000) < new Date().getTime()) {
                            select_obj.typing_buffer = "";
                        }
                        select_obj.buffer_update = new Date();
                        select_obj.typing_buffer += String.fromCharCode(e.keyCode).toUpperCase();
                        var seen_selected = false;
                        var first_element_seen = null;
                        var updated = false;
                        select.descendants().each(function (e){
                            if (e.innerHTML.toUpperCase().startsWith(select_obj.typing_buffer)) {
                                if (first_element_seen == null) {
                                    first_element_seen = e;
                                }
                                if (seen_selected) {
                                    e.up().down('.selected').removeClassName("selected");
                                    e.addClassName('selected');
                                    e.up('ul.selectOpen').scrollTop = (e.positionedOffset().top+e.getHeight()*2)-e.up('ul.selectOpen').getHeight();
                                    updated = true;
                                    throw $break;
                                }
                            }
                            if (e.hasClassName('selected')) {
                                seen_selected = true;
                            }
                        });
                        if (!updated) {
                            //if we got here, nothing was selected, mark the first element as selected
                            if (first_element_seen != null) {
                                select.down('.selected').removeClassName("selected");
                                first_element_seen.addClassName('selected');
                                first_element_seen.up('ul.selectOpen').scrollTop = (first_element_seen.positionedOffset().top+first_element_seen.getHeight()*2)-first_element_seen.up('ul.selectOpen').getHeight();
                            }
                        }

                    }
            }
        }
    });
}

document.observe("dom:loaded", function() {
    Dropdowns.create();
});
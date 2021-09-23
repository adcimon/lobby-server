"use strict";

/**
 * Add a utility style sheet.
 */
window.addEventListener("load", function()
{
    let css = "body *[hidden] { display: none; } body *[invisible] { visibility: hidden; }";

    let link = document.createElement("link");
    link.setAttribute("type", "text/css");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "data:text/css;charset=UTF-8," + encodeURIComponent(css));

    let head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
});

/**
 * Return a clone of the object.
 * @param {Object} object - The object to clone.
 * @return {Object} The clone of the object.
 */
function clone( object )
{
    return JSON.parse(JSON.stringify(object));
}

/** 
 * Return a function, that, as long as it continues to be invoked, will not be executed until N milliseconds have passed.
 * @param {Function} func - The function to execute.
 * @param {Number} wait - The time to wait.
 * @param {Boolean} immediate - Execute the function immediately.
 */
function debounce( func, wait, immediate )
{
    let timeout;
    return function()
    {
        let context = this;
        let args = arguments;

        let later = function()
        {
            timeout = null;
            if( !immediate )
            {
                func.apply(context, args);
            }
        };

        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if( callNow )
        {
            func.apply(context, args);
        }
    };
}

/**
 * Generate a universally unique identifier.
 * Reference: RFC 4122 https://www.ietf.org/rfc/rfc4122.txt
 * @return {String} The universally unique identifier.
 */
function uuid()
{
    return uuidv4();
}

/**
 * Generate a universally unique identifier v4.
 * Reference: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 * @return {String} The universally unique identifier v4.
 */
function uuidv4()
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );

    /*
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    */
}

/**
 * Return the elements that match the specified selector.
 * @param {String} selector - The selector.
 * @return {Node, NodeList} The Node or NodeList.
 */
HTMLElement.prototype.query = function( selector )
{
    let elements = this.querySelectorAll(selector);
    return (elements.length === 1) ? elements[0] : elements;
}

/**
 * Enable the HTMLElement.
 * @param {Boolean} recursively - Enable children recursively.
 */
HTMLElement.prototype.enable = function( recursively )
{
    this.disabled = false;

    if( recursively )
    {
        for( let i = 0; i < this.children.length; i++ )
        {
            let child = this.children[i];
            child.enable(recursively);
            this.disabled = false;
        }
    }
}

/**
 * Disable the HTMLElement.
 * @param {Boolean} recursively - Disable children recursively.
 */
HTMLElement.prototype.disable = function( recursively )
{
    this.disabled = true;

    if( recursively )
    {
        for( let i = 0; i < this.children.length; i++ )
        {
            let child = this.children[i];
            child.disable(recursively);
            this.disabled = true;
        }
    }
}

/**
 * Show the HTMLElement.
 */
HTMLElement.prototype.show = function()
{
    this.hidden = false;
    this.removeAttribute("hidden");
    this.removeAttribute("invisible");
}

/**
 * Hide the HTMLElement.
 * @param {Boolean} invisible - Is the element invisible?
 */
HTMLElement.prototype.hide = function( invisible )
{
    if( invisible )
    {
        this.setAttribute("invisible", "");
    }
    else
    {
        this.setAttribute("hidden", "");
    }
}

/** 
 * Get / Set the innerHTML of the HTMLElement.
 * @param {String} str - The html string.
 * @return {String} The innerHTML.
 */
HTMLElement.prototype.html = function( str )
{
    if( !str )
    {
        return this.innerHTML;
    }

    this.innerHTML = str;
    return this;
}

/** 
 * Get / Set the innerText of the HTMLElement.
 * @param {String} str - The text string.
 * @return {String} The textContent.
 */
HTMLElement.prototype.text = function( str )
{
    if( !str )
    {
        return this.textContent;
    }

    this.innerText = str;
    return this;
}

/** 
 * Append the HTMLElement to another HTMLElement.
 * @param {HTMLElement} child - The HTML element.
 */
HTMLElement.prototype.append = function( child )
{
    if( child instanceof HTMLElement )
    {
        this.appendChild(child);
    }

    return this;
}

/** 
 * Prepend the HTMLElement to another HTMLElement sibling.
 * @param {HTMLElement} sibling - The HTML element.
 */
HTMLElement.prototype.prepend = function( sibling )
{
    if( sibling instanceof HTMLElement )
    {
        this.parentNode.insertBefore(sibling, this);
    }

    return this;
}

/** 
 * Remove the HTMLElement.
 */
HTMLElement.prototype.remove = function()
{
    this.parentNode.removeChild(this);
}

/** 
 * Remove all the children of the HTMLElement.
 */
HTMLElement.prototype.removeChildren = function()
{
    let child = this.firstElementChild;
    while( child )
    {
        this.removeChild(child);
        child = this.firstElementChild;
    }
}

/** 
 * Return the parent of the HTMLElement.
 * @return {HTMLElement} The HTMLElement parent.
 */
HTMLElement.prototype.parent = function()
{
    return this.parentNode;
}

/** 
 * Add an event listener to the HTMLElement.
 * @param {String} event - The event to listen for.
 * @param {Object} callback - The object that receives the notification.
 * @param {Object} options - The options object.
 */
HTMLElement.prototype.on = function( event, callback, options )
{
    this.addEventListener(event, callback, options);
    return this;
}

/** 
 * Remove an event listener from the HTMLElement.
 * @param {String} event - The event to remove for.
 * @param {Object} callback - The object that receives the notification.
 * @param {Object} options - The options object.
 */
HTMLElement.prototype.off = function( event, callback, options )
{
    this.removeEventListener(event, callback, options);
    return this;
}

/** 
 * Dispatch an event on the HTMLElement.
 * @param {String} event - The event to dispatch.
 * @param {Object} args - The event arguments.
 */
HTMLElement.prototype.emit = function( event, args = null )
{
    this.dispatchEvent(event, new CustomEvent(event, { detail: args }));
    return this;
}
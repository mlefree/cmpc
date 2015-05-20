'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 *
 *  Manage Thumbnail
 *
 **/
a4p.Thumb = (function () {

    var element = null;
    function Thumb(element) {
        //this.nbMax = nbMax || 1000;
        this.element = element;
    }

    var textWidth = function(text, font,fontsize){
        var textHtml = document.createElement('div');
        textHtml.style.font = font;
        textHtml.style.fontsize = fontsize;
        textHtml.innerHTML = textHtml.innerHTML + text;
        var html_org = $(textHtml).html();
        var html_calc = '<span>' + html_org + '</span>';
        $(textHtml).html(html_calc);
        var width = $(textHtml).find('span:first').width();
        //$(textHtml).html(html_org);
        return width;
    };

    var textInitials = function(text){

        var textInitials = '  ';

        if (!text || typeof text != 'string') return textInitials;

        // Text is 2 letters max
        textInitials = textInitials + (text[0] ? text[0] : '?');
        textInitials = textInitials + (text[1] ? text[1] : ' ');
        var textArr = text.split( ' ' );
        if (textArr.length > 1) {
            textInitials = '';
            for(var x=0; x<2; x++) 
            textInitials += textArr[x].charAt(0);
        }
        return textInitials;
    };

    // Public API


    Thumb.prototype.addCanvas = function (text, number, color, width, height) {

        if (!this.element) return;

        var canvas = document.createElement('canvas');
        canvas.id="canvas";
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");

        var initials = textInitials(text);

        var textSize = Math.round(height / 2);//textWidth(textInitials,"a4pHelveticaNeueLight",Math.round(height / 2));
        var numberTextSize = Math.round(height / 5);

        var numberText = Math.round(number).toString();
        var textPosx = ((textSize*2) < width) ? Math.round((width/2) - textSize) : 0;
        var textPosy = (textSize < height) ? Math.round((height/2) + (textSize/2)) : height;
        var numberTextPosx = Math.round(width/2);
        var numberTextPosy = (textPosy < (height - numberTextSize)) ? (textPosy + numberTextSize ): height;
        //console.log('thumb : '+textInitials+' '+numberText+' '+textSize+' '+textPosx+' '+textPosy);

        // background
        var my_gradient = context.createLinearGradient(0, 0, width, height);
        //context.moveTo(0, y);
        //context.lineTo(500, y);
        
        my_gradient.addColorStop(0, "gray");
        my_gradient.addColorStop(1, "white");
        context.createLinearGradient(0, 0, width, height);
        //context.fillStyle = my_gradient;
        //context.fillRect(0, 0, 300, 225);
        context.fillStyle = my_gradient;
        context.fillRect(0, 0, width, height);

        // complex draw
        // context.beginPath();
        // context.moveTo(0, 40);
        // context.lineTo(4, 40);
        // context.moveTo(8, 40);
        // context.lineTo(30, 40);
        // context.strokeStyle = "#eee";
        // context.stroke();

        // text
        context.fillStyle = "white";
        //context.font = "bold 16px Arial";
        var realTextSize = Math.round(textSize*1.2); 
        context.font = "normal "+realTextSize+"px a4pHelveticaNeueLight,Helvetica,sans-serif";
        //context.textBaseline = "top";
        //context.textAlign = "center";
        context.fillText(initials.toUpperCase(), textPosx, textPosy);

        // numberText
        context.fillStyle = "black";
        //context.font = "bold 16px Arial";
        var realNumberTextSize = Math.round(numberTextSize*1.5); 
        context.font = "normal "+realNumberTextSize+"px a4pHelveticaNeueLight,Helvetica,sans-serif";
        //context.textAlign = "right";
        //?? retours ??? context.fillText(numberText.toUpperCase(), numberTextPosx, numberTextPosy);
        //context.fillText("test", 30, 40);


        this.element.appendChild(canvas); 

        //canvas.getContext("2d").drawImage(original, 0, 0, canvas.width, canvas.height);

        //return canvas;
    };
    
    Thumb.prototype.addDiv = function (text, number, color, width, height) {

        if (!this.element) return;

        var initials = textInitials(text);
        var textSize = Math.round(height / 2);
        var numberTextSize = Math.round(height / 5);
        var numberText = Math.round(number).toString();

        // background
        var divBack = document.createElement("div");
        divBack.id="canvas";
        if (!color) {
            divBack.style.background = "red";
        }
        else {
            divBack.className += color;
        }
        //divBack.style.width = width+"px";
        //divBack.style.height = height+"px";
       
        // text
        var divText = document.createElement("div");
        divText.style.color = "white";
        divText.style.textAlign = "center";
        //context.font = "bold 16px Arial";
        var realTextSize = Math.round(textSize*1.2); 
        divText.style.font = "normal a4pHelveticaNeueLight,Helvetica,sans-serif";// "+realTextSize+"px 
        //context.textBaseline = "top";
        //context.textAlign = "center";
        divText.textContent = initials.toUpperCase();

        // numberText
        var divTextNumber = document.createElement("div");
        divTextNumber.style.color = "black";
        divTextNumber.style.textAlign = "center";
        //context.font = "bold 16px Arial";
        var realNumberTextSize = Math.round(numberTextSize*1.5); 
        divTextNumber.style.font = "normal a4pHelveticaNeueLight,Helvetica,sans-serif";//"+realNumberTextSize+"px 
        
        divBack.appendChild(divText); 
        divBack.appendChild(divTextNumber); 
        this.element.appendChild(divBack); 
    };

    return Thumb;
})();

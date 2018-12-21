import $ from 'jquery';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as safeval from 'safe-eval';
import {code_convert_to_cfg, get_cfg, pred_infer} from './cfg_converter';

function wraper(text,when,lines,pre,after){
    let index = 0, counter=1, last = 0;
    while(lines.length > 0 & index < text.length){
        if(text.charAt(index) == when) {
            if(lines[0].line == counter){
                text = text.substring(0,last) + pre + lines.shift().color + '";>' +
                 text.substring(last,index+1) + after + text.substring(index+1);
                index = index + 3 + pre.length + after.length;
            }          
            counter++;           
            last = index;
        }
        index++;
    }
    return text;
}

let pred_array_out = [];
function get_lines(parsedCode, input){
    pred_array_out = [];
    var context = {
        pred_array: pred_array_out
    };
    parsedCode = pred_infer(parsedCode);
    //console.log(escodegen.generate(parsedCode));
    //TODO global support
    return {result : safeval('('+escodegen.generate(parsedCode)+')('+input+')', context), lines:pred_array_out} ;
}

function to_html(text, lines){
    //console.log(lines);
    text = wraper(text,'\n',lines,//[{line:0, color:'red'}, {line:3, color:'green'}, {line:5, color:'red'}],
        '<bspan style="background-color:','</bspan>');
    return text;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = esprima.parse(codeToParse);
        //console.log(parsedCode);
        code_convert_to_cfg(parsedCode);
        let input = ($('#input').val());
        /*let optimized_text = escodegen.generate(parsedCode);
        let sol = get_lines(esprima.parse(optimized_text, {loc: true}), input);
        if(Array.isArray(sol.result))  sol.result = '[' + sol.result + ']';
        document.getElementById('output').innerHTML = sol.result;
        document.getElementById('parsedCode').innerHTML = to_html(optimized_text,sol.lines);*/
        Console.log(get_cfg());
        
    });
});

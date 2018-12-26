import $ from 'jquery';
import * as esprima from 'esprima';

import * as escodegen from 'escodegen';
import * as safeval from 'safe-eval';
import {code_convert_to_cfg, pred_infer} from './cfg_converter';
import * as go from './gojs';

let pred_array_out = [];
function get_lines(parsedCode, input){
    pred_array_out = [];
    var context = {
        pred_array: pred_array_out
    };
    parsedCode = pred_infer(parsedCode);
    console.log(escodegen.generate(parsedCode));
    //TODO global support
    return {result : safeval('('+escodegen.generate(parsedCode)+')('+input+')', context), lines:pred_array_out} ;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let source = $('#codePlaceholder').val();
        const esprimed_source = esprima.parse(source, {loc: true});
        let cfg = code_convert_to_cfg(esprimed_source);//get func body
        console.log(cfg);
        let input = $('#input').val();
        let sol = get_lines(esprimed_source, input);
        if(Array.isArray(sol.result))  sol.result = '[' + sol.result + ']';
        document.getElementById('output').innerHTML = sol.result;     
        go.load(cfg,sol.lines);
    });
});

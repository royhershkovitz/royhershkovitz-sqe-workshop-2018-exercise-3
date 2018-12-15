import $ from 'jquery';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import {substitute} from './symbolic_substitution';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = esprima.parse(codeToParse);
        //$('#codePlaceholder').val(escodegen.generate(substitute(parsedCode)));

        //$('#parsedCode').val(JSON.stringify(substitute(parsedCode)));

        $('#parsedCode').val(escodegen.generate(substitute(parsedCode)));
        
        //$('#parsedCode').val(JSON.stringify(parsedCode));
    });
});

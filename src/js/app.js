import $ from 'jquery';
import {parseCode, parsedList} from './code-analyzer';
import {to_code} from './code_assembler';
import { substitute, color_condition_of_function } from './symbolic_substitution';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);        
        console.log(parsedList());
        console.log(parsedCode);
        let parsed_lst = parsedList();
        substitute(parsed_lst);
        $('#parsedCode').val(to_code(parsed_lst));
        //$('#parsedCode').val(JSON.stringify(parsedCode));
    });
});

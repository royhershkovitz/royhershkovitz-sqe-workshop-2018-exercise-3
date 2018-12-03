import $ from 'jquery';
import {parseCode, parsedList} from './code-analyzer';
import {to_code} from './code_assembler';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);        
        console.log(parsedList());
        $('#parsedCode').val(JSON.stringify(parsedCode));//to_code(parsedList()));
    });
});

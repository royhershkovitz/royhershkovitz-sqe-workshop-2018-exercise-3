import $ from 'jquery';
import {parseCode, parsedList} from './code-analyzer';

var table = document.getElementById('parsed_table');
function make_table(lst) {
    //lst.forEach(make_row_element);
    table.innerHTML = '';
    lst.forEach(make_row_element);
}

function make_row_element(line_obj) {
    var row = table.insertRow(-1);
    var Line = row.insertCell(0);
    var Type = row.insertCell(1);
    var Name = row.insertCell(2);
    var Condition = row.insertCell(3);
    var Value = row.insertCell(4);
    Line.innerHTML = line_obj.line;
    Type.innerHTML = line_obj.type;
    Name.innerHTML = line_obj.name;
    Condition.innerHTML = line_obj.condition;
    Value.innerHTML = line_obj.value;
    //Line    Type    Name    Condition    Value
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);        
        make_table(parsedList());
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});


export {to_code};


function insertValueToList(line, Type, Name, Condition, Value) {
    lst.push({line:line.start.line, type:Type, name:Name, condition:Condition, value:Value});
}

let last_line = 1;
let parsers = [line_num, unparse_call_expression, unparse_variable_declarator, unparse_assignment_expression, unparse_return_statement];
function to_code(code_array){
    while(code_array != []){
        parsers.forEach(code_array);
    }
}

function line_num(code_line){
    var line = code_line.line;
    if(line>last_line){
        last_line = line;
        return '\n';
    }
    return '';
}

function unparse_call_expression(code_array) {
    //insertValueToList(toParse.loc, 'call expression', toParse.callee.name, null, null);
    //toParse.arguments.forEach(parseArg);
    if(code_array[0].type == 'call expression'){
        let current = code_array.unshift();
        return current.name + '(' + unparse_args(code_array)  + ')';  
    }
    return '';
}

function unparse_args(toParse) {
    //insertValueToList(toParse.loc, 'callee argument', null, null, parseLiterals(toParse));
    if(code_array[0].type == 'callee argument')
    return code_array.unshift().value + unparse_args_comma(toParse);
    else return '';
}

function unparse_args_comma(toParse) {
    //insertValueToList(toParse.loc, 'callee argument', null, null, parseLiterals(toParse));
    if(code_array[0].type == 'callee argument')
    return ', ' + code_array.unshift().value + unparse_args_comma(toParse);
    else return '';
}

function parseFunctionDeclaration(toParse) {
    insertValueToList(toParse.loc, 'function declaration', toParse.id.name, null, null);
    toParse.params.forEach(parseParam);
    parseBody(toParse.body);
}

function parseParam(toParse) {
    insertValueToList(toParse.loc, 'variable declaration', toParse.name, null, parseLiterals(toParse.init));
}


function parseVariableDeclaration(toParse) {
    toParse.declarations.forEach(parseVariableDeclarator);
}

//todo stack let declaretion together
function unparse_variable_declarator(toParse) {
    //insertValueToList(toParse.loc, 'variable declaration', toParse.id.name, null, parseLiterals(toParse.init));
    if(code_array[0].type == 'variable declaration'){
        let current = toParse.unshift();
        return 'let ' + current.name + ' = ' + current.value + ';';
    }
    return '';
}

function unparse_assignment_expression(toParse) {
    //insertValueToList(toParse.loc, 'variable declaration', toParse.id.name, null, parseLiterals(toParse.init));
    let current = toParse.unshift();
    return current.name + ' = ' + current.value + ';';
}

function parseForStatement(toParse) {
    insertValueToList(toParse.loc, 'for statement', null, parseLiterals(toParse.test), null);
    parseExp(toParse.init);
    parseExp(toParse.update);
    parseBody(toParse.body);
}


function parseWhileStatement(toParse) {
    insertValueToList(toParse.loc, 'while statement', null, parseLiterals(toParse.test), null);
    parseBody(toParse.body);
}


function parseIfStatementn(toParse) {
    insertValueToList(toParse.loc, 'if statement', null, parseLiterals(toParse.test), null);
    parseElseIfStatementn(toParse);
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementn(toParse) {
    parseBody(toParse.consequent);
    toParse = toParse.alternate;
    if(toParse != null){
        if(toParse.type == 'IfStatement')    {
            insertValueToList(toParse.loc, 'else if statement', null, parseLiterals(toParse.test), null);
            parseElseIfStatementn(toParse);
        }
        else {
            insertValueToList(toParse.loc, 'else statement', null, null, null);
            parseBody(toParse);
        }
    }
}


function unparse_return_statement(toParse) {
    //insertValueToList(toParse.loc, 'return statement', null, null, parseLiterals(toParse.argument));
    if(code_array[0].type == 'return statement')
        return 'return ' + toParse.unshift().value + ';';    
    return '';
}
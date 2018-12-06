export {to_code};

let last_line;
let tabs = '';
let parsers = [line_num, unparse_call_expression, unparse_assignment_expression, unparse_return_statement, unparse_if_statementn,
    unparse_while_statement, unparse_function_declaration, unparse_variable_declaration, unparse_for_statement ];
function to_code(code_array){
    last_line = 1;
    let to_run = true, last_arr = null, last_len = 0, output = '';
    while(to_run && code_array.length != 0)
        output = output + try_all_parsers(parsers, code_array);    
    return output;
}

function try_all_parsers(parsers, code_array){
    let out = '';
    for(let i = 0; i<parsers.length; i++)
    {
        out = parsers[i](code_array);
        if(out != '')
            return out;
    }
}

function line_num(code_line){
    var line = code_line[0].line;
    if(line>last_line){
        last_line = line;
        let out = '\n' + tabs;
        return out;
    }
    return '';
}

function unparse_call_expression(code_array) {
    //insertValueToList(toParse.loc, 'call expression', toParse.callee.name, null, null);
    //toParse.arguments.forEach(parseArg);
    if(code_array[0].type == 'call expression'){
        let current = code_array.shift();
        return current.name + '(' + unparse_args(current.params)  + ');';  
    }
    return '';
}

function unparse_args(code_array) {
    //insertValueToList(toParse.loc, 'callee argument', null, null, parseLiterals(toParse));
    if(code_array.length == 0)
        return '';
    else if(code_array[0].type == 'callee argument')
        return code_array.shift().value + unparse_args_comma(code_array);
    else if(code_array[0].type == 'variable declaration')
        return code_array.shift().name + unparse_args_comma(code_array);    
    return '';
}

function unparse_args_comma(code_array) {
    //insertValueToList(toParse.loc, 'callee argument', null, null, parseLiterals(toParse));
    if(code_array.length == 0)
        return '';
    else if(code_array[0].type == 'callee argument')
        return ', ' + code_array.shift().value + unparse_args_comma(code_array);
    else if(code_array[0].type == 'variable declaration')
        return ', ' + code_array.shift().name + unparse_args_comma(code_array);
    return '';
}

function unparse_function_declaration(code_array) {    
    //insertFunctionToList(toParse.loc, 'function declaration', toParse.id.name, params, body);
    //current_scope.push({line:line.start.line, type:Type, name:Name, params:params, body:body});
    if(code_array[0].type == 'function declaration'){
        let func_st = code_array.shift();
        return 'function ' + func_st.name + '(' + unparse_args(func_st.params) + ')' + unparse_body(func_st.body);    
    }
    return '';
}

function unparse_body(body) {
    let old_tabs = tabs;
    let one_exp = body.length == 1;
    tabs = tabs + '\t';
    body = to_code(body);
    tabs = old_tabs;
    
    if(one_exp)    
        return body;
    return '\n' + tabs + '{' +  body + '\n' + tabs + '}';
}

//todo retrive multiple let to one let and not many, check the rest of the array !
function unparse_variable_declaration(code_array) {
    if(code_array[0].type == 'variable declaration'){
        let var_dec_st = code_array.shift();
        let let_st = 'let ' + var_dec_st.name;
        if(var_dec_st.value != null){
            if(Array.isArray(var_dec_st.value))   let_st = let_st + ' = [' + var_dec_st.value + ']';
            else let_st = let_st + ' = ' + var_dec_st.value;
        }
        return let_st + ';';
    }
    return '';
}

function unparse_assignment_expression(code_array) {
    //insertValueToList(toParse.loc, 'variable declaration', toParse.id.name, null, parseLiterals(toParse.init));
    if(code_array[0].type == 'assignment expression'){
        let current = code_array.shift();
        if(Array.isArray(current.value))   return current.name + ' = [' + current.value + '];';
        else return current.name + ' = ' + current.value + ';';
    }
    return '';
}

function unparse_for_statement(code_array) {
    //current_scope.push({line:line.start.line, type:Type, var:VarDecl, condition:Condition, update:Update, body:body});
    if(code_array[0].type == 'for statement'){
        let for_st = code_array.shift();
        let update;
        if(for_st.update.type == 'assignment expression')
            update =  for_st.update.name + ' = ' + for_st.update.value;
        else if(for_st.update.type == 'update expression')
            update = for_st.update.value;
        return 'for(' + unparse_variable_declaration(for_st.var) + for_st.condition + ';' + update + ')' + unparse_body(for_st.body);
    }
    return '';
}


function unparse_while_statement(code_array) {
    //insertValueToList(toParse.loc, 'while statement', null, parseLiterals(toParse.test), null);
    if(code_array[0].type == 'while statement'){
        let while_st = code_array.shift();
        return 'while(' + while_st.condition + ')' + unparse_body(while_st.body);    
    }
    return '';
}


function unparse_if_statementn(code_array) {
    //insertValueToList(toParse.loc, 'if statement', null, parseLiterals(toParse.test), null);
    if(code_array[0].type == 'if statement'){
        let if_st = code_array.shift();
        return 'if(' + if_st.condition + ')' + unparse_body(if_st.body);    
    }
    else if(code_array[0].type == 'else if statement'){
        let if_st = code_array.shift();
        return 'else if(' + if_st.condition + ')' + unparse_body(if_st.body);    
    }
    else if(code_array[0].type == 'else statement'){
        let if_st = code_array.shift();
        return 'else' + unparse_body(if_st.body);    
    }
    return '';
}


function unparse_return_statement(code_array) {
    //insertValueToList(toParse.loc, 'return statement', null, null, parseLiterals(toParse.argument));
    if(code_array[0].type == 'return statement')
        return 'return ' + code_array.shift().value + ';';    
    return '';
}
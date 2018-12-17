import * as esprima from 'esprima';

export {substitute, pred_infer};

const substitute = (codeToOptimize) => parseProgram(codeToOptimize)

let line_num = -1;
let if_add_mode = false;
let if_add_mode_last_if_line;
const pred_infer = (parsedCode) => {
    //console.log(parsedCode);
    if_add_mode = true;
    if_add_mode_last_if_line = [];
    let parsed = parseProgram(parsedCode);
    if_add_mode = false;
    return parsed;
};

var current_scope = [];
var scopes = [];

function parseProgram(toParse) {
    current_scope = [];
    var type = toParse.type;
    //console.log(JSON.stringify(toParse, null, 2));
    if(type == 'Program') 
        toParse.body = parseExps(toParse.body);
    return toParse;
}

function clone_JSON_ARRAY(frame){
    let i = 0, new_scope = [];
    while(i < frame.length){
        new_scope.push(JSON.parse(JSON.stringify(frame[i])));
        i = i + 1;
    }
    return new_scope;
}

function parseExps(toParse) {
    toParse.map(parseExp);
    return toParse;
}

function parseExp(toParse) {
    var type = toParse.type;
    return type == 'FunctionDeclaration' ? forgetable_body_based(toParse) : 
        type == 'VariableDeclaration' ? parse_vardecl(toParse) :
            type == 'ExpressionStatement' ? update_scope_assignment(toParse) :
                type == 'ReturnStatement' ? return_rep(toParse) : parseLoops(toParse);    
}

function parseLoops(toParse){
    var type = toParse.type;
    return  type == 'ForStatement' ? body_cond_loop(toParse) :
        type == 'WhileStatement' ? body_cond_loop(toParse) :
            type == 'IfStatement' ? parseIfStatementn(toParse) : toParse;
}

function value_func_on_body(body_expr, func){
    if(body_expr.type == 'BlockStatement'){
        return func(body_expr.body);
    }
    return func([body_expr]);
}

function func_on_body(body_expr, func, rem_brackets_if_one){
    if(body_expr.type == 'BlockStatement'){
        body_expr.body = func(body_expr.body);
        if(rem_brackets_if_one!=false & body_expr.body.length == 1) body_expr = body_expr.body[0];
    }
    else{
        body_expr = func([body_expr]);//assume if wont give other array
        if(body_expr.length == 1) body_expr = body_expr[0];
    }
    return body_expr;
}

function is_empty_body(body){
    return body==null||body.length == 0;
}

function forgetable_body_based(loop_based){
    scopes.push(current_scope);
    current_scope = clone_JSON_ARRAY(current_scope);
    loop_based.body = func_on_body(loop_based.body, substitute_rec, false);
    current_scope = scopes.pop();
    return loop_based;
}

function substitute_rec(body_array) {  
    let index = 0;
    while(index < body_array.length){
        body_array[index] = parseExp(body_array[index]);
        if(body_array[index] == -1)
            body_array.splice(index, 1);//WHILIE/IF checks should be done here
        else index++;
    }
    unused_vardecl_removed(body_array);
    return body_array;
}

function remove_let(declarations){
    let index = 0;
    while(index < declarations.length){
        //{"type":"VariableDeclarator","id":{"type":"Identifier","name":"x"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}
        if(declarations[index].type == 'VariableDeclarator' && 
                get_var(declarations[index].id.name)!=null)
             declarations.splice(index, 1);
        else index++;        
    } 
}

function unused_vardecl_removed(body_array){
    let index = 0;
    while(index < body_array.length){
        if(body_array[index].type == 'VariableDeclaration'){
            remove_let(body_array[index].declarations);
            if(body_array[index].declarations.length == 0)
                body_array.splice(index, 1);
            else index++;
        }
        else index++;
    } 
}

function parseLiterals(toParse) {    
    if(toParse == null) return null;
    var type = toParse.type;
    return type == 'Identifier' ? parseIdentifier(toParse) :
        type == 'Literal' ? parseLitetral(toParse) : 
            type == 'BinaryExpression' ? parseBinaryExpression(toParse) :
                type == 'CallExpression' ? parseCallExpressionLit(toParse) :
                    parseComplecatedLiteral(toParse);
}

function parseComplecatedLiteral(toParse){
    var type = toParse.type;
    return type == 'LogicalExpression' ? parseBinaryExpression(toParse) : 
        type == 'UnaryExpression' ? parseUnaryExpression(toParse) :
            type == 'UpdateExpression' ? parseUnaryExpression(toParse) :                                     
                type == 'MemberExpression' ? parseMemberExpression(toParse) :
                    type == "ArrayExpression" ? toParse.elements.map(parseLiterals) : null;    
}

function parseLitetral(toParse) {
    return toParse.value;
}

function get_name(obj){
	var name;
	if(obj.type != null) name = parseLiterals(obj);
	else name = obj.name;
	return name;
}

function parseMemberExpression(toParse){	
    return toParse.object.name + '[' + get_name(toParse.property) + ']';
}

let paren_unimportant = ['+', '<', '>', '<=', '>='];
function parseBinaryExpression(toParse) {    
    let left_side =  parseLiterals(toParse.left);
    let right_side =  parseLiterals(toParse.right);
    if(!paren_unimportant.includes(toParse.operator)){        
        if(toParse.left.type == 'BinaryExpression')
            left_side = '(' + left_side + ')';
        if(toParse.right.type == 'BinaryExpression')
            right_side = '(' + right_side + ')';
    }
    return left_side + ' ' + toParse.operator + ' ' + right_side;
}

function parseUnaryExpression(toParse) {
    return toParse.prefix ? toParse.operator + '' + parseLiterals(toParse.argument) :
        parseLiterals(toParse.argument) + '' + toParse.operator;
}

function parseIdentifier(toParse) {
    return toParse.name;
}

function end_with_ret(body){
    for(let i = 0; i < body.length; i++){
        if(body[i].type == 'ReturnStatement')
            return true;
    }
    return false;
}

function parse_if_else(toParse){
    if(value_func_on_body(toParse, end_with_ret)){
        scopes.push(current_scope);
        current_scope = clone_JSON_ARRAY(current_scope);
        toParse = func_on_body(toParse, substitute_rec);
        current_scope = scopes.pop();
    }
    else{
        scopes.push(vars_in_body); vars_in_body = [];
        toParse = func_on_body(toParse, find_all_body_assignment_identifiers);
        if_to_del = if_to_del.concat(vars_in_body); vars_in_body = scopes.pop();
    }
    if(if_add_mode){
        let if_code = [];
        if(if_add_mode_last_if_line != []){            
            let i = 0;
            while(i < if_add_mode_last_if_line.length){
                let curr_line_num = if_add_mode_last_if_line[i++];                
                if_code.push(esprima.parse(`pred_array.push({line:
                    ${curr_line_num},color:\'red\'});`).body[0]);
            }
        }
        if_code.push(esprima.parse(`pred_array.push({line:${line_num},color:\'green\'});`).body[0]);
        if(toParse.body!=null && toParse.body.type == "BlockStatement")
            toParse.body.unshift(if_code);
        else{
            if_code.push(toParse);
            toParse = {type : "BlockStatement", body : if_code};
        }
    }
    return toParse;
}

let if_to_del = [];
function parseIfStatementn(toParse) {
    //if not end with ret in body mode else - reg
    toParse.test = find_all_identifiers_and_replace(toParse.test);
    if(if_add_mode){
        if_add_mode_last_if_line=[];
        line_num = toParse.test.loc.start.line;
    }
    toParse.consequent = parse_if_else(toParse.consequent);  
    toParse.alternate = parseElseIfStatementRec(toParse.alternate);

    delete_identifiers_from_scope(if_to_del);

    return toParse;
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementRec(toParse) {
    if(toParse != null){
        if(toParse.type == 'IfStatement')  {
            toParse.test = find_all_identifiers_and_replace(toParse.test);
            if(if_add_mode){
                if_add_mode_last_if_line.push(line_num);
                line_num = toParse.test.loc.start.line;
            }
            toParse.consequent = parse_if_else(toParse.consequent);  
            toParse.alternate = parseElseIfStatementRec(toParse.alternate);
        }
        else{ 
            if(if_add_mode){
                if_add_mode_last_if_line.push(line_num);
                line_num = toParse.loc.start.line-1;
            }
            toParse = parse_if_else(toParse);  
        }
    }
    return toParse;
}
function parse_vardecl(toParse){
    toParse.declarations.forEach(add_to_scope);
    return toParse;
}

function add_to_scope(vardecl){
    if(vardecl.init != null){//TODO support arrays
        vardecl.init = find_all_identifiers_and_replace(vardecl.init);
        push_value(vardecl.id.name, vardecl.init);
    }
    //console.log('added ' + vardecl.id.name + ' ' + JSON.stringify(get_var(vardecl.id.name)));
}

function update_scope_assignment(assignment){
    //TODO support arrays
    if(assignment.expression.type != 'AssignmentExpression') return assignment;//TODO support callee expression
    let name = assignment.expression.left.name;
    porbidden_var = false;
    assignment.expression.right = find_all_identifiers_and_replace(assignment.expression.right);
    push_value(name, assignment.expression.right);
    //console.log('updated ' + name + ' ' + JSON.stringify(get_var(name)));
    if(!(in_body_mode & porbidden_var))
        return -1;
    return assignment;
}

function return_rep(return_ex){
    return_ex.argument = find_all_identifiers_and_replace(return_ex.argument);
    return return_ex;
}

let has_identifier;
function find_all_identifiers_and_replace(toParse) {
    if(toParse == null) return null;
    has_identifier = false;    
    let out = find_identifiers_rec(toParse);
    if(!has_identifier){
        let lits =  parseLiterals(out);
        //console.log(lits);
        lits = eval(lits);
        out = esprima.parseScript(lits + ';').body[0].expression;
    }
    return out;    
}

function find_identifiers_rec(toParse) {
    return toParse.type == 'Identifier' ? replace_identifier(toParse) :
    toParse.type == 'BinaryExpression' ? replace_BinaryExpression(toParse) : 
    toParse.type == 'UnaryExpression' ? replace_UnaryExpression(toParse) : toParse ;
}
// type == 'MemberExpression' ? parseMemberExpression(toParse) : null;   TODO  
function replace_UnaryExpression(unary_exp){
    binary_exp.argument = find_identifiers_rec(unary_exp.argument);
    return unary_exp;
}

function replace_BinaryExpression(binary_exp){
    binary_exp.right = find_identifiers_rec(binary_exp.right);
    binary_exp.left = find_identifiers_rec(binary_exp.left);
    return binary_exp;
}

function replace_identifier(identifier){    
    if(in_body_mode & vars_in_body.includes(identifier.name)) porbidden_var = true;
    let variable = get_var(identifier.name), out;
    if(variable == null){
        has_identifier = true;
        out = identifier;
    }
    else {
        out = find_identifiers_rec(variable.value);   
    }
    return out;
}

let vars_in_body = [], in_body_mode = false, porbidden_var;
function find_all_body_assignment_identifiers(body){
    for(let i = 0; i < body.length; i++){
        if(body[i].type == 'ExpressionStatement' && body[i].expression.type == 'AssignmentExpression')
            vars_in_body.push(body[i].expression.left.name); 
    }
    return body;
}

function delete_identifiers_from_scope(array){
    while(array.length > 0)
        remove_value(array.pop());
}

function body_cond_loop(loop_based){
    loop_based.test = find_all_identifiers_and_replace(loop_based.test);

    loop_based.body = func_on_body(loop_based.body, find_all_body_assignment_identifiers);

    in_body_mode = true; 
    loop_based.body = func_on_body(loop_based.body, substitute_rec);
    in_body_mode = false;
    
    vars_in_body = [];
    loop_based.body = func_on_body(loop_based.body, find_all_body_assignment_identifiers);

    delete_identifiers_from_scope(vars_in_body);
    if(is_empty_body(loop_based.body)) return -1;
    return loop_based;
}

function get_var(var_name){
    for(let i = 0; i < current_scope.length; i++){
        if(current_scope[i].name == var_name)
            return current_scope[i];
    }
    return null;
}

function push_value(var_name, var_value){
    let variable = get_var(var_name);
    if(variable == null)    current_scope.push({name: var_name, value: var_value});    
    else                    variable.value = var_value;
}

function remove_value(var_name){
    for(let i = 0; i < current_scope.length; i++)
        if(current_scope[i].name == var_name){
            current_scope.splice(i,1);
            return;
        }    
}
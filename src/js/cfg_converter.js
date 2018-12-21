import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

export {code_convert_to_cfg, pred_infer};

const code_convert_to_cfg = (codeToConvet) => parseProgram(codeToConvet);

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

var cfg = [];

function parseProgram(toParse) {
    current_scope = [];
    //console.log(JSON.stringify(toParse, null, 2));
    //var type = toParse.type;    if(type == 'Program') 
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
    return type == 'FunctionDeclaration'  ? func_on_body(toParse, parseExps, false) : parseLoops(toParse);
}

function parseLoops(toParse){
    var type = toParse.type;
    return  type == 'WhileStatement' ? body_cond_loop(toParse) :
    //type == 'ForStatement' ? body_cond_loop(toParse) :
        type == 'IfStatement' ? parseIfStatementn(toParse) : toParse;
}

function value_func_on_body(body_expr, func){
    if(body_expr.body.type == 'BlockStatement'){
        return func(body_expr.body.body);
    }
    return func([body_expr.body]);
}

function func_on_body(body_expr, func, rem_brackets_if_one){
    if(body_expr.body.type == 'BlockStatement'){
        body_expr.body.body = func(body_expr.body.body);
        if(rem_brackets_if_one!=false & body_expr.body.body.length == 1) body_expr.body = body_expr.body.body[0];
    }
    else{
        body_expr.body = func([body_expr.body]);//assume if wont give other array
        if(body_expr.body.length == 1) body_expr.body = body_expr.body[0];
    }
    return body_expr;
}

function parse_if_else(toParse){
    if(value_func_on_body(toParse, end_with_ret)){
        scopes.push(current_scope);
        current_scope = clone_JSON_ARRAY(current_scope);
        toParse = func_on_body(toParse, parseExps);
        current_scope = scopes.pop();
    }
    else{
        scopes.push(vars_in_body); vars_in_body = [];
        toParse = func_on_body(toParse, find_all_body_assignment_identifiers);
        if_to_del = if_to_del.concat(vars_in_body); vars_in_body = scopes.pop();
    }
    return pred_infer_check(toParse);
}

function pred_infer_check(toParse) {
    if (if_add_mode) {
        let if_code = pred_infer_previous_if();
        if_code.push(esprima.parse(`pred_array.push({line:${line_num},color:'MediumSeaGreen'});`).body[0]);
        if (toParse.body != null & toParse.type == 'BlockStatement') 
        {
            while(if_code.length > 0)
                toParse.body.unshift(if_code.pop());
        }
        else {
            if_code.push(toParse);
            toParse = { type: 'BlockStatement', body: if_code };
        }
    }
    return toParse;
}

function pred_infer_previous_if() {
    let if_code = [];
    let i = 0;
    while (i < if_add_mode_last_if_line.length) {
        let curr_line_num = if_add_mode_last_if_line[i++];
        if_code.push(esprima.parse(`pred_array.push({line:${curr_line_num},color:'Tomato'});`).body[0]);
    }    
    return if_code;
}

let if_to_del = [];
function parseIfStatementn(toParse) {
    //if not end with ret in body mode else - reg
    if(if_add_mode){
        if_add_mode_last_if_line=[];
        line_num = toParse.test.loc.start.line;
    }
    toParse.test = find_all_identifiers_and_replace(toParse.test);
    toParse.consequent = parse_if_else(toParse.consequent);  
    toParse.alternate = parseElseIfStatementRec(toParse.alternate);

    delete_identifiers_from_scope(if_to_del);

    return toParse;
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementRec(toParse) {
    if(toParse != null){
        if(toParse.type == 'IfStatement')  {
            if(if_add_mode){
                if_add_mode_last_if_line.push(line_num);
                line_num = toParse.test.loc.start.line;
            }
            toParse.test = find_all_identifiers_and_replace(toParse.test);
            toParse.consequent = parse_if_else(toParse.consequent);  
            toParse.alternate = parseElseIfStatementRec(toParse.alternate);
        }
        else {
            if(if_add_mode){
                if_add_mode_last_if_line.push(line_num);
                line_num = toParse.loc.start.line-1;
            }
            toParse = parse_if_else(toParse);  
        }    }
    return toParse;
}

function body_cond_loop(loop_based){
    loop_based.test = find_all_identifiers_and_replace(loop_based.test);

    loop_based.body = func_on_body(loop_based.body, find_all_body_assignment_identifiers);

    in_body_mode = true; 
    loop_based.body = func_on_body(loop_based.body, parseExps);
    in_body_mode = false;
    
    vars_in_body = [];
    loop_based.body = func_on_body(loop_based.body, find_all_body_assignment_identifiers);

    delete_identifiers_from_scope(vars_in_body);
    if(is_empty_body(loop_based.body)) return -1;
    return loop_based;
}

function get_cfg(){
    return cfg;
}

function push_new_statement_node(){
    cfg.push({type:'statements', body:[]});
}

function push_new_if_node(ast_test, ast_true, ast_false){
    cfg.push({type:'decision', test:ast_test, dit:ast_true, dif:ast_false});
}

function push_to_node(ast){
    cfg.slice(-1)[0].body.push(ast);
}

function pop_last_cfg(){
    return cfg.pop();
}
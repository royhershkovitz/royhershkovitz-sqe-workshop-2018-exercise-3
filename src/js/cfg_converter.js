import * as esprima from 'esprima';

export {code_convert_to_cfg, pred_infer};

const code_convert_to_cfg = (codeToConvet) => {
    parseProgram(codeToConvet);
    return cfg;
};

const green_color = '#027710';
const red_color   = '#6B0E01';
let line_num = -1;
let if_add_mode = false;
let if_add_mode_last_if_line, cfg, node_key;
const pred_infer = (parsedCode) => {
    //console.log(parsedCode);
    if_add_mode = true;
    if_add_mode_last_if_line = [];
    let parsed = parseProgram(parsedCode);
    if_add_mode = false;
    return parsed;
};

function parseProgram(toParse) {
    cfg = [];
    if_json_to_update = [];    if_jsons_stack = [];
    node_key = 0;
    toParse.body = parseExps(toParse.body);
    return toParse;
}

function parseExps(toParse) {
    toParse.map(parseExp);
    return toParse;
}

function parseExp(toParse) {
    var type = toParse.type;
    return type == 'FunctionDeclaration'  ? func_on_body(toParse, parseExps, false) :
        type == 'WhileStatement'  ? body_cond_loop(toParse) :
            type == 'IfStatement' ? parseIfStatementn(toParse) : push_ast_to_node(toParse);
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
    func_on_body(toParse, parseExps);
    if_json_to_update.push(get_last_cfg());
    push_new_statement_node(); 
    return pred_infer_check(toParse);
}

function pred_infer_check(toParse) {
    if (if_add_mode) {
        let if_code = pred_infer_previous_if();
        if_code.push(esprima.parse(`pred_array.push({line:${line_num},color:'${green_color}'});`).body[0]);
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
        if_code.push(esprima.parse(`pred_array.push({line:${curr_line_num},color:'${red_color}'});`).body[0]);
    }    
    return if_code;
}

let if_json_to_update, if_jsons_stack;
function parseIfStatementn(toParse) {
    //if not end with ret in body mode else - reg
    if(if_add_mode){
        if_add_mode_last_if_line=[];
        line_num = toParse.test.loc.start.line;
    }
    if_jsons_stack.push(if_json_to_update);
    push_new_if_node(toParse.test);
    const if_cfg = get_last_cfg();
    if_cfg.true = node_key;
    toParse.consequent = parse_if_else(toParse.consequent);
    if_cfg.false = node_key-1;//TODO may be out of bounds
    toParse.alternate = parseElseIfStatementRec(toParse.alternate);
    if_json_to_update = if_jsons_stack.pop();

    return toParse;
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementRec(toParse) {
    if(toParse != null){
        if(toParse.type == 'IfStatement')  {
            if(if_add_mode){                if_add_mode_last_if_line.push(line_num);                line_num = toParse.test.loc.start.line;            }
            push_new_if_node(toParse.test);
            const if_cfg = get_last_cfg();
            toParse.consequent = parse_if_else(toParse.consequent);
            if_cfg.false = node_key-1;//TODO may be out of bounds
            toParse.alternate = parseElseIfStatementRec(toParse.alternate);
        }
        else {
            if(if_add_mode){                if_add_mode_last_if_line.push(line_num);                line_num = toParse.loc.start.line-1;            }
            toParse = parse_if_else(toParse); 
            update_if();
        } 
    }   else update_if();
    return toParse;
}

function update_if(){
    const our_node = node_key-1;
    while(if_json_to_update.length > 0){
        if_json_to_update.pop().next = our_node;
    }
}

function body_cond_loop(loop_based){
    push_new_if_node(loop_based.test, true);
    const cond_loop_cfg = get_last_cfg();
    func_on_body(loop_based, parseExps); 
    get_last_cfg().next = cond_loop_cfg.key;   
    cond_loop_cfg.false = node_key;//TODO may be out of bounds
    
    if(if_add_mode){
        line_num = loop_based.test.loc.start.line;
        const insert = [esprima.parse(`if(pred_array.length == 0 || pred_array.slice(-1)[0].line != ${line_num}){pred_array.push({line:${line_num},color:'${green_color}'})};`).body[0]];
        if (loop_based.body != null & loop_based.type == 'BlockStatement')  loop_based.body.unshift(insert.pop);    
        else    {
            insert.push(loop_based.body);
            loop_based.body = { type: 'BlockStatement', body: insert};
        }
    }
    
    push_new_statement_node();
    return loop_based;
}

function push_new_statement_node(){
    cfg.push({key:node_key++, type:'statements', body:[], next: node_key});
}

function push_new_if_node(ast_test, while_flag){
    const last = get_last_cfg();
    if(last != null && last.body != null && last.body.length == 0)    {
        cfg.pop();
        node_key--;
    }
    cfg.push({key:node_key++, type:'decision', test:ast_test, true:node_key, false:null, while_flag: while_flag});
}

function push_ast_to_node(ast){
    let push_to = cfg.slice(-1)[0];
    if(push_to == null || push_to.type != 'statements')
        push_new_statement_node();    
    push_to = cfg.slice(-1)[0].body;
    if(Array.isArray(ast)){
        for(let i = 0; i < ast.length; i++)
            push_to.push(ast[i]);    
    }
    else push_to.push(ast);
}


function get_last_cfg(){
    return cfg.slice(-1)[0];
}

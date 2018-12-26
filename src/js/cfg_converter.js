import * as esprima from 'esprima';
//
import * as escodegen from 'escodegen';
//
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
    return type == 'FunctionDeclaration'  ? func_on_body(toParse.body, parseExps, false) :
        type == 'WhileStatement'  ? body_cond_loop(toParse) :
            type == 'IfStatement' ? parseIfStatementn(toParse) : push_ast_to_node(toParse);
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

function parse_if_else(toParse){
    toParse = func_on_body(toParse, parseExps);
    //remove_empty_body();
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

function first_decision(key){
    if(cfg[key].type != 'decision' && key + 1 < cfg.length)
        return first_decision(key+1);
    else return key;
}
let if_json_to_update, if_jsons_stack;
function parseIfStatementn(toParse) {
    //if not end with ret in body mode else - reg
    if(if_add_mode){
        if_add_mode_last_if_line=[];
        line_num = toParse.test.loc.start.line;
    } 
    const last = get_last_cfg();
    if_jsons_stack.push(if_json_to_update); if_json_to_update=[];
    const true_key = node_key;
    push_new_statement_node();
    toParse.consequent = parse_if_else(toParse.consequent);
    let false_key = node_key;
    toParse.alternate = parseElseIfStatementRec(toParse.alternate);
    false_key = first_decision(false_key);
    last.next = node_key;
    push_new_if_node(toParse.test, true_key, false_key);
    update_if();
    if_json_to_update = if_jsons_stack.pop();
    return toParse;
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementRec(toParse) {
    if(toParse != null){
        if(toParse.type == 'IfStatement')  {
            if(if_add_mode){ if_add_mode_last_if_line.push(line_num); line_num = toParse.test.loc.start.line; }
            const true_key = node_key-1;
            toParse.consequent = parse_if_else(toParse.consequent);
            const false_key = node_key-1;
            toParse.alternate = parseElseIfStatementRec(toParse.alternate);
            push_new_if_node(toParse.test, true_key, false_key);
        }
        else {
            if(if_add_mode){ if_add_mode_last_if_line.push(line_num); line_num = toParse.loc.start.line-1; }
            toParse = parse_if_else(toParse,false);
        }
    }
    return toParse;
}

function update_if(){
    push_merge_node();
    const our_node = node_key-1;//one for last statement and second for ++
    console.log(our_node);
    while(if_json_to_update.length > 0){
        console.log(if_json_to_update.slice(-1)[0]);
        if_json_to_update.pop().next = our_node;
    }
}

function body_cond_loop(loop_based){
    const merge_key = push_merge_node().key;    
    loop_based.body=func_on_body(loop_based.body, parseExps); 
    get_last_cfg().next = merge_key;//to defend last statement from if editing
    push_new_if_node(loop_based.test, true); const while_cfg = get_last_cfg();
    cfg[merge_key].next = while_cfg.key; 
    while_cfg.false = node_key; while_cfg.true = merge_key+1;
    if(if_add_mode){
        line_num = loop_based.test.loc.start.line;
        const insert = [esprima.parse(`if(pred_array.length == 0 || pred_array.slice(-1)[0].line != ${line_num}){pred_array.push({line:${line_num},color:'${green_color}'});};`).body[0]];
        if (loop_based.body.body  != null & loop_based.body.type == 'BlockStatement')  loop_based.body.body.unshift(insert.pop());    
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

function remove_empty_body(){
    const last = get_last_cfg();
    if(last != null && last.type == 'statements' && last.body.length == 0)    {
        cfg.pop();
        node_key--;
        return last;
    }else return null;
}

function parse_tests(ast_test,test_list){
    if(ast_test.type == 'BinaryExpression' && (ast_test.operator == '|' | ast_test.operator == '&'))
        parseTestLogicalExp(ast_test,test_list);    
    else if(ast_test.type == 'LogicalExpression') parseTestLogicalExp(ast_test);        
    else        test_list.push({ast: ast_test, next:null});
    function parseTestLogicalExp(ast_test){
        if(ast_test.operator == '||' | ast_test.operator == '|'){
            parse_tests(ast_test.left,test_list);
            test_list.slice(-1)[0].next = false;//'or';
            parse_tests(ast_test.right,test_list);        }
        else if(ast_test.operator == '&&' | ast_test.operator == '&'){            
            parse_tests(ast_test.left,test_list);
            test_list.slice(-1)[0].next = true;//'and';
            parse_tests(ast_test.right,test_list);
        }        else test_list.push({ast: ast_test, next:null});
    }
}

function push_new_if_node(ast_test, true_key, false_key, while_flag){
    const test_list = [], change_to_merge = [];
    parse_tests(ast_test,test_list); const add_merge_p = test_list.length > 1;
    remove_empty_body();    push_tests();
    if(add_merge_p){
        const merge = push_merge_node(); merge.next = false_key; cfg[false_key].next = node_key;
        while(change_to_merge.length > 0){
            const decision = change_to_merge.shift();
            if(decision.update == null || decision.update)
                decision.json.false = merge.key; }    }
    function push_tests(){        
        while(test_list.length > 0){
            const decision = test_list.shift();
            if(decision.next == null) cfg.push({key:node_key++, type:'decision', test:decision.ast, true:true_key, false:false_key, while_flag: while_flag});        
            else if(decision.next) cfg.push({key:node_key++, type:'decision', test:decision.ast, true:node_key, false:null, while_flag: while_flag});
            else cfg.push({key:node_key++, type:'decision', test:decision.ast, true:true_key, false:node_key, while_flag: while_flag});
            change_to_merge.push({json:get_last_cfg(), update:decision.next});    
        }    }
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

function push_merge_node(){
    const last = remove_empty_body();
    cfg.push({key:node_key++, type:'merge', next: node_key});
    const node = get_last_cfg();
    if(last != null){
        cfg.push({key:node_key++, type:'statements', body:last.body, next: node_key});
        return node;
    }
    return node;
}


function get_last_cfg(){
    return cfg.slice(-1)[0];
}

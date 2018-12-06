export { substitute, color_condition_of_function };
import { parseLiterals } from './code-analyzer';
import { parseScript } from 'esprima';

const substitute = (code_array) => {    
    scopes = [];
    scope = [];
    vars_in_body = [];
    substitute_rec(code_array);
};

function substitute_rec(code_array) {    
    for(let i = 0; i < code_array.length; i++)
        pass_on_array(code_array[i]);    
}

let parsers = [ {type:'assignment expression', parser: update_scope_assignment}, {type:'variable declaration', parser: add_to_scope},
                {type:'function declaration', parser: forgetable_body_based}, {type: 'for statement', parser: body_cond_loop}, {type: 'while statement', parser: body_cond_loop},
                {type:'if statement', parser: body_cond_based}, {type: 'else if statement', parser: body_cond_based}, {type: 'else statement', parser: forgetable_body_based},
                {type: 'return statement', parser: return_rep} ],
    scopes,
    scope ;

function pass_on_array(expr){
    //console.log(expr);
    for(let i = 0; i<parsers.length; i++)
    {
        if(parsers[i].type == expr.type){
            parsers[i].parser(expr); 
            return;
        }
    }
    //console.log("type not found: " + expr.type);
}

function return_rep(return_ex){
    return_ex.value = replace_a_vars_with_vals(return_ex.value);    
}

function add_to_scope(vardecl){
    if(vardecl.value != null && !Array.isArray(vardecl.value)){//TODO support arrays
        vardecl.color = 'deleted';
        vardecl.value = replace_a_vars_with_vals(vardecl.value);
        push_value(vardecl.name, vardecl.value);
    }
}

function update_scope_assignment(vardecl){
    let name = vardecl.name;
    if(name[name.length - 1] == ']') return;
    if(vardecl.value != null && !Array.isArray(vardecl.value)){//TODO support arrays
        porbidden_var = false;
        vardecl.value = replace_a_vars_with_vals_assignment(vardecl.value, vardecl.name);
        if(! (in_body_mode & porbidden_var))
            vardecl.color = 'deleted';
        push_value(name, vardecl.value);
    }
}

function replace_a_vars_with_vals_assignment(expr, name){
    current_identifier_name = name;
    let replaced = replace_a_vars_with_vals(expr);    
    current_identifier_name = null;
    return replaced;
}

function replace_a_vars_with_vals(expr){
    let parsed_lit = parseScript(expr + ';').body[0].expression;
    return find_all_identifiers_and_replace(parsed_lit);
}

let has_identifier;
let current_identifier_name = null;
function find_all_identifiers_and_replace(toParse) {
    has_identifier = false;
    toParse = find_identifiers_rec(toParse);
    let lits =  parseLiterals(toParse);

    if(!has_identifier) lits = eval(lits);
    return lits;    
}

function find_identifiers_rec(toParse) {
    return toParse.type == 'Identifier' ? replace_identifier(toParse) :
    toParse.right != null ? {type: 'BinaryExpression', right: find_identifiers_rec(toParse.right), left: find_identifiers_rec(toParse.left), operator: toParse.operator} :
    toParse.argument != null ? {type: 'UnaryExpression', prefix: toParse.prefix, operator: toParse.operator,  argument: find_identifiers_rec(toParse.argument)} : toParse ;
}
// type == 'MemberExpression' ? parseMemberExpression(toParse) : null;   TODO  

function replace_identifier(identifier){
    if(in_body_mode & vars_in_body.includes(identifier.name)) porbidden_var = true;
    let variable = get_var(identifier.name), out;
    if(variable == null){
        has_identifier = true;
        out = identifier;
    }
    else {
        out = find_identifiers_rec(parseScript(variable.value + ';').body[0].expression);   
    }
    return out;
}

function delete_identifiers_from_scope(){
    while(vars_in_body.length > 0)
        remove_value(vars_in_body.pop());
}

let vars_in_body = [], in_body_mode = false, porbidden_var;
function find_all_body_assignment_identifiers(array){
    for(let i = 0; i<array.length; i++)
        if(array[i].type == 'assignment expression')
            vars_in_body.push(array[i].name);    
}

function body_cond_based(loop_based){
    loop_based.condition = replace_a_vars_with_vals(loop_based.condition);
    forgetable_body_based(loop_based);
}

function body_cond_loop(loop_based){
    loop_based.condition = replace_a_vars_with_vals(loop_based.condition);

    in_body_mode = true;   
    find_all_body_assignment_identifiers(loop_based.body);

    substitute_rec(loop_based.body);     
    delete_deleted_lines(loop_based.body);  
    
    vars_in_body = [];
    find_all_body_assignment_identifiers(loop_based.body);
    
    delete_identifiers_from_scope();
    in_body_mode = false;    
}

function clone_JSON_ARRAY(frame){
    let i = 0, new_scope = [];
    while(i < frame.length){
        new_scope.push(JSON.parse(JSON.stringify(frame[i])));
        i = i + 1;
    }
    return new_scope;
}

function forgetable_body_based(loop_based){
    scopes.push(scope);
    scope = clone_JSON_ARRAY(scope);
    substitute_rec(loop_based.body);        
    scope = scopes.pop();

    delete_deleted_lines(loop_based.body);
}

function delete_deleted_lines(body){
    let i = 0;
    while(i < body.length){
        if(body[i].color == 'deleted') body.splice(i, 1);
        else        i++;
    }
}

function get_var(var_name){
    for(let i = 0; i < scope.length; i++){
        if(scope[i].name == var_name)
            return scope[i];
    }
    return null;
}

function push_value(var_name, var_value){
    let variable = get_var(var_name);
    if(variable == null)    scope.push({name: var_name, value: var_value});    
    else                    variable.value = var_value;
}

function remove_value(var_name){
    for(let i = 0; i < scope.length; i++)
        if(scope[i].name == var_name){
            scope.splice(i,1);
            return;
        }    
}

const color_condition_of_function = (code_array, param) => {    
    //TODO eval function
    //TODO linter
    //TODO test
    return code_array;
};
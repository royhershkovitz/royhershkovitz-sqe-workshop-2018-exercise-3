import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    //information to save about each expr
    //Line    Type    Name    Condition    Value
    var toParse = esprima.parseScript(codeToParse,{loc: true});
        parseProgram(toParse);
        //console.log(current_scope);
        //console.log(JSON.stringify(toParse, null, 2));
        toParse = esprima.parseScript(codeToParse);
        return toParse;
};

var current_scope = [];
var scopes = [];
function parsedList(){
    return current_scope.slice(0);
}

function parseProgram(toParse) {
    current_scope = [];
    var type = toParse.type;
    //console.log(JSON.stringify(toParse, null, 2));
    if(type == 'Program') 
        parseExps(toParse.body);
    //else            
    //    console.log('Doesn\'t know how to parse something that is not program!');
}

let is_first_binary_ex = true;
function parseLiterals(toParse) {
    let last_is_first_binary_ex = is_first_binary_ex;
    let out = parseLiteralsHelper(toParse);
    is_first_binary_ex = last_is_first_binary_ex;
    return out;
}
function parseLiteralsHelper(toParse) {
    if(toParse == null) return null;
    var type = toParse.type;
    return type == 'Identifier' ? parseIdentifier(toParse) :
        type == 'Literal' ? parseLitetral(toParse) : 
            type == 'BinaryExpression' ? parseBinaryExpression(toParse) :
                parseComplecatedLiteral(toParse);
}

function parseComplecatedLiteral(toParse){
    var type = toParse.type;
    return type == 'LogicalExpression' ? parseBinaryExpression(toParse) : 
        type == 'UnaryExpression' ? parseUnaryExpression(toParse) :
            type == 'UpdateExpression' ? parseUnaryExpression(toParse) :                                     
                type == 'MemberExpression' ? parseMemberExpression(toParse) : null;    
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

function parseBinaryExpression(toParse) {
    if(!is_first_binary_ex)
        return '(' + parseLiterals(toParse.left) + ' ' + toParse.operator + ' ' + parseLiterals(toParse.right)  + ')';    
    is_first_binary_ex = false;
    return parseLiterals(toParse.left) + ' ' + toParse.operator + ' ' + parseLiterals(toParse.right);;
}

function parseUnaryExpression(toParse) {
    return toParse.prefix ? toParse.operator + '' + parseLiterals(toParse.argument) :
        parseLiterals(toParse.argument) + '' + toParse.operator;
}

function parseIdentifier(toParse) {
    return toParse.name;
}

function parseExp(toParse) {
    var type = toParse.type;
    type == 'FunctionDeclaration' ? parseFunctionDeclaration(toParse) : 
        type == 'VariableDeclaration' ? parseVariableDeclaration(toParse) :
            type == 'ExpressionStatement' ? parseExpressionStatement(toParse.expression) :
                type == 'ReturnStatement' ? parseReturnStatement(toParse) : parseLoops(toParse);    
}

function parseLoops(toParse){
    var type = toParse.type;
    return  type == 'ForStatement' ? parseForStatement(toParse) :
        type == 'WhileStatement' ? parseWhileStatement(toParse) :
            type == 'IfStatement' ? parseIfStatementn(toParse) : null;
}

function parseCallExpression(toParse) {
    insertValueToList(toParse.loc, 'call expression', toParse.callee.name, null, null);
    toParse.arguments.forEach(parseArg);
}

function parseArg(toParse) {
    insertValueToList(toParse.loc, 'callee argument', null, null, parseLiterals(toParse));
}

function parseFunctionDeclaration(toParse) {    
    let body = parseBody(toParse.body);
    let params = extendScopeForFunction(() => 
    {
        toParse.params.forEach(parseParam);
    });
    insertFunctionToList(toParse.loc, 'function declaration', toParse.id.name, params, body);
}

function parseParam(toParse) {
    insertValueToList(toParse.loc, 'variable declaration', toParse.name, null, parseLiterals(toParse.init));
}


function parseVariableDeclaration(toParse) {
    toParse.declarations.forEach(parseVariableDeclarator);
}

function parseVariableDeclarator(toParse) {
    insertValueToList(toParse.loc, 'variable declaration', toParse.id.name, null, parseLiterals(toParse.init));
}

function changeToSpacedLoweCase(input) {
    var str = new String(input);    var i = 1;
    while(i < str.length){
        if(str.charCodeAt(i) >= 65    && str.charCodeAt(i) <= 90){
            str = (str.substring(0,i) + ' ' + str.substring(i)).toLowerCase();
            return str;
        }
        i++;
    }
}

function parseExpressionStatement(toParse) {
    //toParse = toParse.expression;
    var type = toParse.type;
    if(type == 'CallExpression')
        parseCallExpression(toParse);
    else if(type == 'AssignmentExpression') {
        insertValueToList(toParse.loc, 'assignment expression', get_name(toParse.left), null, parseLiterals(toParse.right));
	}
    else    insertValueToList(toParse.loc, changeToSpacedLoweCase(toParse.type), null, null, parseLiterals(toParse));
}


function parseForStatement(toParse) {
    let body = parseBody(toParse.body);        
    let vars_array = extendScopeForFunction(() =>     {        parseExp(toParse.init);    });
    let update_ex = toParse.update;
    if(update_ex.type == 'AssignmentExpression')
        update_ex = {line:update_ex.loc.start.line, type:'assignment expression', name:get_name(update_ex.left), condition:null, value:parseLiterals(update_ex.right)};
    else
        update_ex =  {line:toParse.update.loc.start.line, type:'update expression', value:parseLiterals(toParse.update)};
    insertForLoopToList(toParse.loc, 'for statement', vars_array,  parseLiterals(toParse.test),  update_ex, body) 
}


function parseWhileStatement(toParse) {    
    let body = parseBody(toParse.body);
    insertValueToList(toParse.loc, 'while statement', null, parseLiterals(toParse.test), null, body);
}


function parseIfStatementn(toParse) {
    let body = parseBody(toParse.consequent);
    insertValueToList(toParse.loc, 'if statement', null, parseLiterals(toParse.test), null, body);
    parseElseIfStatement(toParse);
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatement(toParse) {
    toParse = toParse.alternate;
    if(toParse != null){
        if(toParse.type == 'IfStatement')  {
            let body = parseBody(toParse.consequent);
            insertValueToList(toParse.loc, 'else if statement', null, parseLiterals(toParse.test), null, body);
            parseElseIfStatement(toParse);
        }
        else {
            let body = parseBody(toParse);
            insertValueToList(toParse.loc, 'else statement', null, null, null, body);
        }
    }
}


function parseReturnStatement(toParse) {
    insertValueToList(toParse.loc, 'return statement', null, null, parseLiterals(toParse.argument));
}


//get list of exp
function parseExps(toParse) {
    toParse.forEach(parseExp);
    return current_scope;
}

function extendScopeForFunction(func){
    scopes.push(current_scope);
    current_scope = [];
    
    func();
        
    let body = current_scope;
    current_scope = scopes.pop();

    return body;
    
}

function parseBody(toParse) {
    return extendScopeForFunction(() => 
    {
        var type = toParse.type;
        type == 'BlockStatement' ?
            parseExps(toParse.body) :
                parseExp(toParse);
    });
}

function insertValueToList(line, Type, Name, Condition, Value) {
    current_scope.push({line:line.start.line, type:Type, name:Name, condition:Condition, value:Value});
}

function insertFunctionToList(line, Type, Name, params, body) {
    current_scope.push({line:line.start.line, type:Type, name:Name, params:params, body:body});
}

function insertForLoopToList(line, Type, VarDecl, Condition, Update, body) {
    current_scope.push({line:line.start.line, type:Type, var:VarDecl, condition:Condition, update:Update, body:body});
}

function insertValueToList(line, Type, Name, Condition, Value, body) {
    current_scope.push({line:line.start.line, type:Type, name:Name, condition:Condition, value:Value, body:body});
}

export {parseCode, parsedList, parseProgram};

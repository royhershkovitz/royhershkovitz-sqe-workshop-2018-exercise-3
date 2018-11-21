import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    //information to save about each expr
    //Line    Type    Name    Condition    Value
    try{
        var toParse = esprima.parseScript(codeToParse,{loc: true});
        parseProgram(toParse);
        //console.log(lst);
        //console.log(JSON.stringify(toParse, null, 2));
        toParse = esprima.parseScript(codeToParse);
        return toParse;
    }
    catch(err){
        return 'illegal syntex ' + err;
    }
};

var lst = [];
function parsedList(){
    return lst;
}

function parseProgram(toParse) {
    lst = [];
    var type = toParse.type;
    //console.log(JSON.stringify(toParse, null, 2));
    if(type == 'Program') 
        parseExps(toParse.body);
    //else            
    //    console.log('Doesn\'t know how to parse something that is not program!');
}


function parseLiterals(toParse) {
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

function parseMemberExpression(toParse){
    return toParse.object.name + '[' + (toParse.property.name) + ']';
}

function parseBinaryExpression(toParse) {
    return '(' + parseLiterals(toParse.left) + ' ' + toParse.operator + ' ' + parseLiterals(toParse.right) + ')';
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
    else if(type == 'AssignmentExpression')
        insertValueToList(toParse.loc, 'assignment expression', toParse.left.name, null, parseLiterals(toParse.right));
    else    insertValueToList(toParse.loc, changeToSpacedLoweCase(toParse.type), null, null, parseLiterals(toParse));
}


function parseForStatement(toParse) {
    insertValueToList(toParse.loc, 'for statement', null, parseLiterals(toParse.test), null);
    parseExpressionStatement(toParse.init);
    parseExpressionStatement(toParse.update);
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


function parseReturnStatement(toParse) {
    insertValueToList(toParse.loc, 'return statement', null, null, parseLiterals(toParse.argument));
}


//get list of exp
function parseExps(toParse) {
    toParse.forEach(parseExp);
    return lst;
}

function parseBody(toParse) {
    var type = toParse.type;
    type == 'BlockStatement' ? parseExps(toParse.body) : 
        parseExp(toParse);
}

function insertValueToList(line, Type, Name, Condition, Value) {
    lst.push({line:line.start.line, type:Type, name:Name, condition:Condition, value:Value});
}

export {parseCode, parsedList, parseProgram};

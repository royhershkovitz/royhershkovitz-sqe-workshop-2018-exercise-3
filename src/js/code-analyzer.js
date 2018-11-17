import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
	//information to save about each expr
	//Line	Type	Name	Condition	Value
	var toParse = esprima.parseScript(codeToParse,{loc: true});
	parseProgram(toParse);
	console.log(lst);
	//console.log(JSON.stringify(toParse, null, 2));
    return toParse;
};

var lst = [];

function parseProgram(toParse) {
	if(toParse == null) return null;
	var type = toParse.type;
	return type == "Program" ? parseExps(toParse.body) : null;
}

function parseLiterals(toParse) {
	if(toParse == null) return null;
	var type = toParse.type;
	return type == "Literal" ? parseLitetral(toParse) : 
		type == "BinaryExpression" ? parseBinaryExpression(toParse) :
			type == "UnaryExpression" ? parseUnaryExpression(toParse) :
				type == "Identifier" ? parseIdentifier(toParse) : 
					type == "UpdateExpression" ? parseUnaryExpression(toParse.right) : null;	
}

function parseLitetral(toParse) {
	return toParse.value;
}

function parseBinaryExpression(toParse) {
	return parseLiterals(toParse.left) + " " + toParse.operator + " " + parseLiterals(toParse.right);
}

function parseUnaryExpression(toParse) {
	return toParse.prefix ? toParse.operator + "" + parseLiterals(toParse.argument) :
		 parseLiterals(toParse.argument) + "" + toParse.operator;
}

function parseIdentifier(toParse) {
	return toParse.name;
}

function parseExp(toParse) {
	if(toParse == null) return null;
	var type = toParse.type;
	type == "FunctionDeclaration" ? parseFunctionDeclaration(toParse) : 
		type == "VariableDeclaration" ? parseVariableDeclaration(toParse) :
			type == "ExpressionStatement" ? parseExpressionStatement(toParse) :
				type == "ForStatement" ? parseForStatement(toParse) :
					type == "WhileStatement" ? parseWhileStatement(toParse) :
						type == "IfStatement" ? parseIfStatementn(toParse) :
							type == "ReturnStatement" ? parseReturnStatement(toParse) : null;	
}

function parseFunctionDeclaration(toParse) {
	insertValueToList(toParse.loc, "function declaration", toParse.id.name, null, null);
	toParse.params.forEach(parseParam);
	parseBody(toParse.body);
}

function parseParam(toParse) {
	insertValueToList(toParse.loc, "variable declaration", toParse.name, null, parseLiterals(toParse.init));
}


function parseVariableDeclaration(toParse) {
	toParse.declarations.forEach(parseVariableDeclarator);
}

function parseVariableDeclarator(toParse) {
	insertValueToList(toParse.loc, "variable declaration", toParse.id.name, null, parseLiterals(toParse.init));
}


function parseExpressionStatement(toParse) {
	toParse = toParse.expression;
	var type = toParse.type;
	if(type == "AssignmentExpression")
		insertValueToList(toParse.left.loc, "assignment expression", toParse.left.name, null, parseLiterals(toParse.right));
	else if(type == "UpdateExpression")
		insertValueToList(toParse.right.loc, "update expression", null, null, parseUnaryExpression(toParse.right));
}


function parseForStatement(toParse) {
	insertValueToList(toParse.loc, "for statement", null, parseLiterals(toParse.test), null);
	parseExpressionStatement(toParse.init);
	parseExpressionStatement(toParse.update);
	parseBody(toParse.body);
}


function parseWhileStatement(toParse) {
	insertValueToList(toParse.loc, "while statement", null, parseLiterals(toParse.test), null);
	parseBody(toParse.body);
}


function parseIfStatementn(toParse) {
	insertValueToList(toParse.loc, "if statement", null, parseLiterals(toParse.test), null);
	parseElseIfStatementn(toParse);
}

//give the opportunity to parse multiple else if as 'else if statement'
function parseElseIfStatementn(toParse) {
	parseBody(toParse.consequent);
	if(toParse.alternate.type == "IfStatement")	{
		insertValueToList(toParse.loc, "else if statement", null, parseLiterals(toParse.test), null);
		parseElseIfStatementn(toParse.alternate)
	}
	else {
		insertValueToList(toParse.loc, "else statement", null, null, null);
		parseBody(toParse.alternate);
	}
}


function parseReturnStatement(toParse) {
	insertValueToList(toParse.loc, "return statement", null, null, parseLiterals(toParse.argument));
}


//get list of exp
function parseExps(toParse) {
	toParse.forEach(parseExp);
	return lst;
}

function parseBody(toParse) {
	if(toParse == null) return null;
	var type = toParse.type;
	type == "BlockStatement" ? parseExps(toParse.body) : 
		parseExp(toParse);
}

function insertValueToList(line, Type, Name, Condition, Value) {
	lst.push({line:line.start.line, type:Type, name:Name, condition:Condition, value:Value});
}

export {parseCode};

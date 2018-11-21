import assert from 'assert';
import {parseCode, parsedList, parseProgram} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}');
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}');
    });
    
    it('is parsing a simple let correctly', () => {
        parseCode('let low, high = 1, mid = true, mid2 = -1;'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'variable declaration', name: 'low', condition: null, value: null},
                 {line: 1, type: 'variable declaration', name: 'high', condition: null, value: 1},
                 {line: 1, type: 'variable declaration', name: 'mid', condition: null, value: true},
                 {line: 1, type: 'variable declaration', name: 'mid2', condition: null, value: '-1'}]);
    });
    
    it('is parsing a simple var correctly', () => {
        parseCode('var low, high = 1, mid = true, mid2 = -1;'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'variable declaration', name: 'low', condition: null, value: null},
                 {line: 1, type: 'variable declaration', name: 'high', condition: null, value: 1},
                 {line: 1, type: 'variable declaration', name: 'mid', condition: null, value: true},
                 {line: 1, type: 'variable declaration', name: 'mid2', condition: null, value: '-1'}]);
    });
    
    it('is parsing a simple function correctly', () => {
        parseCode('function binarySearch(X, V, n){\nvar low;\nlow = 0;\nreturn -1;\n}'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'function declaration', name: 'binarySearch', condition: null, value: null},
                 {line: 1, type: 'variable declaration', name: 'X', condition: null, value: null},
                 {line: 1, type: 'variable declaration', name: 'V', condition: null, value: null},
                 {line: 1, type: 'variable declaration', name: 'n', condition: null, value: null},
                 {line: 2, type: 'variable declaration', name: 'low', condition: null, value: null},
                 {line: 3, type: 'assignment expression', name: 'low', condition: null, value: 0},
                 {line: 4, type: 'return statement', name: null, condition: null, value: '-1'}]);
    });

    it('is parsing a simple for correctly', () => {
        parseCode('var i = 0;\n    for( i = 1; i < 3; i = i + 1){\n  i = 8;\n i = 9;\n    }'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'variable declaration', name: 'i', condition: null, value: 0},
                 {line: 2, type: 'for statement', name: null, condition: '(i < 3)', value: null},
                 {line: 2, type: 'assignment expression', name: 'i', condition: null, value: 1},
                 {line: 2, type: 'assignment expression', name: 'i', condition: null, value: '(i + 1)'},
                 {line: 3, type: 'assignment expression', name: 'i', condition: null, value: 8},
                 {line: 4, type: 'assignment expression', name: 'i', condition: null, value: 9}]);
    });
    
    it('is parsing a simple for correctly2', () => {
        parseCode('var i = 0;\n    for( i = 1; i < 3; i = i++)\n  i = 8;\n'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'variable declaration', name: 'i', condition: null, value: 0},
                 {line: 2, type: 'for statement', name: null, condition: '(i < 3)', value: null},
                 {line: 2, type: 'assignment expression', name: 'i', condition: null, value: 1},
                 {line: 2, type: 'assignment expression', name: 'i', condition: null, value: 'i++'},
                 {line: 3, type: 'assignment expression', name: 'i', condition: null, value: 8}]);
    });
    
    it('is parsing a simple function call correctly', () => {
        parseCode('binarySearch(1, 2.2, true, \'proc\', \'c\');'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'call expression', name: 'binarySearch', condition: null, value: null},
                {line: 1, type: 'callee argument', name: null, condition: null, value: 1},
                {line: 1, type: 'callee argument', name: null, condition: null, value: 2.2},
                {line: 1, type: 'callee argument', name: null, condition: null, value: true},
                {line: 1, type: 'callee argument', name: null, condition: null, value: 'proc'},
                {line: 1, type: 'callee argument', name: null, condition: null, value: 'c'}]);
    });
    
    it('is parsing a if-else correctly', () => {
        parseCode('if((true & false) || false && true)\n++x;\nelse\n--j;'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'if statement', name: null, condition: '((true & false) || (false && true))', value: null},
                 {line: 2, type: 'update expression', name: null, condition: null, value: '++x'},
                 {line: 4, type: 'else statement', name: null, condition: null, value: null},
                 {line: 4, type: 'update expression', name: null, condition: null, value: '--j'}]);
    });
    
    it('is parsing a single if correctly', () => {
        parseCode('if(true)\n++x;'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'if statement', name: null, condition: true, value: null},
                 {line: 2, type: 'update expression', name: null, condition: null, value: '++x'}]);
    });
    
    it('is parsing not supported input?', () => {
        parseCode('switch(expression) {\n  case x:\n    b = b + a;\n    break;\n    case y:\n    a = b + a;\n    break;\n    default:\n        b = 2*b;}'),
        assert.deepEqual(parsedList(), []);
    });
    
    it('is not crashing?', () => {
        parseCode('}'),
        assert.deepEqual(parsedList(),
                []);
    });
    
    it('is not parsing not crashing?', () => {
        parseCode('}'),
        assert.deepEqual(parsedList(),
                []);
    });
    
    it('is not crashing on empty for?', () => {
        parseCode('for( i = 1; i < 3; i = i + 1){}'),
        assert.deepEqual(parsedList(),        		
                [{line: 1, type: 'for statement', name: null, condition: '(i < 3)', value: null},
                 {line: 1, type: 'assignment expression', name: 'i', condition: null, value: 1},
                 {line: 1, type: 'assignment expression', name: 'i', condition: null, value: '(i + 1)'}]);
    });
    
    it('parsing legal json?', () => {
        parseProgram({              'type': 'Program',              'body': [                {                  'type': 'ExpressionStatement',                  'expression': {                    'type': 'AssignmentExpression',                    'operator': '=',                    'left': {                      'type': 'Identifier',
                      'name': 'x',                      'loc': {                        'start': {                          'line': 1,
                          'column': 0                        },                        'end': {                          'line': 1,
                          'column': 1                        }                      }                    },
                    'right': {                      'type': 'Literal',                      'value': 1,
                      'raw': '1',                      'loc': {                        'start': {                          'line': 1,
                          'column': 4                        },                        'end': {                          'line': 1,
                          'column': 5                        }                      }                    },                    'loc': {                      'start': {
                        'line': 1,                        'column': 0                      },                      'end': {                        'line': 1,                        'column': 5                      }
                    }                  },                  'loc': {                    'start': {                      'line': 1,                      'column': 0                    },                    'end': {
                      'line': 1,                      'column': 6                    }                  }                }              ],
              'sourceType': 'script',              'loc': {                'start': {                  'line': 1,                  'column': 0
                },                'end': {                  'line': 1,                  'column': 6                }              }            }),
        assert.deepEqual(parsedList(), [{line: 1, type: 'assignment expression', name: 'x', condition: null, value: 1}]);
    });
    
    it('parsing illegal type in json form?', () => {
        parseProgram({              'type': 'Program',              'body': [                {                  'type': 'notARegType',                  'expression': {                    'type': 'AssignmentExpression',                    'operator': '=',                    'left': {                      'type': 'Identifier',
                      'name': 'x',                      'loc': {                        'start': {                          'line': 1,
                          'column': 0                        },                        'end': {                          'line': 1,
                          'column': 1                        }                      }                    },
                    'right': {                      'type': 'Literal',                      'value': 1,
                      'raw': '1',                      'loc': {                        'start': {                          'line': 1,
                          'column': 4                        },                        'end': {                          'line': 1,
                          'column': 5                        }                      }                    },                    'loc': {                      'start': {
                        'line': 1,                        'column': 0                      },                      'end': {                        'line': 1,                        'column': 5                      }
                    }                  },                  'loc': {                    'start': {                      'line': 1,                      'column': 0                    },                    'end': {
                      'line': 1,                      'column': 6                    }                  }                }              ],
              'sourceType': 'script',              'loc': {                'start': {                  'line': 1,                  'column': 0
                },                'end': {                  'line': 1,                  'column': 6                }              }            }),
        assert.deepEqual(parsedList(), []);
    });
    
    it('parsing illegal type in json form2?', () => {
        parseProgram({              'type': 'notProgram',              'body': [                {                  'type': 'ExpressionStatement',                  'expression': {                    'type': 'AssignmentExpression',                    'operator': '=',                    'left': {                      'type': 'Identifier',
              'name': 'x',                      'loc': {                        'start': {                          'line': 1,
                  'column': 0                        },                        'end': {                          'line': 1,
                  'column': 1                        }                      }                    },
            'right': {                      'type': 'Literal',                      'value': 1,
              'raw': '1',                      'loc': {                        'start': {                          'line': 1,
                  'column': 4                        },                        'end': {                          'line': 1,
                  'column': 5                        }                      }                    },                    'loc': {                      'start': {
                'line': 1,                        'column': 0                      },                      'end': {                        'line': 1,                        'column': 5                      }
            }                  },                  'loc': {                    'start': {                      'line': 1,                      'column': 0                    },                    'end': {
              'line': 1,                      'column': 6                    }                  }                }              ],
      'sourceType': 'script',              'loc': {                'start': {                  'line': 1,                  'column': 0
        },                'end': {                  'line': 1,                  'column': 6                }              }            }),
        assert.deepEqual(parsedList(), []);
    });
    
    
    it('parsing unknown base form sould return null', () => {
        parseProgram(
        		{     "type": "Program",        			  "body": [
        			    {        			      "type": "ExpressionStatement",
        			      "expression": {        			        "type": "AssignmentExpression",
        			        "operator": "=",        			        "left": {
        			          "type": "Identifier",        			          "name": "x",
        			          "loc": {        			            "start": {
        			              "line": 1,        			              "column": 0
        			            },        			            "end": {
        			              "line": 1,       			              "column": 1        			            }
        			          }        			        },        			        "right": {
        			          "type": "UnkonwnType",        			          "value": 1,
        			          "raw": "1",        			          "loc": {
        			            "start": {        			              "line": 1,
        			              "column": 4        			            },
        			            "end": {        			              "line": 1,
        			              "column": 5        			            }        			          }        			        },
        			        "loc": {        			          "start": {
        			            "line": 1,        			            "column": 0
        			          },        			          "end": {
        			            "line": 1,        			            "column": 5
        			          }        			        }        			      },
        			      "loc": {        			        "start": {        			          "line": 1,
        			          "column": 0        			        },        			        "end": {
        			          "line": 1,        			          "column": 6        			        }        			      }        			    }
        			  ],        			  "sourceType": "script",        			  "loc": {        			    "start": {
        			      "line": 1,        			      "column": 0        			    },        			    "end": {
        			      "line": 1,        			      "column": 6        			    }        			  }        			});
        		assert.deepEqual(parsedList(), [{line: 1, type: "assignment expression", name: "x", condition: null, value: null}]);
    });
        

    it('is parsing a big input correctly', () => {
        parseCode('function binarySearch(X, V, n){\nlet low, high, mid;\nlow = 0;\nhigh = n - 1;\nwhile (low <= high) {\nmid = (low + high)/2;\nif (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nreturn mid;\n }\nreturn -1;\n}'),
        assert.deepEqual(parsedList(),
                [{line: 1, type: 'function declaration', name: 'binarySearch', condition: null, value: null},
                {line: 1, type: 'variable declaration', name: 'X', condition: null, value: null},
                {line: 1, type: 'variable declaration', name: 'V', condition: null, value: null},
                {line: 1, type: 'variable declaration', name: 'n', condition: null, value: null},
                {line: 2, type: 'variable declaration', name: 'low', condition: null, value: null},
                {line: 2, type: 'variable declaration', name: 'high', condition: null, value: null},
                {line: 2, type: 'variable declaration', name: 'mid', condition: null, value: null},
                {line: 3, type: 'assignment expression', name: 'low', condition: null, value: 0},
                {line: 4, type: 'assignment expression', name: 'high', condition: null, value: '(n - 1)'},
                {line: 5, type: 'while statement', name: null, condition: '(low <= high)', value: null},
                {line: 6, type: 'assignment expression', name: 'mid', condition: null, value: '((low + high) / 2)'},
                {line: 7, type: 'if statement', name: null, condition: '(X < V[mid])', value: null},
                {line: 8, type: 'assignment expression', name: 'high', condition: null, value: '(mid - 1)'},
                {line: 9, type: 'else if statement', name: null, condition: '(X > V[mid])', value: null},
                {line: 10, type: 'assignment expression', name: 'low', condition: null, value: '(mid + 1)'},
                {line: 12, type: 'else statement', name: null, condition: null, value: null},
                {line: 12, type: 'return statement', name: null, condition: null, value: 'mid'},
                {line: 14, type: 'return statement', name: null, condition: null, value: '-1'}]);
    });

});

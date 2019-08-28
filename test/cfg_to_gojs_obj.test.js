/* eslint-disable max-lines-per-function */
import assert from 'assert';
import * as esprima from 'esprima';
import {code_convert_to_cfg} from '../src/js/cfg_converter';
import {make_links, make_statements} from '../src/js/cfg_to_gojs_obj';

function assert_json_obj(json1, json2){
    assert.equal(json1.length, json2.length);
    for(let i = 0; i<json1.length ;i++){
        assert.equal(json1[i].key, json2[i].key);
        assert.equal(json1[i].category, json2[i].category);
        assert.equal(json1[i].text, json2[i].text);
        assert.equal(json1[i].fill, json2[i].fill);
        assert.equal(json1[i].from, json2[i].from);
        assert.equal(json1[i].to, json2[i].to);   
        assert.equal(json1[i].fromPort, json2[i].fromPort); 
        assert.equal(json1[i].toPort, json2[i].toPort);      
    }
}

function assert_eq_func(func){
    return (left, right, param) =>
        assert_json_obj(
            func(code_convert_to_cfg(esprima.parse(left, {loc:true})), param),
            JSON.parse(right));
    
}

const green_color = '#027710';
const red_color   = '#6B0E01';
const black_color   = '#227710';
describe('CFG nodes converter', () => {
    const assert_eq_ms = assert_eq_func(make_statements);
    it('is creating simple foo and let correctly', () => {
        assert_eq_ms(
            `function foo(){
                    let a = 5;
                    return a+2;
            }`,
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = 5;\\n    return a + 2;\\n","fill":"${black_color}"}]`,[]);
    });
    it('is creating simple while and let correctly', () => {
        assert_eq_ms(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;                
                while(1 < 0 ){
                   c = a + c;
                }                
                return c;
            }`,
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = x + 1;\\n    let b = a + y;\\n    let c = 0;\\n","fill":"#227710"},
              {"key":1,"category":"Merge","fill":"#227710"},
              {"key":2,"text":"(2)\\n1 < 0","category":"Conditional","fill":"#6B0E01"},
              {"key":3,"text":"(3)\\n    c = a + c;\\n","fill":"#022020"},
              {"key":4,"text":"(4)\\n    return c;\\n","fill":"#227710"}]`,[]);
    });
    it('is creating simple while and let correctly2', () => {
        assert_eq_ms(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;                
                while(c < 1 ){
                   c = a + c;
                }                
                return c;
            }`,
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
             {"key":-2,"category":"End","loc":"175 660","text":"End"},
             {"key":0,"text":"(1)\\n    let a = x + 1;\\n    let b = a + y;\\n    let c = 0;\\n","fill":"#227710"},
             {"key":1,"category":"Merge","fill":"#227710"},
             {"key":2,"text":"(2)\\nc < 1","category":"Conditional","fill":"#027710"},
             {"key":3,"text":"(3)\\n    c = a + c;\\n","fill":"#227710"},
             {"key":4,"text":"(4)\\n    return c;\\n","fill":"#227710"}]`,[{line: 5, color: green_color}]);
    });
      
    it('is parsing simple if, color true', () => {
        assert_eq_ms(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                
                return -v;
            }`,
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = -9 - 10, v;\\n","fill":"#227710"},
              {"key":1,"text":"(2)\\na < z","category":"Conditional","fill":"#027710"},
              {"key":2,"text":"(3)\\n    v = 0;\\n","fill":"#227710"},
              {"key":3,"category":"Merge","fill":"#227710"},
              {"key":4,"text":"(4)\\n    return -v;\\n","fill":"#227710"}]`,[{line: 3, color: green_color}]);
    });

    it('is parsing simple if, color false', () => {
        assert_eq_ms(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                
                return -v;
            }`,
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = -9 - 10, v;\\n","fill":"#227710"},
              {"key":1,"text":"(2)\\na < z","category":"Conditional","fill":"#6B0E01"},
              {"key":2,"text":"(3)\\n    v = 0;\\n","fill":"#022020"},
              {"key":3,"category":"Merge","fill":"#227710"},
              {"key":4,"text":"(4)\\n    return -v;\\n","fill":"#227710"}]`,[]);
    });

    it('is complecated if and let correctly', () => {
        assert_eq_ms(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z | (1 > 0 & a) || 2>0) {
                    c = c + 5;
                } else if (b < z * 2) {
                    c = c + x + 5;
                } else {
                    c = c + z + 5;
                }
                
                return c;
            }`,            
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = x + 1;\\n    let b = a + y;\\n    let c = 0;\\n","fill":"#227710"},
              {"key":1,"text":"(2)\\nb < z | 1 > 0 & a || 2 > 0","category":"Conditional","fill":"#027710"},
              {"key":2,"text":"(3)\\n    c = c + 5;\\n","fill":"#227710"},
              {"key":3,"text":"(4)\\nb < z * 2","category":"Conditional","fill":"#022020"},
              {"key":4,"text":"(5)\\n    c = c + x + 5;\\n","fill":"#022020"},
              {"key":5,"text":"(6)\\n    c = c + z + 5;\\n","fill":"#022020"},
              {"key":6,"category":"Merge","fill":"#227710"},
              {"key":7,"text":"(7)\\n    return c;\\n","fill":"#227710"}]`,[{line: 6, color: green_color}]);
    });
    it('is complecated if and let correctly2', () => {
        assert_eq_ms(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) {
                    c = c + 5;
                } else if (b < z * 2) {
                    c = c + x + 5;
                } else {
                    c = c + z + 5;
                }
                
                return c;
            }`,            
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = x + 1;\\n    let b = a + y;\\n    let c = 0;\\n","fill":"#227710"},
              {"key":1,"text":"(2)\\nb < z","category":"Conditional","fill":"#6B0E01"},
              {"key":2,"text":"(3)\\n    c = c + 5;\\n","fill":"#022020"},
              {"key":3,"text":"(4)\\nb < z * 2","category":"Conditional","fill":"#027710"},
              {"key":4,"text":"(5)\\n    c = c + x + 5;\\n","fill":"#227710"},
              {"key":5,"text":"(6)\\n    c = c + z + 5;\\n","fill":"#022020"},
              {"key":6,"category":"Merge","fill":"#227710"},
              {"key":7,"text":"(7)\\n    return c;\\n","fill":"#227710"}]`,[{line: 6, color: red_color},{line: 8, color: green_color}]);
    });

    it('is complecated if and let correctly3', () => {
        assert_eq_ms(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) {
                    while(b < z)       c = a + c;
                
                } else if (b < z * 2) {
                    c = c + x + 5;
                } else {
                    c = c + z + 5;
                }                
                return c;
            }`,            
            `[{"key":-1,"category":"Start","loc":"175 0","text":"Start"},
              {"key":-2,"category":"End","loc":"175 660","text":"End"},
              {"key":0,"text":"(1)\\n    let a = x + 1;\\n    let b = a + y;\\n    let c = 0;\\n","fill":"#227710"},
              {"key":1,"text":"(2)\\nb < z","category":"Conditional","fill":"#6B0E01"},
              {"key":2,"category":"Merge","fill":"#022020"},
              {"key":3,"text":"(3)\\nb < z","category":"Conditional","fill":"#022020"},
              {"key":4,"text":"(4)\\n    c = a + c;\\n","fill":"#022020"},
              {"key":5,"text":"(5)\\nb < z * 2","category":"Conditional","fill":"#6B0E01"},
              {"key":6,"text":"(6)\\n    c = c + x + 5;\\n","fill":"#022020"},
              {"key":7,"text":"(7)\\n    c = c + z + 5;\\n","fill":"#227710"},
              {"key":8,"category":"Merge","fill":"#227710"},
              {"key":9,"text":"(8)\\n    return c;\\n","fill":"#227710"}]`,
            [{line: 6, color: red_color},{line: 9, color: red_color}]);
    });
});

describe('CFG links converter', () => {
    const assert_eq_ml = assert_eq_func(make_links);
    it('is creating simple foo and let correctly llinks', () => {
        assert_eq_ml(
            `function foo(){
                    let a = 5;
                    return a+2;
            }`,
            `[{"from":-1,"to":0,"fromPort":"B","toPort":"T"},
              {"from":0,"to":-2,"fromPort":"B","toPort":"T"},
              {"from":0,"to":1,"fromPort":"B","toPort":"T"}]`);
    });
    it('is parsing simple if', () => {
        assert_eq_ml(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                
                return -v;
            }`,
            `[{"from":-1,"to":0,"fromPort":"B","toPort":"T"},
              {"from":4,"to":-2,"fromPort":"B","toPort":"T"},
              {"from":0,"to":1,"fromPort":"B","toPort":"T"},
              {"from":1,"to":3,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":1,"to":2,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":2,"to":3,"fromPort":"B","toPort":"T"},{"from":3,"to":4,"fromPort":"B","toPort":"T"},
              {"from":4,"to":5,"fromPort":"B","toPort":"T"}]`);
    });
    it('is creating simple while and let correctly', () => {
        assert_eq_ml(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;                
                while(1 < 0 ){
                   c = a + c;
                }                
                return c;
            }`,
            `[{"from":-1,"to":0,"fromPort":"B","toPort":"T"},
              {"from":4,"to":-2,"fromPort":"B","toPort":"T"},
              {"from":0,"to":1,"fromPort":"B","toPort":"T"},
              {"from":1,"to":2,"fromPort":"B","toPort":"T"},
              {"from":2,"to":4,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":2,"to":3,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":3,"to":1,"fromPort":"B","toPort":"T"},{"from":4,"to":5,"fromPort":"B","toPort":"T"}]`);
    });
    it('is complecated if and let correctly', () => {
        assert_eq_ml(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z | (1 > 0 & a) || 2>0) {
                    c = c + 5;
                } else if (b < z * 2) {
                    c = c + x + 5;
                } else {
                    c = c + z + 5;
                }
                
                return c;
            }`,            
            `[{"from":-1,"to":0,"fromPort":"B","toPort":"T"},
              {"from":7,"to":-2,"fromPort":"B","toPort":"T"},
              {"from":0,"to":1,"fromPort":"B","toPort":"T"},
              {"from":1,"to":3,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":1,"to":2,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":2,"to":6,"fromPort":"B","toPort":"T"},
              {"from":3,"to":5,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":3,"to":4,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":4,"to":6,"fromPort":"B","toPort":"T"},{"from":5,"to":6,"fromPort":"B","toPort":"T"},
              {"from":6,"to":7,"fromPort":"B","toPort":"T"},{"from":7,"to":8,"fromPort":"B","toPort":"T"}]`);
    });
    it('is complecated if and let correctly2', () => {
        assert_eq_ml(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z | (1 > 0 & a) || 2>0) {
                    while(b < z | (1 > 0 & a) || 2>0)       c = a + c;
                
                } else if (b < z * 2) {
                    c = c + x + 5;
                } else {
                    c = c + z + 5;
                }                
                return c;
            }`,            
            `[{"from":-1,"to":0,"fromPort":"B","toPort":"T"},
              {"from":9,"to":-2,"fromPort":"B","toPort":"T"},
              {"from":0,"to":1,"fromPort":"B","toPort":"T"},
              {"from":1,"to":5,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":1,"to":2,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":2,"to":3,"fromPort":"B","toPort":"T"},
              {"from":3,"to":5,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":3,"to":4,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":4,"to":8,"fromPort":"B","toPort":"T"},
              {"from":5,"to":7,"fromPort":"B","toPort":"T","text":"false","category":"ConditionalLink"},
              {"from":5,"to":6,"fromPort":"B","toPort":"T","text":"true","category":"ConditionalLink"},
              {"from":6,"to":8,"fromPort":"B","toPort":"T"},{"from":7,"to":8,"fromPort":"B","toPort":"T"},
              {"from":8,"to":9,"fromPort":"B","toPort":"T"},{"from":9,"to":10,"fromPort":"B","toPort":"T"}]`);
    });
});
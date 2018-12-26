/* eslint-disable max-lines-per-function */
import assert from 'assert';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import {code_convert_to_cfg, pred_infer} from '../src/js/cfg_converter';

function assert_cfg(json1, json2){
    assert.equal(json1.length, json2.length);
    for(let i = 0; i<json1.length ;i++){
        assert.equal(json1[i].key, json2[i].key);
        assert.equal(json1[i].type, json2[i].type);
        if(json1[i].type != 'decision')
            assert.equal(json1[i].next, json2[i].next);
        assert.equal(json1[i].true, json2[i].true);
        assert.equal(json1[i].false, json2[i].false);        
    }
}

function assert_eq_conv(left, right){
    assert_cfg(
        code_convert_to_cfg(esprima.parse(left)),
        JSON.parse(right));
}

describe('The javascript cfg creator', () => {
    it('is creating simple foo and let correctly', () => {
        assert_eq_conv(
            `function foo(){
                    let a = 5;
                    return a+2;
            }`,
            '[{"key":0,"type":"statements", "next":1}]');
    });
    it('is creating simple while and let correctly', () => {
        assert_eq_conv(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;                
                while(1 < 0 ){
                   c = a + c;
                }                
                return c;
            }`,
            `[{"key": 0, "type": "statements", "next": 1},
             {"key": 1, "type": "merge", "next": 3},
             {"key": 2, "type": "statements", "next": 1},
             {"key": 3, "type": "decision", "true": 2, "false": 4},
             {"key": 4, "type": "statements", "next": 5}]`);
    });

    it('is complecated if and let correctly', () => {
        assert_eq_conv(
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
            `[{"key": 0, "type": "statements", "next": 1},
             {"key": 1, "type": "decision", "true": 2, "false":3},
             {"key": 2, "type": "statements", "next": 6},
             {"key": 3, "type": "decision", "true": 4, "false": 5},
             {"key": 4, "type": "statements", "next": 6},
             {"key": 5, "type": "statements", "next": 6},
             {"key": 6, "type": "merge", "next": 7},
             {"key": 7, "type": "statements", "next": 8}]`);
    });

    it('is complecated if and let correctly2', () => {
        assert_eq_conv(
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
            `[{"key": 0, "type": "statements", "next": 1},
            {"key": 1, "type": "decision", "true": 2, "false": 5},
            {"key": 2, "type": "merge", "next": 4},
            {"key": 3, "type": "statements", "next": 2},
            {"key": 4, "type": "decision", "true": 3, "false": 5},
            {"key": 5, "type": "decision", "true": 6, "false": 7},
            {"key": 6, "type": "statements", "next": 8},
            {"key": 7, "type": "statements", "next": 8},
            {"key": 8, "type": "merge", "next": 9},
            {"key": 9, "type": "statements", "next": 10}]`);
    });
});

const green_color = '#027710';
const red_color   = '#6B0E01';
function assert_eq_pred_inf(left, right){
    assert.equal(
        escodegen.generate(pred_infer(esprima.parse(left,{loc:true}))),
        escodegen.generate(           esprima.parse(right)));
}
describe('The javascript predicate inferior', () => {    
    it('is keeping infering if exp correctly', () => {
        assert_eq_pred_inf(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                
                return -v;
            }`,
            `function foo(z){  
                let a = -9 - 10, v;      
                if (a < z) {
                    pred_array.push({line:3,color:'${green_color}'});
                    v = 0;
                }                
                return -v;
            }`);
    });

    it('is keeping infering if exp correctly2', () => {
        assert_eq_pred_inf(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                else v = 1;
                
                return -v;
            }`,
            `function foo(z){    
                let a = -9 - 10, v;             
                if (a < z) {
                    pred_array.push({line:3,color:'${green_color}'});
                    v = 0;
                } 
                else {
                    pred_array.push({line:3,color:'${red_color}'});
                    pred_array.push({line:4,color:'${green_color}'});
                    v = 1;
                }                
                return -v;
            }`);
    });

    it('is keeping infering if exp correctly3', () => {
        assert_eq_pred_inf(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                else if(a < 0){
                    z = 8;
                    v = 1;
                }
                else {
                    v = 2;
                }
                
                return -v;
            }`,
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z)  {
                    pred_array.push({line:3,color:'${green_color}'});
                    v = 0;
                } 
                else if(a<0) {
                    pred_array.push({line:3,color:'${red_color}'});
                    pred_array.push({line:5,color:'${green_color}'});
                    z = 8;
                    v = 1;
                }   
                else {
                    pred_array.push({line:3,color:'${red_color}'});
                    pred_array.push({line:5,color:'${red_color}'});
                    pred_array.push({line:8,color:'${green_color}'});
                    v = 2;
                }              
                return -v;
            }`);
    });

    it('infering while exp correctly', () => {
        assert_eq_pred_inf(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                while (a < z) {
                    c = a + b;
                    z = c * z * 2;
                }
                
                return z;
            }`,
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                while (a < z) {
                    if(pred_array.length == 0 || pred_array.slice(-1)[0].line != 6)
                    {pred_array.push({line:6,color:'${green_color}'});}
                    c = a + b;
                    z = c * z * 2;
                }
                
                return z;
            }`);
    });

    it('infering while exp correctly2', () => {
        assert_eq_pred_inf(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                while (a < z)
                    c = a + b;
                z = c * z * 2;
                                
                return z;
            }`,
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                while (a < z) {
                    if(pred_array.length == 0 || pred_array.slice(-1)[0].line != 6)
                    {pred_array.push({line:6,color:'${green_color}'});}
                    c = a + b;
                }
                z = c * z * 2;
                
                return z;
            }`);
    });
});

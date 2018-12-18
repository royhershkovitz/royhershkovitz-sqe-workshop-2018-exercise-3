/* eslint-disable max-lines-per-function */
import assert from 'assert';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import {substitute, pred_infer} from '../src/js/symbolic_substitution';

function assert_eq_sub(left, right){
    assert.equal(
        escodegen.generate(substitute(esprima.parse(left))),
        escodegen.generate(           esprima.parse(right)));
}
describe('The javascript predicate substituier', () => {
    it('is substituting simple foo and let correctly', () => {
        assert_eq_sub(
            `function foo(){
                    let a = 5;
                    return a+2;
            }`,
            `function foo(){
                return 7;
            }`);
    });

    it('is substituting simple foo and let correctly2', () => {
        assert_eq_sub(
            `function foo(){
                    let a = 5, b = 10;
                    let c = 4 + b;
                    return a-c;
            }`,
            `function foo(){
                return -9;
            }`);
    });

    it('is substituting simple assignment correctly', () => {
        assert_eq_sub(
            `function foo(){
                    let a = 5, b = 10;
                    a = 4 + a;
                    return a*b;
            }`,
            `function foo(){
                return 90;
            }`);
    });

    it('is substituting simple member exp correctly', () => {
        assert_eq_sub(
            `function foo(){
                    let a = 5;
                    a = x[a];
                    return a + 2;
            }`,
            `function foo(){
                return x[5]+2;
            }`);
    });

    it('is substituting simple callee exp correctly', () => {
        assert_eq_sub(
            `function foo(){
                    let a = 5;
                    a = p(a);
                    return a/2;
                    function p(x){return x+3};
            }`,
            `function foo(){
                return p(5)/2;
                function p(x){return x+3};
            }`);
    });
    it('is substituting while exp correctly', () => {
        assert_eq_sub(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                while (a < z) {
                    c = a + b;
                    z = c * 2;
                }
                
                return z;
            }`,
            `function foo(x, y, z){
                while (x + 1 < z) 
                    z = (x + 1 + (x + 1 + y)) * 2;                
                return z;
            }`);
    });

    it('is removing not important while exp correctly', () => {
        assert_eq_sub(
            `function foo(x, y, z){                
                while (a < z) {
                    let v = 0;
                }
                let m = 2;
                return -m + z;
            }`,
            `function foo(x, y, z){               
                return -2 + z;
            }`);
    });

    it('is substituting if exp correctly', () => {
        assert_eq_sub(
            `function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 1;
                
                if (b < z) {
                    c = c + 5;
                    return x + y + z + c;
                } else if (b < z * 2) {
                    c = c + x + 5;
                    return x + y + z + c;
                } else {
                    c = c + z + 5;
                    return x + y + z + c;
                }
            }`,
            `function foo(x, y, z){
                if (x + 1 + y < z) 
                    return x + y + z + 6;
                else if (x + 1 + y < z * 2) 
                    return x + y + z + (1 + x + 5);
                else 
                    return x + y + z + (1 + z + 5);                
            }`);
    });

    it('is keeping if exp correctly', () => {
        assert_eq_sub(
            `function foo(z){   
                let a = -9 - 10, v;             
                if (a < z) 
                    v = 0;
                
                return -v;
            }`,
            `function foo(z){   
                let v;             
                if (-19 < z) 
                    v = 0;
                
                return -v;
            }`);
    });
});

function assert_eq_pred_inf(left, right){
    assert.equal(
        escodegen.generate(pred_infer(esprima.parse(
            escodegen.generate(substitute(esprima.parse(left))),{loc:true}))),
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
                let v;             
                if (-19 < z) {
                    pred_array.push({line:3,color:'MediumSeaGreen'});
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
                let v;             
                if (-19 < z) {
                    pred_array.push({line:3,color:'MediumSeaGreen'});
                    v = 0;
                } 
                else {
                    pred_array.push({line:3,color:'Tomato'});
                    pred_array.push({line:5,color:'MediumSeaGreen'});
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
                let v;             
                if (-19 < z) {
                    pred_array.push({line:3,color:'MediumSeaGreen'});
                    v = 0;
                } 
                else if(true) {
                    pred_array.push({line:3,color:'Tomato'});
                    pred_array.push({line:5,color:'MediumSeaGreen'});
                    z = 8;
                    v = 1;
                }   
                else {
                    pred_array.push({line:3,color:'Tomato'});
                    pred_array.push({line:5,color:'Tomato'});
                    pred_array.push({line:8,color:'MediumSeaGreen'});
                    v = 2;
                }              
                return -v;
            }`);
    });

    it('is substituting&not infering while exp correctly', () => {
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
                while (x + 1 < z) 
                    z = (x + 1 + (x + 1 + y)) * z * 2;                
                return z;
            }`);
    });
});

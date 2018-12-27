
export {make_links, make_statements};

import * as escodegen from 'escodegen';

function make_statements(cfg, pred_array){
    const out = [{'key':-1, 'category':'Start', 'loc':'175 0', 'text':'Start'}, {'key':-2, 'category':'End', 'loc':'175 660', 'text':'End'}], greens = [], reds = [];
    let i = 0; global_key = 0;
    const color_decision_func = color_decision(pred_array);
    cfg.forEach((node) => {
        parse_node(node,out,i,color_decision_func); i++;});
    greens.forEach(color_rest(cfg,out,'true'));    reds.forEach(color_rest(cfg,out,'false'));  color_rest(cfg,out,'')(0);
    //console.log(greens); console.log(reds); //console.log(out);
    return out;
    function color_decision(pred_array){
        return function (node, color) {
            //while(pred_array.length > 0 && pred_array[0].line < node.test.loc.start.line) pred_array.shift();
            if (pred_array.length > 0 && pred_array[0].line == node.test.loc.start.line) {
                color = pred_array.shift().color;
                if (color == '#027710') greens.push(i);
                else    reds.push(i);}
            return color;
        };
    }
}

let global_key;
function parse_node(node,out,i, color_decision) {
    let color = '#022020';
    if(node.type == 'decision') {
        color = color_decision(node, color);
        out.push({'key':i, 'text':'('+ ++global_key+')\n'+escodegen.generate(node.test), 'category':'Conditional', 'fill' : color});}
    else if(node.type == 'statements') {
        const str = escodegen.generate({type:'BlockStatement',body:node.body});
        out.push({'key':i, 'text':'('+ ++global_key+')\n'+str.substr(2,str.length-3), 'fill' : color});
    }
    else out.push({'key':i, 'category':'Merge', 'fill' : color});
}

function color_rest(cfg,out,json_enum) {
    return function(green){
        let key = json_enum == '' ? green : cfg[green][json_enum];
        let cfgobj = cfg[key];
        while(cfgobj != null && (out[key+2].fill == '#022020'|(cfgobj.type != 'decision' | cfgobj.while_flag))) {
            if (cfgobj.type == 'decision')  color_while();
            else{
                out[key+2].fill = '#227710';
                key = cfgobj.next;
            }
            cfgobj = cfg[key];
        }
        function color_while(){
            if(out[key+2].fill == '#022020') out[key+2].fill = '#6B0E01';
            key = cfgobj.false;
        }
    };
}

function make_links(cfg){
    const out = [{'from':-1, 'to':0, 'fromPort':'B', 'toPort':'T'},
        {'from':cfg.length-1, 'to':-2, 'fromPort':'B', 'toPort':'T'}];
    for(let i = 0; i<cfg.length; i++){
        const type = cfg[i].type;
        if(type == 'decision'){
            if(cfg[i].false != null)
                out.push({'from':i, 'to':cfg[i].false, 'fromPort':'B', 'toPort':'T', text: 'false', 'category':'ConditionalLink'});
            out.push({'from':i, 'to':cfg[i].true, 'fromPort':'B', 'toPort':'T', text: 'true', 'category':'ConditionalLink'});
        }
        else if(type == 'statements'|type == 'merge')    out.push({'from':i, 'to':cfg[i].next, 'fromPort':'B', 'toPort':'T'});
        else out.push({'from':i, 'to':-2, 'fromPort':'B', 'toPort':'T'});
    }
    //console.log(out);
    return out;
}
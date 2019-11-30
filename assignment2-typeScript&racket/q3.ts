import { map, zipWith } from "ramda";
import { CExp, Parsed, PrimOp, AppExp, LitExp, parseL3, isBoolExp, isNumExp, isExp, isVarRef, isVarDecl, Exp, Binding } from "./imp/L3-ast";
import { makeAppExp, makeDefineExp, makeIfExp, makeProcExp, makeProgram, makePrimOp, makeLetExp, makeBinding, makeLitExp } from "./imp/L3-ast";
import { isAppExp, isAtomicExp, isCExp, isDefineExp, isIfExp, isLetExp, isLitExp, isPrimOp, isProcExp, isProgram } from "./imp/L3-ast";
import {isError} from './imp/error';
import { makeEmptySExp, isEmptySExp, isCompoundSExp, makeCompoundSExp, isClosure, makeClosure } from "./imp/L3-value";
import {first, second, rest} from './imp/list';
import { setMaxListeners } from "cluster";


/*
Purpose: the following convert the received ast of L3 languagh to L30 languagh
so that every list replaced by concated cons structures
Signature: (exp:Parsed|Error):Parsed|Error
Type: (exp:Parsed|Error)=>Parsed|Error
*/

export const l3ToL30 = (exp: Parsed | Error): Parsed | Error  =>

   isExp(exp)?
   rewriteAll(exp) :
   isProgram(exp) ? 
   makeProgram(map(rewriteAll,exp.exps)) :
   Error("Unexpected expression " + exp);

   

export const rewriteAll = (cexp: Exp): Exp =>
    isDefineExp(cexp)?
    makeDefineExp(cexp.var,splitCExp(cexp.val)):
    isCExp(cexp)?
    splitCExp(cexp):
    cexp;


export const listToCons=(cexp: AppExp): AppExp|LitExp =>
     cexp.rands.length===0 ?
     makeLitExp(makeEmptySExp()):
     makeAppExp(makePrimOp("cons"),[splitCExp(first(cexp.rands)),splitCExp(makeAppExp(makePrimOp("list"),rest(cexp.rands)))]);
  

export const consToCons=(cexp: AppExp): AppExp|LitExp =>
 
    isAtomicExp(first(cexp.rands)) && isAtomicExp(second(cexp.rands)) ? cexp:
    !isAtomicExp(first(cexp.rands)) && isAtomicExp(second(cexp.rands)) ? makeAppExp(makePrimOp("cons"),[splitCExp(first(cexp.rands))].concat([second(cexp.rands)])):
    !isAtomicExp(first(cexp.rands)) && !isAtomicExp(second(cexp.rands)) ? makeAppExp(makePrimOp("cons"),[splitCExp(first(cexp.rands))].concat([splitCExp(second(cexp.rands))])):
    isAtomicExp(first(cexp.rands)) && !isAtomicExp(second(cexp.rands)) ? makeAppExp(makePrimOp("cons"),[first(cexp.rands)].concat([splitCExp(second(cexp.rands))])): cexp



export const isList=(cexp:PrimOp):boolean=>
    cexp.op==="list";

export const isCons=(cexp:PrimOp):boolean=>
    cexp.op==="cons";


export const splitCExp=(cexp:CExp):any=>
    isProcExp(cexp)?
    makeProcExp(cexp.args,map(splitCExp,cexp.body)):
    isAppExp(cexp)? splitApp(cexp):
    isLetExp(cexp)? 
    makeLetExp(map(splitBindings,cexp.bindings),map(splitCExp,cexp.body)):
    isLitExp(cexp)? splitLitExp(cexp):
    isIfExp(cexp)? makeIfExp(splitCExp(cexp.test),splitCExp(cexp.then),splitCExp(cexp.alt)):
    cexp;


export const splitApp=(cexp:AppExp):LitExp|AppExp=>
    isPrimOp(cexp.rator)&&isList(cexp.rator) ? 
    listToCons(cexp):
    isPrimOp(cexp.rator)&&isCons(cexp.rator) ?
    consToCons(cexp):
    isProcExp(cexp.rator) ?
    makeAppExp(makeProcExp(cexp.rator.args ,map(splitCExp, cexp.rator.body)),map(splitCExp, cexp.rands)):
    cexp; 

export const splitLitExp = (lit: LitExp): AppExp | LitExp => 
isCompoundSExp(lit.val) ? 
isEmptySExp(lit.val.val1) ? makeLitExp(makeEmptySExp()):
isCompoundSExp(lit.val.val1) ? 
makeAppExp(makePrimOp("cons"),[splitCExp(makeLitExp(lit.val.val1)), splitCExp(makeLitExp(lit.val.val2))]):
makeAppExp(makePrimOp("cons"),[makeLitExp(lit.val.val1), splitCExp(makeLitExp(lit.val.val2))]):
isClosure(lit) ? makeLitExp (makeClosure(lit.params, map(splitCExp,lit.body))):
lit 


export const splitBindings = (binding: Binding): Binding => 
      makeBinding(binding.var.var, splitCExp(binding.val))
  
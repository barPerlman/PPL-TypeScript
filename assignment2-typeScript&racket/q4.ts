import { map } from "ramda";
import { Parsed, AppExp, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isLitExp, isProcExp, isIfExp, isAppExp, isDefineExp, isLetExp, PrimOp, CExp, isStrExp } from './imp/L3-ast';
import {parsedToString} from './imp/L3-value';
import {isError} from './imp/error';

/*
Signature: l2ToPython(exp)
Purpose: To convert an L2 AST to an L2 program string.
Type: [Parsed | Error -> string | Error]
Example: (define x 5) should produce x = 5
Pre-conditions: the input must to be L2 AST
Post-condition: result = L2 program string.
Tests: (define x 5) ⇒ x = 5
*/
export const l2ToPython = (exp: Parsed | Error): string | Error =>
   isError(exp) ? exp.message :
   
   isProgram(exp) ? map(l2ToPython,exp.exps).join("\n") :
   
   isBoolExp(exp) ? (exp.val ? "True" : "False") :
   
   isNumExp(exp) ? exp.val.toString() :
   
   isVarRef(exp) ? exp.var :
   
   isPrimOp(exp) ? exp.op :

   isStrExp(exp) ? "'" + exp.val + "'" :
   
   isDefineExp(exp) ? exp.var.var + " = " +
                        l2ToPython(exp.val) :
   
   isProcExp(exp) ? "(lambda " +
                        map((p) => p.var, exp.args).join(", ") + ": " +
                        map(l2ToPython, exp.body).join(" ") +
                     ")" :
   
   isIfExp(exp) ? "(" + l2ToPython(exp.then) + " if " +
                        l2ToPython(exp.test) + " else " +
                        l2ToPython(exp.alt) +
                  ")" :
                  
   isAppExp(exp) ? assistentFuncAppExp(exp) :

   Error("Unknown expression: " + exp.tag);

   const assistentFuncAppExp = (exp : AppExp):string=>
    (!isPrimOp(exp.rator))?
        l2ToPython(exp.rator)+"("+ exp.rands.map(l2ToPython).join(",")+")":
        (exp.rator.op=="not")?
        "(not "+l2ToPython(exp.rands[0])+")":
        "(" +map(l2ToPython, exp.rands).join(" "+l2ToPython(exp.rator)+" ")+")";
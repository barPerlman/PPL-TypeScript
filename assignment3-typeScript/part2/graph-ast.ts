import { Graph } from "graphlib";
import dot = require("graphlib-dot");
import { length, map, range, zipWith } from "ramda";
import {
    AtomicExp, Exp, IfExp, Parsed, VarDecl, isAtomicExp, DefineExp, AppExp, ProcExp,
    isAppExp, isDefineExp, isExp, isIfExp, isProcExp, parse, unparse, isCExp, isProgram, isPrimOp, CExp, isNumExp, isBoolExp, isStrExp, isCompoundExp, CompoundExp, isVarDecl, VarRef, isLetExp, LetExp, Binding, isLitExp, LitExp, Program, PrimOp, isVarRef } from "./L4-ast";
import { isNumber, isBoolean, isString } from "./list";
import { SExp, isClosure, isSymbolSExp, isEmptySExp, Closure, SymbolSExp, CompoundSExp, isCompoundSExp } from "./L4-value";
import { safeF2, safeFL, safeF, isError } from "./error";

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

interface Tree {
    tag: "Tree",
    rootId: string,
    graph: Graph, 
}

export const isTree = (x: any): x is Tree => x.tag === "Tree";

const makeLeaf = (label: string): Tree => {
    let graph = new Graph();
    const headId = generateId();
    graph.setNode(headId, { label, shape: "record" });
    return { tag: "Tree", rootId: headId, graph };
}


const makeTree = (label: string, nodes: Tree[], edgesLabels: string[]): Tree => {
    let graph = new Graph();
    const headId = generateId();
    graph.setNode(headId, { label, shape: "record" });
    zipWith(
        (t, edgeLabel) => {
            map(n => graph.setNode(n, t.graph.node(n)), t.graph.nodes());
            map(e => graph.setEdge(e.v, e.w, t.graph.edge(e)), t.graph.edges());
            graph.setEdge(headId, t.rootId, {label: edgeLabel});
        },
        nodes,
        edgesLabels
    )
    return { tag: "Tree", rootId: headId, graph };
}

const astToDot = (ast: Tree): string => dot.write(ast.graph);

const expToTree = (exp: string) =>
    safeF(astToDot)(safeF(makeAST)(parse(exp)));

export const makeAST = (exp: Parsed): Tree | Error =>
    isExp(exp) ? convertExpToGraph(exp) :
    isProgram(exp) ? convertProgramToGraph(exp) :                                     
    isError(exp) ? Error("Error happend while creating the AST.") : exp;

export const convertExpToGraph = (exp: Exp): Tree | Error =>
    isDefineExp(exp) ? convertDefineExpToGraph(exp) :
    isCExp(exp) ? convertCExpToGraph(exp) :
    isError(exp) ? Error("Error happend while creating the AST.") : exp;

export const convertDefineExpToGraph = (exp: DefineExp): Tree | Error => {
    let res1 : Tree | Error = convertCExpToGraph(exp.val);
    if(isError(res1))
        return res1;
    else 
        return makeTree(exp.tag, [makeTree(exp.var.tag, [makeLeaf(exp.var.var)],["var"]), res1],["var","val"] );
}

export const convertVarDeclToGraph = (exp: VarDecl): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeLeaf(exp.var)], ["var"]);

export const convertVarRefGraph = (exp: VarRef): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeLeaf(exp.var)], ["var"]);

export const convertCExpToGraph = (exp: CExp): Tree |Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    isAtomicExp(exp) ? convertAtomicExpToGraph(exp) : convertCompoundExpToGraph(exp);

export const convertAtomicExpToGraph = (exp: AtomicExp): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    isPrimOp(exp) ? convertPrimOpToGraph(exp) :
    isNumExp(exp) ? makeTree(exp.tag, [makeLeaf(exp.val.toString())], ["val"]) :
    isBoolExp(exp) && exp.val ? makeTree(exp.tag,[makeLeaf("#t")],["val"]) :
    isBoolExp(exp) && !exp.val ? makeTree(exp.tag,[makeLeaf("#f")],["val"]) :
    isStrExp(exp) ?  makeTree(exp.tag, [makeLeaf(exp.val)], ["val"]) :
    isVarRef(exp) ? convertVarRefGraph(exp) :
    Error("Error happend while creating the AST.");
    
export const convertCompoundExpToGraph = (exp: CompoundExp): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    isAppExp(exp) ? convertAppExpToGraph(exp) :
    isIfExp(exp) ? convertIfExpToGraph(exp) :
    isProcExp(exp) ? convertProcExpToGraph(exp) :
    isLetExp(exp) ? convertLetExpToGraph(exp) :
    isLitExp(exp) ? convertLitExpToGraph(exp) :
    makeLeaf(""); // to the Letrec and Set cases

export const convertPrimOpToGraph = (exp: PrimOp): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    exp.op === ">" ? makeTree(exp.tag,[makeLeaf("\\>")],["op"]):
    exp.op === "<" ? makeTree(exp.tag,[makeLeaf("\\<")],["op"]):
    makeTree(exp.tag, [makeLeaf(exp.op)], ["op"]);

export const convertAppExpToGraph = (exp: AppExp): Tree | Error => {
    let res1 : Tree | Error = convertCExpToGraph(exp.rator);
    if (isError(res1))
        return res1;
    else 
        return makeTree(exp.tag, [res1 ,makeTree(":",map(convertCExpToGraph,exp.rands),Object.keys(exp.rands))],["rator","rands"] );
}

export const convertProcExpToGraph = (exp: ProcExp): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeTree (":", map(convertVarDeclToGraph,exp.args),Object.keys(exp.args)), makeTree (":", map(convertCExpToGraph,exp.body),Object.keys(exp.body))],["args", "body"]);

export const convertLetExpToGraph = (exp: LetExp): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeTree (":", map(convertBindingToGraph,exp.bindings),Object.keys(exp.bindings)), makeTree (":", map(convertCExpToGraph,exp.body),Object.keys(exp.body))],["binding", "body"]);

export const convertBindingToGraph = (exp: Binding): Tree | Error =>{
    let res1 : Tree | Error = convertVarDeclToGraph(exp.var);
    let res2 : Tree | Error = convertCExpToGraph(exp.val);
    if (isError(res1))
        return res1; // returns error
    else if (isError(res2))
        return res2; // returns error
    else 
        return makeTree(exp.tag,[res1,res2],["var", "val"]);
}

export const convertIfExpToGraph = (exp: IfExp): Tree | Error => {
    let res1 : Tree | Error = convertCExpToGraph(exp.test);
    let res2 : Tree | Error = convertCExpToGraph(exp.then);
    let res3 : Tree | Error = convertCExpToGraph(exp.alt);
    if (isError(res1))
        return res1; // returns error
    else if (isError(res2))
        return res2; // returns error
    else if (isError(res3))
        return res3 // returns error
    else 
        return makeTree(exp.tag, [res1 , res2, res3],["test", "then", "alt"] );
}

export const convertLitExpToGraph = (exp: LitExp): Tree | Error => {
    let res1 : Tree | Error = convertSExpToGraph(exp.val);
    if (isError(res1))
        return res1; // returns error
    else
        return makeTree(exp.tag, [res1], ["val"]);
}

export const convertSExpToGraph = (exp: SExp): Tree | Error => 
    isError(exp) ? Error("Error happend while creating the AST.") :
    isNumber(exp) ? makeLeaf(exp.toString()):
    isBoolean(exp) && exp ? makeLeaf("#t"):
    isBoolean(exp) && !exp ? makeLeaf("#f"):
    isPrimOp(exp) ? convertPrimOpToGraph(exp) :
    isClosure(exp) ? convertClosureToGraph(exp) :                             
    isSymbolSExp(exp) ? makeTree(exp.tag,[makeLeaf(exp.val)], ["val"]) :
    isString(exp) ? makeLeaf(exp) :
    isEmptySExp(exp) ? makeLeaf(exp.tag) : 
    isCompoundSExp(exp) ? convertCompoundSExpToGraph(exp) : 
    Error("Error happend while creating the AST.");

export const convertCompoundSExpToGraph = (exp: CompoundSExp): Tree | Error => {
    let res1 : Tree | Error = convertSExpToGraph(exp.val1);
    let res2 : Tree | Error = convertSExpToGraph(exp.val2);
    if (isError(res1))
        return res1; // returns error
    else if (isError(res2))
        return res2; // returns error
    else
        return makeTree(exp.tag, [res1, res2], ["val1", "val2"]);
}

export const convertClosureToGraph = (exp: Closure): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeTree(":", map(convertVarDeclToGraph,exp.params),Object.keys(exp.params)), makeTree(":",map(convertCExpToGraph,exp.body),Object.keys(exp.body))], 
        ["params", "body"]);

export const convertProgramToGraph = (exp: Program): Tree | Error =>
    isError(exp) ? Error("Error happend while creating the AST.") :
    makeTree(exp.tag, [makeTree (":", map(convertExpToGraph,exp.exps),Object.keys(exp.exps))],exp.exps.map(e=>"exps"));

// Tests. Please uncomment
//   const p1 = "(define x 4)";
//   console.log(expToTree(p1));

//   const p2 = "(define y (+ x 4))";
//   console.log(expToTree(p2));

//  const p3 = "(if #t (+ x 4) 6)";
//   console.log(expToTree(p3));

//   const p4 = "(lambda (x y) x)";
//   console.log(expToTree(p4));
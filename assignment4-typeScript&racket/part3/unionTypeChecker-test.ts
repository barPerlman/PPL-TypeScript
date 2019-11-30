// L5-typecheck
import { strict as assert } from 'assert';
import { L5typeof } from './L5-typecheck';
import { makeBoolTExp, makeNumTExp, makeProcTExp, makeTVar, makeVoidTExp, parseTE, unparseTExp , makeUnionTExp, makeStrTExp, parseTExp} from './TExp';

assert.deepEqual(unparseTExp(makeProcTExp([makeUnionTExp([makeBoolTExp(), makeStrTExp()])], makeUnionTExp([makeNumTExp(), makeBoolTExp()]))), "((boolean | string) -> (number | boolean))");
assert.deepEqual(unparseTExp(makeProcTExp([makeBoolTExp()], makeProcTExp([makeNumTExp()], makeStrTExp()))), "(boolean -> (number -> string))");
assert.deepEqual(parseTE("((number | boolean) -> void)"), makeProcTExp([makeUnionTExp([makeBoolTExp(), makeNumTExp()])], makeVoidTExp()));
assert.deepEqual(parseTE("((string | number | boolean) -> (number | boolean))"), makeProcTExp([makeUnionTExp([makeBoolTExp(), makeNumTExp(), makeStrTExp()])], makeUnionTExp([makeBoolTExp(), makeNumTExp()])));
assert.deepEqual(parseTE("(((string | boolean) | number) -> (number | boolean))"), makeProcTExp([makeUnionTExp([makeBoolTExp(), makeNumTExp(), makeStrTExp()])], makeUnionTExp([makeBoolTExp(), makeNumTExp()])));
assert.deepEqual(parseTE("((string | string | string | string) -> (boolean | boolean))"), makeProcTExp([makeUnionTExp([makeStrTExp()])], makeUnionTExp([makeBoolTExp()])));

assert.deepEqual(L5typeof("(if (> 3 1) 3 #f)"), "(boolean | number)");
assert.deepEqual(L5typeof("(if (> 3 1) 4 3)"), "number");
assert.deepEqual(L5typeof("(if (> 3 1) #f 3)"), "(boolean | number)");
assert.deepEqual(L5typeof("(if (> 3 1) #f #f)"), "boolean");
assert.deepEqual(L5typeof("(if (> 3 1) #t #t)"), "boolean");

// L5-typecheck
import { strict as assert } from 'assert';
import { checkCompatibleTypes } from './L5-typecheck';
import { makeBoolTExp, makeNumTExp, makeProcTExp, makeTVar, makeVoidTExp, parseTE, unparseTExp, makeUnionTExp } from './TExp';

assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeNumTExp()),    false);
assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeProcTExp([makeBoolTExp()],makeBoolTExp())),    false);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeBoolTExp()]), makeNumTExp()),    false);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp()]), makeBoolTExp()),    false);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeBoolTExp()]),makeProcTExp([makeBoolTExp()],makeBoolTExp())),    false);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp()],makeBoolTExp()), makeNumTExp()),    false);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp()],makeBoolTExp()), makeBoolTExp()),    false);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp()],makeVoidTExp()),makeProcTExp([makeNumTExp(),makeBoolTExp()],makeVoidTExp())),false);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(),makeNumTExp()],makeNumTExp()),makeProcTExp([makeBoolTExp()],makeBoolTExp())),    false);

assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeBoolTExp()),   true);
assert.deepEqual(checkCompatibleTypes(makeNumTExp(), makeNumTExp()),   true);
assert.deepEqual(checkCompatibleTypes(makeVoidTExp(), makeVoidTExp()),   true);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeNumTExp(),makeBoolTExp()],makeVoidTExp()),makeProcTExp([makeNumTExp(),makeBoolTExp()],makeVoidTExp())),true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(),makeBoolTExp()]),makeUnionTExp([makeBoolTExp()])),    true);
assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeUnionTExp([makeBoolTExp()])),true);
assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeUnionTExp([makeNumTExp(),makeBoolTExp()])),true);
assert.deepEqual(checkCompatibleTypes(makeNumTExp(), makeUnionTExp([makeNumTExp(),makeBoolTExp()])),true);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(),makeNumTExp()],makeVoidTExp()),makeProcTExp([makeBoolTExp(),makeNumTExp()],makeVoidTExp())),true);

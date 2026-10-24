import test from 'node:test';
import assert from 'node:assert/strict';
import { RulesEngineProvider } from '../src/lib/intelligence';
const rules=new RulesEngineProvider();
test('staffing uses workload and rounds up, rather than a fixed headcount',()=>{assert.equal(rules.staffing(31,5,2).count,4);assert.equal(rules.staffing(10,5,2).count,1)});
test('problem structure separates reported observations from assumptions',()=>{const result=rules.structure({observation:'Residents report food waste',affected:'Market vendors',city:'Pune',frequency:'Weekly',existing:'Collection service',assumptions:'Disposal is inconsistent',unknowns:'How much is recoverable?',outcome:'Reduced unmanaged waste',cause:'environment'});assert.ok(result.known.includes('Residents report food waste'));assert.deepEqual(result.assumptions,['Disposal is inconsistent']);assert.ok(result.questions.includes('How much is recoverable?'));assert.equal(result.sdg,12)});
